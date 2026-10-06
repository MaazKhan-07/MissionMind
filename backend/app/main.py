"""
MissionMind FastAPI Application
================================
Main entry point for the MissionMind backend.

Endpoints:
  POST /api/ask          — Ask MissionMind (full AI pipeline)
  GET  /api/records/{id} — Get a mission record
  GET  /api/anomalies    — Get active anomalies
  GET  /api/timeline     — Get deterministic timeline
  GET  /api/telemetry    — Get telemetry data
  GET  /api/audit        — Get audit trail
  GET  /api/audit/verify — Verify audit chain integrity
  GET  /api/health       — Health check
  POST /api/seed         — Seed the database (dev only)
"""

from __future__ import annotations

import json
import logging
import sys
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure project root is on sys.path for ai.prompts imports
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from app import db
from app.anomalies import get_all_anomalies, get_anomaly
from app.audit import get_audit_trail, record_audit_event, verify_audit_chain
from app.config import CORS_ORIGINS, DEMO_MODE
from app.retrieval import hybrid_retrieve, should_abstain
from app.schemas import (
    AskRequest,
    AskResponse,
    AuditVerifyResponse,
    Confidence,
    EvidenceScore,
    HealthResponse,
    MissionMindAnswer,
    MissionRecord,
    TelemetryPoint,
)
from app.timeline import generate_timeline, generate_timeline_for_records
from app.validator import validate_answer, detect_injection_in_records

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(name)-28s  %(levelname)-7s  %(message)s",
)
logger = logging.getLogger("missionmind")


# ---------------------------------------------------------------------------
# Lifespan — initialize DB + seed on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database and seed demo data on startup."""
    logger.info("MissionMind starting up...")
    db.init_db()

    # Auto-seed in demo mode or if database is empty
    if DEMO_MODE or db.record_count() == 0:
        logger.info("Seeding database with golden demo data...")
        try:
            from data.seed_data import seed_database
            result = seed_database()
            logger.info("Seed result: %s", result)
        except Exception as e:
            logger.warning("Seed failed (non-fatal): %s", e)

    logger.info("MissionMind ready. Demo mode: %s", DEMO_MODE)
    yield
    logger.info("MissionMind shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="MissionMind",
    description="Mission Operations Intelligence & Evidence-Grounded Decision Copilot",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════
# POST /api/ask — The core AI pipeline
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/api/ask", response_model=AskResponse)
async def ask_missionmind(request: AskRequest):
    """
    Full AI pipeline:
      QUERY → PARSE → TIME WINDOW → HYBRID RETRIEVAL → STRENGTH CHECK
      → PROMPT BUILD → LLM → JSON PARSE → VALIDATE → CONFIDENCE OVERRIDE
      → ABSTENTION CHECK → FINAL ANSWER → AUDIT LOG
    """
    session_id = request.session_id or f"MM-{uuid.uuid4().hex[:8].upper()}"
    query = request.query.strip()

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    logger.info("ASK [%s]: %s", session_id, query[:100])

    # --- Demo mode: return mock response ---
    if DEMO_MODE:
        return _demo_response(query, session_id)

    # --- 1. Query understanding ---
    from ai.prompts.prompt_builder import parse_time_window, extract_subsystems

    time_window = parse_time_window(query)
    subsystems = extract_subsystems(query)
    logger.info("Parsed: time_window=%s, subsystems=%s", time_window, subsystems)

    # --- 2. Hybrid retrieval ---
    retrieved_records, retrieval_strength = hybrid_retrieve(
        query=query,
        subsystems=subsystems,
        time_window=time_window,
    )
    logger.info("Retrieved %d records, strength=%.3f", len(retrieved_records), retrieval_strength)

    # Get record IDs
    record_ids = [r["id"] for r in retrieved_records]

    # --- 3. Abstain if retrieval is weak ---
    if should_abstain(retrieval_strength):
        logger.info("Retrieval too weak (%.3f) — abstaining", retrieval_strength)
        answer = MissionMindAnswer(
            abstain=True,
            abstain_reason="Insufficient evidence retrieved to answer this query.",
            missing_data=_identify_missing_data(query, subsystems),
        )
        # Audit
        record_audit_event(
            event_type="abstain_weak_retrieval",
            session_id=session_id,
            query=query,
            record_ids=record_ids,
            retrieval_strength=retrieval_strength,
        )
        return AskResponse(
            answer=answer,
            records={},
            evidence_score=EvidenceScore(
                retrieval_strength=retrieval_strength,
                confidence=Confidence.LOW,
            ),
            dropped=0,
            retrieval_strength=retrieval_strength,
            timeline=[],
        )

    # --- 4. Build prompt ---
    from ai.prompts.prompt_builder import build_prompt

    prompt_text = build_prompt(
        query=query,
        records=retrieved_records,
        time_window=time_window,
    )

    # --- 5. LLM generation ---
    from app.llm import get_llm_client

    llm = get_llm_client()
    raw_answer = await llm.generate_structured_answer(
        query=query,
        records=retrieved_records,
        prompt_text=prompt_text,
    )
    raw_output_json = raw_answer.model_dump_json()

    # --- 6. Evidence validation ---
    records_map = db.get_records_by_ids(record_ids)
    validation_result = validate_answer(raw_answer, records_map)

    validated_answer = validation_result.validated_answer
    validated_output_json = validated_answer.model_dump_json()

    # --- 7. Detect injection ---
    injection_flags = detect_injection_in_records(records_map)

    # --- 8. Generate timeline ---
    timeline = generate_timeline_for_records(retrieved_records)

    # --- 9. Build evidence score ---
    all_citations = set()
    for f in validated_answer.facts:
        all_citations.update(f.citations)
    for i in validated_answer.inferences:
        all_citations.update(i.citations)
    for r in validated_answer.recommendations:
        all_citations.update(r.citations)

    evidence_score = EvidenceScore(
        retrieval_strength=retrieval_strength,
        citation_count=len(all_citations),
        valid_citation_count=len(all_citations),
        dropped_claims=validation_result.dropped_count,
        matching_incidents=len([r for r in records_map.values() if r.get("record_type") == "incident"]),
        matching_procedures=len([r for r in records_map.values() if r.get("record_type") == "procedure"]),
        confidence=validation_result.confidence_override or Confidence.MEDIUM,
    )

    # --- 10. Build records response ---
    response_records = {}
    for rid in all_citations:
        if rid in records_map:
            rec = records_map[rid]
            response_records[rid] = MissionRecord(
                id=rec["id"],
                timestamp=rec["timestamp"],
                subsystem=rec["subsystem"],
                record_type=rec["record_type"],
                severity=rec.get("severity", "info"),
                text=rec["text"],
                parameters=rec.get("parameters", {}),
            )

    # --- 11. Audit log ---
    record_audit_event(
        event_type="ask",
        session_id=session_id,
        query=query,
        record_ids=record_ids,
        retrieval_strength=retrieval_strength,
        raw_output=raw_output_json,
        validated_output=validated_output_json,
        dropped_claims=validation_result.dropped_count,
    )

    logger.info(
        "ASK complete [%s]: %d facts, %d inferences, %d recommendations, %d dropped",
        session_id,
        len(validated_answer.facts),
        len(validated_answer.inferences),
        len(validated_answer.recommendations),
        validation_result.dropped_count,
    )

    return AskResponse(
        answer=validated_answer,
        records=response_records,
        evidence_score=evidence_score,
        dropped=validation_result.dropped_count,
        retrieval_strength=retrieval_strength,
        timeline=timeline,
        injection_flags=injection_flags,
    )


# ═══════════════════════════════════════════════════════════════════════════
# GET /api/records/{record_id}
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/records/{record_id}")
async def get_record(record_id: str):
    """Retrieve a single mission record by ID."""
    record = db.get_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Record {record_id} not found")
    return record


# ═══════════════════════════════════════════════════════════════════════════
# GET /api/records
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/records")
async def list_records(
    subsystem: Optional[str] = None,
    record_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(default=50, le=200),
):
    """List mission records with optional filters."""
    records = db.search_records_sql(
        subsystem=subsystem,
        record_type=record_type,
        severity=severity,
        limit=limit,
    )
    return records


# ═══════════════════════════════════════════════════════════════════════════
# GET /api/anomalies
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/anomalies")
async def list_anomalies(status: Optional[str] = None):
    """Retrieve active mission anomalies."""
    return get_all_anomalies(status=status)


@app.get("/api/anomalies/{anomaly_id}")
async def get_anomaly_by_id(anomaly_id: str):
    """Retrieve a specific anomaly."""
    anomaly = get_anomaly(anomaly_id)
    if not anomaly:
        raise HTTPException(status_code=404, detail=f"Anomaly {anomaly_id} not found")
    return anomaly


# ═══════════════════════════════════════════════════════════════════════════
# GET /api/timeline
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/timeline")
async def get_timeline(
    anomaly_id: Optional[str] = None,
    subsystem: Optional[str] = None,
    time_start: Optional[str] = None,
    time_end: Optional[str] = None,
):
    """Get deterministic timeline events."""
    # If anomaly_id is provided, get its related records
    record_ids = None
    if anomaly_id:
        anomaly = get_anomaly(anomaly_id)
        if anomaly:
            # Get records related to the anomaly's subsystem and time
            records = db.search_records_sql(
                subsystem=anomaly.subsystem,
                time_start=time_start,
                time_end=time_end,
                limit=50,
            )
            record_ids = [r["id"] for r in records]

    timeline = generate_timeline(
        record_ids=record_ids,
        subsystem=subsystem,
        time_start=time_start,
        time_end=time_end,
    )
    return timeline


# ═══════════════════════════════════════════════════════════════════════════
# GET /api/telemetry
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/telemetry")
async def get_telemetry(
    parameter: Optional[str] = None,
    subsystem: Optional[str] = None,
    time_start: Optional[str] = None,
    time_end: Optional[str] = None,
    limit: int = Query(default=500, le=2000),
):
    """Get telemetry data for visualization."""
    data = db.get_telemetry(
        parameter=parameter,
        subsystem=subsystem,
        time_start=time_start,
        time_end=time_end,
        limit=limit,
    )
    return data


# ═══════════════════════════════════════════════════════════════════════════
# GET /api/audit
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/audit")
async def get_audit(
    session_id: Optional[str] = None,
    limit: int = Query(default=100, le=500),
):
    """Retrieve audit trail events."""
    return get_audit_trail(session_id=session_id, limit=limit)


# ═══════════════════════════════════════════════════════════════════════════
# GET /api/audit/verify
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/audit/verify", response_model=AuditVerifyResponse)
async def verify_audit():
    """Verify the integrity of the audit hash chain."""
    return verify_audit_chain()


# ═══════════════════════════════════════════════════════════════════════════
# GET /api/health
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check for all subsystems."""
    health = HealthResponse(demo_mode=DEMO_MODE)

    # Database check
    try:
        db.record_count()
        health.database = "ok"
    except Exception:
        health.database = "error"
        health.status = "degraded"

    # Retrieval check
    try:
        from app.retrieval import _get_embedding_model
        model = _get_embedding_model()
        health.retrieval = "ok" if model is not None else "no_embeddings"
    except Exception:
        health.retrieval = "error"

    # LLM check
    try:
        from app.config import LLM_API_KEY, LLM_PROVIDER
        if LLM_PROVIDER == "hosted" and not LLM_API_KEY:
            health.llm = "no_api_key"
        else:
            health.llm = "ok"
    except Exception:
        health.llm = "error"

    # Audit check
    try:
        verify_result = verify_audit_chain()
        health.audit = "ok" if verify_result.ok else "chain_broken"
    except Exception:
        health.audit = "error"

    return health


# ═══════════════════════════════════════════════════════════════════════════
# POST /api/seed — Development only
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/api/seed")
async def seed_database_endpoint():
    """Seed the database with demo data. Development only."""
    try:
        from data.seed_data import seed_database
        result = seed_database()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# Demo Mode Response
# ═══════════════════════════════════════════════════════════════════════════

def _demo_response(query: str, session_id: str) -> AskResponse:
    """
    Return a deterministic demo response.
    Uses mock_ask.json for the primary demo query,
    and generates appropriate abstention for unsupported queries.
    """
    query_lower = query.lower()

    # Check for prompt injection
    from app.validator import _detect_injection
    if _detect_injection(query):
        answer = MissionMindAnswer(
            abstain=True,
            abstain_reason="Query contains content that appears to be an instruction rather than a mission operations question. MissionMind only answers evidence-based mission queries.",
            missing_data=[],
        )
        return AskResponse(
            answer=answer,
            records={},
            evidence_score=EvidenceScore(
                retrieval_strength=0.0,
                confidence=Confidence.LOW,
            ),
            dropped=0,
            retrieval_strength=0.0,
            timeline=[],
            injection_flags=["USER_QUERY"],
        )

    # Check for unanswerable questions
    unanswerable_keywords = [
        "gyroscope", "quantum sensor", "nonexistent",
        "antimatter", "warp drive", "phaser",
    ]
    if any(kw in query_lower for kw in unanswerable_keywords):
        missing = _identify_missing_data(query, [])
        answer = MissionMindAnswer(
            abstain=True,
            abstain_reason="MissionMind could not find relevant mission records supporting this query.",
            missing_data=missing,
        )
        return AskResponse(
            answer=answer,
            records={},
            evidence_score=EvidenceScore(
                retrieval_strength=0.0,
                confidence=Confidence.LOW,
            ),
            dropped=0,
            retrieval_strength=0.0,
            timeline=[],
        )

    # Default: return the golden demo response from mock_ask.json
    try:
        mock_path = _PROJECT_ROOT / "mock_ask.json"
        with open(mock_path, "r", encoding="utf-8") as f:
            mock_data = json.load(f)

        # Parse into response model
        return AskResponse.model_validate(mock_data)
    except Exception as e:
        logger.error("Could not load mock response: %s", e)
        raise HTTPException(status_code=500, detail="Demo response unavailable")


def _identify_missing_data(query: str, subsystems: list[str]) -> list[str]:
    """Identify what data would be needed to answer a query."""
    missing = []
    query_lower = query.lower()

    if "gyroscope" in query_lower:
        missing.append("gyroscope bias telemetry")
        missing.append("day 3 calibration record")
    elif "quantum" in query_lower:
        missing.append("quantum sensor telemetry")
    elif subsystems:
        for sub in subsystems:
            missing.append(f"{sub} telemetry records for the requested time period")
    else:
        missing.append("relevant mission records for the requested topic")

    return missing


# ═══════════════════════════════════════════════════════════════════════════
# Run directly
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
