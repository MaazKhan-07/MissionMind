"""
Tests for MissionMind LLM Client
==================================
Tests JSON parsing, recovery, and provider abstraction.
"""

import json
import pytest
from app.llm import LLMClient, BaseLLMProvider
from app.schemas import MissionMindAnswer


# ═══════════════════════════════════════════════════════════════════════════
# Mock LLM Provider
# ═══════════════════════════════════════════════════════════════════════════

class MockLLMProvider(BaseLLMProvider):
    """A mock provider that returns pre-configured responses."""

    def __init__(self, response: str, fail_first: bool = False):
        self.response = response
        self.fail_first = fail_first
        self._call_count = 0

    async def generate(self, system_prompt, user_message, temperature=0.0):
        self._call_count += 1
        if self.fail_first and self._call_count == 1:
            return "NOT VALID JSON {"
        return self.response


# ═══════════════════════════════════════════════════════════════════════════
# Tests
# ═══════════════════════════════════════════════════════════════════════════

class TestLLMClient:
    @pytest.mark.asyncio
    async def test_valid_json_parse(self):
        """Valid JSON response is parsed correctly."""
        response = json.dumps({
            "abstain": False,
            "abstain_reason": None,
            "missing_data": [],
            "facts": [
                {"statement": "Voltage was 23.8 V.", "citations": ["T-19281"]}
            ],
            "inferences": [],
            "recommendations": [],
        })
        provider = MockLLMProvider(response)
        client = LLMClient(provider=provider)

        answer = await client.generate_structured_answer(
            query="test", records=[], prompt_text="test"
        )
        assert isinstance(answer, MissionMindAnswer)
        assert answer.abstain is False
        assert len(answer.facts) == 1
        assert answer.facts[0].citations == ["T-19281"]

    @pytest.mark.asyncio
    async def test_markdown_fenced_json(self):
        """JSON wrapped in markdown code fences is handled."""
        raw = json.dumps({
            "abstain": True,
            "abstain_reason": "No evidence.",
            "missing_data": ["gyroscope data"],
            "facts": [],
            "inferences": [],
            "recommendations": [],
        })
        response = f"```json\n{raw}\n```"
        provider = MockLLMProvider(response)
        client = LLMClient(provider=provider)

        answer = await client.generate_structured_answer(
            query="test", records=[], prompt_text="test"
        )
        assert answer.abstain is True
        assert "gyroscope data" in answer.missing_data

    @pytest.mark.asyncio
    async def test_invalid_json_recovery(self):
        """Invalid JSON on first attempt → retry → succeed."""
        valid_response = json.dumps({
            "abstain": False,
            "facts": [{"statement": "Test.", "citations": ["T-1"]}],
            "inferences": [],
            "recommendations": [],
        })
        provider = MockLLMProvider(valid_response, fail_first=True)
        client = LLMClient(provider=provider)

        answer = await client.generate_structured_answer(
            query="test", records=[], prompt_text="test"
        )
        # Should succeed on retry
        assert answer.abstain is False
        assert provider._call_count == 2

    @pytest.mark.asyncio
    async def test_double_failure_abstains(self):
        """Both attempts fail → abstain."""

        class AlwaysFailProvider(BaseLLMProvider):
            async def generate(self, system_prompt, user_message, temperature=0.0):
                return "COMPLETELY INVALID {{{"

        client = LLMClient(provider=AlwaysFailProvider())
        answer = await client.generate_structured_answer(
            query="test", records=[], prompt_text="test"
        )
        assert answer.abstain is True
        assert "could not be validated" in answer.abstain_reason

    @pytest.mark.asyncio
    async def test_abstain_response(self):
        """Proper abstain response is parsed."""
        response = json.dumps({
            "abstain": True,
            "abstain_reason": "No relevant records found.",
            "missing_data": ["gyroscope bias telemetry", "day 3 calibration record"],
            "facts": [],
            "inferences": [],
            "recommendations": [],
        })
        provider = MockLLMProvider(response)
        client = LLMClient(provider=provider)

        answer = await client.generate_structured_answer(
            query="test", records=[], prompt_text="test"
        )
        assert answer.abstain is True
        assert len(answer.missing_data) == 2
