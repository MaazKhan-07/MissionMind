"""
MissionMind LLM Client
======================
Provider-abstracted LLM interface.

Implements Section 18 of the specification:
  - LLMClient with generate_structured_answer()
  - Provider abstraction (hosted / ollama)
  - Temperature = 0 for reproducibility
  - Invalid JSON recovery (retry once, then abstain)

The rest of the backend does NOT care which model is being used.
"""

from __future__ import annotations

import json
import logging
import sys
from abc import ABC, abstractmethod
from typing import Any, Optional

from app.config import (
    LLM_API_KEY,
    LLM_BASE_URL,
    LLM_MODEL,
    LLM_PROVIDER,
    LLM_TEMPERATURE,
)
from app.schemas import MissionMindAnswer

# Add project root to path for ai.prompts imports
from pathlib import Path
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from ai.prompts.system_prompt import SYSTEM_PROMPT

logger = logging.getLogger("missionmind.llm")


# ═══════════════════════════════════════════════════════════════════════════
# Abstract LLM Provider
# ═══════════════════════════════════════════════════════════════════════════

class BaseLLMProvider(ABC):
    """Abstract interface for LLM providers."""

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.0,
    ) -> str:
        """Generate a raw string response from the LLM."""
        ...


# ═══════════════════════════════════════════════════════════════════════════
# Google Gemini Provider (hosted)
# ═══════════════════════════════════════════════════════════════════════════

class GeminiProvider(BaseLLMProvider):
    """Google Gemini API provider."""

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.model = model
        self._client = None

    def _get_client(self):
        if self._client is None:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.0,
    ) -> str:
        from google.genai import types
        client = self._get_client()

        response = client.models.generate_content(
            model=self.model,
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=temperature,
                response_mime_type="application/json",
            ),
        )
        return response.text


# ═══════════════════════════════════════════════════════════════════════════
# Ollama Provider (local)
# ═══════════════════════════════════════════════════════════════════════════

class OllamaProvider(BaseLLMProvider):
    """Ollama local model provider."""

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model: str = "llama3",
    ):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.0,
    ) -> str:
        import httpx

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "stream": False,
                    "options": {"temperature": temperature},
                    "format": "json",
                },
            )
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")


# ═══════════════════════════════════════════════════════════════════════════
# LLM Client — Main Interface
# ═══════════════════════════════════════════════════════════════════════════

class LLMClient:
    """
    High-level LLM client used by the rest of the backend.

    Implements:
      - Provider abstraction
      - Structured answer generation
      - Invalid JSON recovery (Section 17)
      - Deterministic temperature
    """

    def __init__(self, provider: Optional[BaseLLMProvider] = None):
        if provider:
            self.provider = provider
        else:
            self.provider = self._create_default_provider()
        self.system_prompt = SYSTEM_PROMPT
        self.temperature = LLM_TEMPERATURE

    @staticmethod
    def _create_default_provider() -> BaseLLMProvider:
        """Create provider from environment configuration."""
        if LLM_PROVIDER == "ollama":
            return OllamaProvider(
                base_url=LLM_BASE_URL or "http://localhost:11434",
                model=LLM_MODEL,
            )
        else:
            # Default: hosted (Gemini)
            return GeminiProvider(
                api_key=LLM_API_KEY,
                model=LLM_MODEL,
            )

    async def generate_structured_answer(
        self,
        query: str,
        records: list[dict[str, Any]],
        prompt_text: str,
    ) -> MissionMindAnswer:
        """
        Generate a structured, validated MissionMind answer.

        Implements the Invalid JSON Recovery protocol (Section 17):
          1. First attempt to generate + parse
          2. If invalid, retry once with validation error
          3. If second attempt fails, ABSTAIN

        Args:
            query: The user's original query
            records: Retrieved mission records
            prompt_text: Pre-built prompt from prompt_builder

        Returns:
            MissionMindAnswer — parsed and validated
        """
        # --- Attempt 1 ---
        first_error_msg = ""
        try:
            raw_output = await self.provider.generate(
                system_prompt=self.system_prompt,
                user_message=prompt_text,
                temperature=self.temperature,
            )
            return self._parse_answer(raw_output)

        except (json.JSONDecodeError, Exception) as first_error:
            first_error_msg = str(first_error)
            logger.warning(
                "First LLM attempt failed: %s — retrying", first_error_msg
            )

        # --- Attempt 2: Retry with error context ---
        try:
            retry_prompt = (
                f"{prompt_text}\n\n"
                f"PREVIOUS ATTEMPT FAILED WITH ERROR: {first_error_msg}\n"
                f"Return ONLY valid JSON matching the output schema. "
                f"No markdown. No extra text. No code fences."
            )
            raw_output = await self.provider.generate(
                system_prompt=self.system_prompt,
                user_message=retry_prompt,
                temperature=self.temperature,
            )
            return self._parse_answer(raw_output)

        except Exception as second_error:
            logger.error(
                "Second LLM attempt failed: %s — abstaining", str(second_error)
            )
            # Abstain per Section 17
            return MissionMindAnswer(
                abstain=True,
                abstain_reason="Model output could not be validated.",
                missing_data=[],
            )

    async def generate_raw(self, prompt_text: str) -> str:
        """Generate raw LLM output (for debugging / audit)."""
        return await self.provider.generate(
            system_prompt=self.system_prompt,
            user_message=prompt_text,
            temperature=self.temperature,
        )

    def _parse_answer(self, raw: str) -> MissionMindAnswer:
        """Parse raw LLM output into MissionMindAnswer."""
        # Strip markdown code fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            # Remove opening fence
            first_newline = cleaned.index("\n")
            cleaned = cleaned[first_newline + 1:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        data = json.loads(cleaned)
        return MissionMindAnswer.model_validate(data)


# ═══════════════════════════════════════════════════════════════════════════
# Singleton accessor
# ═══════════════════════════════════════════════════════════════════════════

_llm_client: Optional[LLMClient] = None


def get_llm_client() -> LLMClient:
    """Get or create the singleton LLM client."""
    global _llm_client
    if _llm_client is None:
        _llm_client = LLMClient()
    return _llm_client
