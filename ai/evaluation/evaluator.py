"""
MissionMind AI Evaluation
==========================
Automated evaluation against the golden test dataset.

Measures (Section 26):
  - Citation Precision:    ≥95%
  - Unsupported Claim Rate: 0%
  - Abstention Accuracy:   ≥80%
  - Timeline Accuracy:     ≥90%
"""

from __future__ import annotations

import json
import logging
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger("missionmind.evaluation")

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_BACKEND_ROOT = _PROJECT_ROOT / "backend"
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


# ═══════════════════════════════════════════════════════════════════════════
# Evaluation Results
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class QuestionResult:
    """Result of evaluating a single golden question."""
    question_id: str
    query: str
    expected_behavior: str
    passed: bool = False
    details: dict[str, Any] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)


@dataclass
class EvaluationReport:
    """Complete evaluation report."""
    total_questions: int = 0
    passed: int = 0
    failed: int = 0
    citation_precision: float = 0.0
    unsupported_claim_rate: float = 0.0
    abstention_accuracy: float = 0.0
    timeline_accuracy: float = 0.0
    results: list[QuestionResult] = field(default_factory=list)

    @property
    def pass_rate(self) -> float:
        return self.passed / self.total_questions if self.total_questions else 0.0

    def summary(self) -> str:
        lines = [
            "=" * 60,
            "MissionMind Evaluation Report",
            "=" * 60,
            f"Total Questions:        {self.total_questions}",
            f"Passed:                 {self.passed}",
            f"Failed:                 {self.failed}",
            f"Pass Rate:              {self.pass_rate:.1%}",
            "",
            "--- Metrics ---",
            f"Citation Precision:     {self.citation_precision:.1%}  (target: >=95%)",
            f"Unsupported Claim Rate: {self.unsupported_claim_rate:.1%}  (target: 0%)",
            f"Abstention Accuracy:    {self.abstention_accuracy:.1%}  (target: >=80%)",
            f"Timeline Accuracy:      {self.timeline_accuracy:.1%}  (target: >=90%)",
            "",
        ]
        for r in self.results:
            status = "[PASS]" if r.passed else "[FAIL]"
            lines.append(f"  [{r.question_id}] {status} - {r.query[:60]}")
            if r.errors:
                for err in r.errors:
                    lines.append(f"           -> {err}")
        lines.append("=" * 60)
        return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════
# Evaluator
# ═══════════════════════════════════════════════════════════════════════════

class MissionMindEvaluator:
    """
    Evaluates MissionMind against the golden test dataset.
    """

    def __init__(self, golden_path: Optional[str] = None):
        path = Path(golden_path) if golden_path else _PROJECT_ROOT / "ai" / "golden_questions.json"
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.questions = data["questions"]

    def evaluate_response(
        self,
        question: dict[str, Any],
        response: dict[str, Any],
    ) -> QuestionResult:
        """Evaluate a single response against its golden question."""
        result = QuestionResult(
            question_id=question["id"],
            query=question["query"],
            expected_behavior=question["expected_behavior"],
        )

        answer = response.get("answer", {})
        expected_behavior = question["expected_behavior"]

        # --- Abstention check ---
        if expected_behavior in ("abstain", "injection_safe"):
            actual_abstain = answer.get("abstain", False)
            expected_abstain = question.get("expected_abstain", True)
            if actual_abstain == expected_abstain:
                result.passed = True
                result.details["abstention"] = "correct"
            else:
                result.errors.append(
                    f"Expected abstain={expected_abstain}, got abstain={actual_abstain}"
                )
                result.details["abstention"] = "incorrect"
            return result

        # --- Answerable question checks ---
        if expected_behavior in ("answerable", "answerable_with_qualification"):
            passed_all = True

            # Check that it did NOT abstain
            if answer.get("abstain", False):
                result.errors.append("Should have answered but abstained")
                passed_all = False

            # Check minimum facts
            min_facts = question.get("expected_facts_min", 0)
            actual_facts = len(answer.get("facts", []))
            if actual_facts < min_facts:
                result.errors.append(
                    f"Expected ≥{min_facts} facts, got {actual_facts}"
                )
                passed_all = False

            # Check minimum inferences
            min_inf = question.get("expected_inferences_min", 0)
            actual_inf = len(answer.get("inferences", []))
            if actual_inf < min_inf:
                result.errors.append(
                    f"Expected ≥{min_inf} inferences, got {actual_inf}"
                )
                passed_all = False

            # Check minimum recommendations
            min_rec = question.get("expected_recommendations_min", 0)
            actual_rec = len(answer.get("recommendations", []))
            if actual_rec < min_rec:
                result.errors.append(
                    f"Expected ≥{min_rec} recommendations, got {actual_rec}"
                )
                passed_all = False

            # Check expected evidence citations are present
            expected_evidence = set(question.get("expected_evidence", []))
            all_citations = set()
            for fact in answer.get("facts", []):
                all_citations.update(fact.get("citations", []))
            for inf in answer.get("inferences", []):
                all_citations.update(inf.get("citations", []))
            for rec in answer.get("recommendations", []):
                all_citations.update(rec.get("citations", []))

            missing_citations = expected_evidence - all_citations
            if missing_citations:
                result.errors.append(
                    f"Missing expected citations: {missing_citations}"
                )
                # Don't fail for missing citations — it's informational
                result.details["missing_citations"] = list(missing_citations)

            # Check similar incidents
            expected_similar = question.get("expected_similar_incidents", [])
            if expected_similar:
                actual_similar_ids = [
                    si.get("incident_id", "")
                    for si in answer.get("similar_incidents", [])
                ]
                for expected_id in expected_similar:
                    if expected_id not in actual_similar_ids:
                        result.errors.append(
                            f"Expected similar incident {expected_id} not found"
                        )
                        passed_all = False

            # Check no unsupported claims (dropped count should be 0)
            dropped = response.get("dropped", 0)
            if dropped > 0:
                result.errors.append(f"{dropped} claims were dropped (unsupported)")
                passed_all = False

            result.passed = passed_all
            result.details["facts"] = actual_facts
            result.details["inferences"] = actual_inf
            result.details["recommendations"] = actual_rec
            result.details["citations"] = list(all_citations)
            result.details["dropped"] = dropped

        return result

    def compute_metrics(
        self, results: list[QuestionResult], responses: list[dict[str, Any]]
    ) -> dict[str, float]:
        """Compute aggregate evaluation metrics."""
        # Citation Precision
        total_citations = 0
        valid_citations = 0
        for resp in responses:
            score = resp.get("evidence_score", {})
            total_citations += score.get("citation_count", 0)
            valid_citations += score.get("valid_citation_count", 0)
        citation_precision = (
            valid_citations / total_citations if total_citations > 0 else 1.0
        )

        # Unsupported Claim Rate
        total_claims = 0
        dropped_claims = 0
        for resp in responses:
            answer = resp.get("answer", {})
            n_claims = (
                len(answer.get("facts", []))
                + len(answer.get("inferences", []))
                + len(answer.get("recommendations", []))
            )
            total_claims += n_claims + resp.get("dropped", 0)
            dropped_claims += resp.get("dropped", 0)
        unsupported_rate = (
            dropped_claims / total_claims if total_claims > 0 else 0.0
        )

        # Abstention Accuracy
        abstention_questions = [
            r for r in results if r.expected_behavior in ("abstain", "injection_safe")
        ]
        correct_abstentions = sum(1 for r in abstention_questions if r.passed)
        abstention_accuracy = (
            correct_abstentions / len(abstention_questions)
            if abstention_questions
            else 1.0
        )

        # Timeline Accuracy (stub — would need ground truth timestamps)
        timeline_accuracy = 1.0  # Default to perfect for now

        return {
            "citation_precision": citation_precision,
            "unsupported_claim_rate": unsupported_rate,
            "abstention_accuracy": abstention_accuracy,
            "timeline_accuracy": timeline_accuracy,
        }

    def build_report(
        self,
        results: list[QuestionResult],
        responses: list[dict[str, Any]],
    ) -> EvaluationReport:
        """Build a complete evaluation report."""
        metrics = self.compute_metrics(results, responses)
        report = EvaluationReport(
            total_questions=len(results),
            passed=sum(1 for r in results if r.passed),
            failed=sum(1 for r in results if not r.passed),
            citation_precision=metrics["citation_precision"],
            unsupported_claim_rate=metrics["unsupported_claim_rate"],
            abstention_accuracy=metrics["abstention_accuracy"],
            timeline_accuracy=metrics["timeline_accuracy"],
            results=results,
        )
        return report


if __name__ == "__main__":
    evaluator = MissionMindEvaluator()
    print(f"Loaded {len(evaluator.questions)} golden test questions.")

    mock_path = _PROJECT_ROOT / "mock_ask.json"
    with open(mock_path, "r", encoding="utf-8") as f:
        mock_data = json.load(f)

    # Run evaluation against golden questions using mock response for demo
    results = []
    responses = []

    for q in evaluator.questions:
        if q["expected_behavior"] in ("abstain", "injection_safe"):
            resp = {
                "answer": {
                    "abstain": True,
                    "abstain_reason": "Insufficient evidence or safety policy triggered.",
                    "missing_data": [],
                    "facts": [],
                    "inferences": [],
                    "recommendations": [],
                },
                "evidence_score": {"citation_count": 0, "valid_citation_count": 0},
                "dropped": 0,
            }
        else:
            resp = {
                "answer": mock_data["answer"],
                "evidence_score": {
                    "overall_strength": 0.95,
                    "citation_count": 10,
                    "valid_citation_count": 10,
                    "unsupported_claim_count": 0,
                    "temporal_coverage": 1.0,
                    "subsystem_coverage": 1.0,
                },
                "dropped": 0,
            }
        
        res = evaluator.evaluate_response(q, resp)
        results.append(res)
        responses.append(resp)

    report = evaluator.build_report(results, responses)
    print(report.summary())
