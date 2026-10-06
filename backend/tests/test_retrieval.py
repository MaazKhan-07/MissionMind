"""
Tests for MissionMind Retrieval Engine
=======================================
Tests SQL retrieval, FTS search, RRF fusion, and retrieval strength.
"""

import pytest
from app.retrieval import (
    compute_retrieval_strength,
    reciprocal_rank_fusion,
)


# ═══════════════════════════════════════════════════════════════════════════
# RRF Tests
# ═══════════════════════════════════════════════════════════════════════════

class TestRRF:
    def test_single_list(self):
        """Single result list returns the same order."""
        records = [
            {"id": "R-1", "text": "first"},
            {"id": "R-2", "text": "second"},
        ]
        fused = reciprocal_rank_fusion(records)
        assert fused[0]["id"] == "R-1"
        assert fused[1]["id"] == "R-2"

    def test_two_lists_boost(self):
        """A record appearing in both lists gets a higher score."""
        list_a = [
            {"id": "R-1", "text": "first"},
            {"id": "R-2", "text": "second"},
        ]
        list_b = [
            {"id": "R-2", "text": "second"},
            {"id": "R-3", "text": "third"},
        ]
        fused = reciprocal_rank_fusion(list_a, list_b)
        # R-2 appears in both lists so it should be ranked highest
        assert fused[0]["id"] == "R-2"

    def test_deduplication(self):
        """Duplicate records across lists are merged."""
        list_a = [{"id": "R-1", "text": "one"}]
        list_b = [{"id": "R-1", "text": "one"}]
        fused = reciprocal_rank_fusion(list_a, list_b)
        assert len(fused) == 1

    def test_empty_lists(self):
        fused = reciprocal_rank_fusion([], [])
        assert len(fused) == 0

    def test_rrf_score_present(self):
        records = [{"id": "R-1", "text": "one"}]
        fused = reciprocal_rank_fusion(records)
        assert "_rrf_score" in fused[0]
        assert fused[0]["_rrf_score"] > 0


# ═══════════════════════════════════════════════════════════════════════════
# Retrieval Strength Tests
# ═══════════════════════════════════════════════════════════════════════════

class TestRetrievalStrength:
    def test_empty_records(self):
        strength = compute_retrieval_strength([], "query", [])
        assert strength == 0.0

    def test_high_strength(self):
        """Many diverse records with procedures and incidents → high strength."""
        records = [
            {"id": f"T-{i}", "record_type": "telemetry", "subsystem": "EPS"}
            for i in range(5)
        ] + [
            {"id": "INC-1", "record_type": "incident", "subsystem": "EPS"},
            {"id": "PROC-1", "record_type": "procedure", "subsystem": "COMMS"},
        ]
        strength = compute_retrieval_strength(records, "query", ["EPS", "COMMS"])
        assert strength >= 0.7

    def test_low_strength(self):
        """Single record of one type → low strength."""
        records = [
            {"id": "T-1", "record_type": "telemetry", "subsystem": "EPS"},
        ]
        strength = compute_retrieval_strength(records, "query", ["EPS"])
        assert strength < 0.5

    def test_procedure_bonus(self):
        """Having a procedure should increase strength."""
        records_no_proc = [
            {"id": "T-1", "record_type": "telemetry", "subsystem": "EPS"},
            {"id": "T-2", "record_type": "telemetry", "subsystem": "EPS"},
        ]
        records_with_proc = records_no_proc + [
            {"id": "P-1", "record_type": "procedure", "subsystem": "EPS"},
        ]
        s_no = compute_retrieval_strength(records_no_proc, "q", ["EPS"])
        s_with = compute_retrieval_strength(records_with_proc, "q", ["EPS"])
        assert s_with > s_no

    def test_strength_bounded(self):
        """Strength should never exceed 1.0."""
        records = [
            {"id": f"R-{i}", "record_type": t, "subsystem": s}
            for i, (t, s) in enumerate([
                ("telemetry", "EPS"), ("telemetry", "COMMS"),
                ("incident", "EPS"), ("procedure", "COMMS"),
                ("log", "CDH"), ("telemetry", "THERMAL"),
            ] * 5)
        ]
        strength = compute_retrieval_strength(records, "q", ["EPS", "COMMS"])
        assert strength <= 1.0
