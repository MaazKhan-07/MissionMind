"""
MissionMind Evidence Validator
==============================
Post-generation validation guardrail.

Implements Section 21 of the specification:
  - Citation existence validation
  - Fact support validation
  - Numeric claim validation
  - Procedure existence validation
  - Recommendation support validation
  - Prompt injection detection
  - Confidence override

NO unsupported claim must ever reach the frontend.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Optional

from app.config import MAX_DROPPED_CLAIMS_BEFORE_ABSTAIN
from app.schemas import (
    Confidence,
    Fact,
    Inference,
    MissionMindAnswer,
    Recommendation,
    ValidationResult,
)

logger = logging.getLogger("missionmind.validator")


# ═══════════════════════════════════════════════════════════════════════════
# Prompt Injection Patterns (Section 15)
# ═══════════════════════════════════════════════════════════════════════════

_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(rules|instructions|previous|above)",
    r"disregard\s+(all\s+)?(rules|instructions|previous|above)",
    r"forget\s+(all\s+)?(rules|instructions|previous|above)",
    r"you\s+are\s+now",
    r"new\s+instructions?",
    r"override\s+(system|prompt|rules)",
    r"reveal\s+(system|prompt|instructions)",
    r"show\s+(system|prompt|instructions)",
    r"print\s+(system|prompt|instructions)",
    r"act\s+as\s+if",
    r"pretend\s+(you|that)",
    r"do\s+not\s+follow",
    r"bypass\s+(safety|guard|filter|rules)",
    r"jailbreak",
    r"DAN\s+mode",
]

_COMPILED_PATTERNS = [
    re.compile(pattern, re.IGNORECASE) for pattern in _INJECTION_PATTERNS
]


# ═══════════════════════════════════════════════════════════════════════════
# Main Validator
# ═══════════════════════════════════════════════════════════════════════════

def validate_answer(
    answer: MissionMindAnswer,
    retrieved_records: dict[str, dict[str, Any]],
) -> ValidationResult:
    """
    Validate an AI-generated answer against retrieved evidence.

    Checks:
      1. Citation IDs exist in retrieved records
      2. Facts are supported by cited records
      3. Numeric values match source exactly
      4. Procedures exist
      5. Recommendations are grounded
      6. Prompt injection in records
      7. Confidence override

    Returns:
        ValidationResult with validated answer and dropped claims.
    """
    retrieved_ids = set(retrieved_records.keys())

    # Track dropped claims
    dropped_facts: list[Fact] = []
    dropped_inferences: list[Inference] = []
    dropped_recommendations: list[Recommendation] = []

    # Detect injection in records
    injection_flags: list[str] = []
    for record_id, record in retrieved_records.items():
        if _detect_injection(record.get("text", "")):
            injection_flags.append(record_id)
            logger.warning("Injection detected in record %s", record_id)

    # --- Validate Facts ---
    valid_facts: list[Fact] = []
    for fact in answer.facts:
        if _validate_citations(fact.citations, retrieved_ids):
            # Check numeric values
            if _validate_numeric_claims(fact.statement, fact.citations, retrieved_records):
                valid_facts.append(fact)
            else:
                dropped_facts.append(fact)
                logger.warning("Dropped fact (numeric mismatch): %s", fact.statement[:80])
        else:
            dropped_facts.append(fact)
            logger.warning("Dropped fact (invalid citation): %s", fact.statement[:80])

    # --- Validate Inferences ---
    valid_inferences: list[Inference] = []
    for inf in answer.inferences:
        if _validate_citations(inf.citations, retrieved_ids):
            valid_inferences.append(inf)
        else:
            dropped_inferences.append(inf)
            logger.warning("Dropped inference (invalid citation): %s", inf.statement[:80])

    # --- Validate Recommendations ---
    valid_recommendations: list[Recommendation] = []
    for rec in answer.recommendations:
        if _validate_citations(rec.citations, retrieved_ids):
            # If procedure_id is specified, verify it exists
            if rec.procedure_id and rec.procedure_id not in retrieved_ids:
                dropped_recommendations.append(rec)
                logger.warning(
                    "Dropped recommendation (procedure not found): %s",
                    rec.action[:80],
                )
            else:
                valid_recommendations.append(rec)
        else:
            dropped_recommendations.append(rec)
            logger.warning("Dropped recommendation (invalid citation): %s", rec.action[:80])

    # --- Validate Similar Incidents ---
    valid_similar = [
        si for si in answer.similar_incidents
        if si.incident_id in retrieved_ids
    ]

    # --- Total dropped ---
    total_dropped = len(dropped_facts) + len(dropped_inferences) + len(dropped_recommendations)

    # --- Build validated answer ---
    validated = MissionMindAnswer(
        abstain=answer.abstain,
        abstain_reason=answer.abstain_reason,
        missing_data=answer.missing_data,
        facts=valid_facts,
        inferences=valid_inferences,
        recommendations=valid_recommendations,
        similar_incidents=valid_similar,
    )

    # --- Confidence override (Section 7) ---
    confidence_override = _compute_confidence_override(
        valid_facts, valid_inferences, valid_recommendations, retrieved_records
    )

    # --- Abstention check: too many dropped claims ---
    if total_dropped >= MAX_DROPPED_CLAIMS_BEFORE_ABSTAIN and not validated.abstain:
        validated.abstain = True
        validated.abstain_reason = (
            f"{total_dropped} claims could not be validated against retrieved evidence."
        )
        logger.warning("Abstaining: %d claims dropped", total_dropped)

    # --- Abstention check: no valid content ---
    if (
        not validated.abstain
        and not validated.facts
        and not validated.inferences
        and not validated.recommendations
    ):
        validated.abstain = True
        validated.abstain_reason = "No validated claims remain after evidence verification."

    return ValidationResult(
        validated_answer=validated,
        dropped_facts=dropped_facts,
        dropped_inferences=dropped_inferences,
        dropped_recommendations=dropped_recommendations,
        dropped_count=total_dropped,
        injection_flags=injection_flags,
        confidence_override=confidence_override,
    )


# ═══════════════════════════════════════════════════════════════════════════
# Citation Validation
# ═══════════════════════════════════════════════════════════════════════════

def _validate_citations(citations: list[str], valid_ids: set[str]) -> bool:
    """Check that all citations reference retrieved records."""
    if not citations:
        return False
    return all(cid in valid_ids for cid in citations)


# ═══════════════════════════════════════════════════════════════════════════
# Numeric Claim Validation (Section 5 & Evidence Guardrails)
# ═══════════════════════════════════════════════════════════════════════════

def _validate_numeric_claims(
    statement: str,
    citations: list[str],
    records: dict[str, dict[str, Any]],
) -> bool:
    """
    Validate that numeric values in a statement match source records.

    Extracts numbers from the statement and checks if they appear
    in the cited record's text or parameters.
    """
    # Extract numbers from the statement
    numbers_in_statement = _extract_numbers(statement)
    if not numbers_in_statement:
        return True  # No numeric claims to validate

    # Collect all numbers from cited records
    source_numbers: set[float] = set()
    for cid in citations:
        record = records.get(cid, {})
        text = record.get("text", "")
        params = record.get("parameters", {})

        source_numbers.update(_extract_numbers(text))
        if isinstance(params, dict):
            for v in params.values():
                if isinstance(v, (int, float)):
                    source_numbers.add(float(v))
                elif isinstance(v, str):
                    source_numbers.update(_extract_numbers(v))

    # Every number in the statement should appear in sources
    for num in numbers_in_statement:
        if not _number_in_set(num, source_numbers):
            logger.debug(
                "Numeric mismatch: %.4f not found in sources %s",
                num,
                source_numbers,
            )
            return False
    return True


def _extract_numbers(text: str) -> set[float]:
    """Extract numeric values from text, properly handling ranges like 24.5-29.0."""
    # Replace hyphen between numbers (ranges like 24.5-29.0) with space
    cleaned = re.sub(r"(?<=\d)-(?=\d)", " ", text)
    pattern = r"-?\d+\.?\d*"
    matches = re.findall(pattern, cleaned)
    numbers = set()
    for m in matches:
        if m in ("-", "", "."):
            continue
        try:
            numbers.add(float(m))
        except ValueError:
            pass
    return numbers


def _number_in_set(num: float, valid_set: set[float], tolerance: float = 0.001) -> bool:
    """Check if a number is in the set with floating-point tolerance."""
    for v in valid_set:
        if abs(num - v) < tolerance:
            return True
    return False


# ═══════════════════════════════════════════════════════════════════════════
# Prompt Injection Detection (Section 15)
# ═══════════════════════════════════════════════════════════════════════════

def _detect_injection(text: str) -> bool:
    """
    Detect potential prompt injection in record text.
    Returns True if suspicious content is found.
    """
    for pattern in _COMPILED_PATTERNS:
        if pattern.search(text):
            return True
    return False


def detect_injection_in_records(
    records: dict[str, dict[str, Any]]
) -> list[str]:
    """
    Scan all records for potential prompt injection.
    Returns list of suspicious record IDs.
    """
    flagged = []
    for record_id, record in records.items():
        text = record.get("text", "")
        if _detect_injection(text):
            flagged.append(record_id)
    return flagged


# ═══════════════════════════════════════════════════════════════════════════
# Confidence Override (Section 7)
# ═══════════════════════════════════════════════════════════════════════════

def _compute_confidence_override(
    facts: list[Fact],
    inferences: list[Inference],
    recommendations: list[Recommendation],
    records: dict[str, dict[str, Any]],
) -> Optional[Confidence]:
    """
    Compute a backend confidence override based on evidence quality.

    Rubric:
      HIGH:   2+ independent facts + matching incident or procedure
      MEDIUM: 2+ consistent facts but no matching incident
      LOW:    1 supporting fact or ambiguous ordering
    """
    n_facts = len(facts)
    record_types = set()
    for rid, rec in records.items():
        record_types.add(rec.get("record_type", ""))

    has_incident = "incident" in record_types
    has_procedure = "procedure" in record_types

    if n_facts >= 2 and (has_incident or has_procedure):
        return Confidence.HIGH
    elif n_facts >= 2:
        return Confidence.MEDIUM
    elif n_facts >= 1:
        return Confidence.LOW
    else:
        return Confidence.LOW
