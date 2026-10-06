import uuid
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from backend.app.schemas import AskRequest, AskResponse, CopilotAnswer
from backend.app.retrieval import hybrid_retrieval, extract_time_anchor
from backend.app.validator import validate_copilot_answer
from backend.app.llm import call_llm
from backend.app.timeline import generate_timeline
from backend.app.audit import log_audit_event
from backend.app.config import settings

def process_ask_query(request: AskRequest) -> AskResponse:
    """
    Executes end-to-end evidence-grounded decision workflow.
    """
    session_id = request.session_id or f"sess-{uuid.uuid4().hex[:8]}"
    query = request.query.strip()
    
    # 1. Hybrid Retrieval
    retrieved_records, retrieval_strength = hybrid_retrieval(query, request.anomaly_id)
    retrieved_ids = list(retrieved_records.keys())
    
    time_anchor_dt = extract_time_anchor(query)
    time_anchor_str = time_anchor_dt.isoformat() if time_anchor_dt else None
    
    # 2. Safety Abstention check if retrieval is too weak
    if retrieval_strength < settings.MIN_RETRIEVAL_STRENGTH or len(retrieved_records) == 0:
        abstain_answer = CopilotAnswer(
            abstain=True,
            abstain_reason="Insufficient evidence retrieved.",
            missing_data=["Relevant telemetry or incident records in the requested timeframe"],
            facts=[],
            inferences=[],
            recommendations=[]
        )
        timeline = generate_timeline(request.anomaly_id, time_anchor_str)
        
        # Log to audit trail
        log_payload = {
            "query": query,
            "session_id": session_id,
            "retrieved_ids": retrieved_ids,
            "retrieval_strength": retrieval_strength,
            "raw_model_output": "ABSTAIN_DUE_TO_WEAK_RETRIEVAL",
            "validated_output": abstain_answer.model_dump(),
            "dropped_claims": 0
        }
        log_audit_event(session_id, "ASK_QUERY", log_payload)
        
        return AskResponse(
            answer=abstain_answer,
            records=retrieved_records,
            dropped=0,
            timeline=timeline,
            retrieval_strength=retrieval_strength
        )

    # 3. LLM / Grounded Reasoning Layer
    raw_answer, raw_text = call_llm(query, retrieved_records, session_id)
    
    # 4. Evidence Validation & Citation / Numeric Verification
    validated_answer, dropped_count = validate_copilot_answer(raw_answer, retrieved_records)
    
    # 5. Deterministic Timeline
    timeline = generate_timeline(request.anomaly_id, time_anchor_str)
    
    # 6. Audit Trail with Cryptographic Hash Chaining
    log_payload = {
        "query": query,
        "session_id": session_id,
        "retrieved_ids": retrieved_ids,
        "retrieval_strength": retrieval_strength,
        "raw_model_output": raw_text,
        "validated_output": validated_answer.model_dump(),
        "dropped_claims": dropped_count
    }
    log_audit_event(session_id, "ASK_QUERY", log_payload)

    return AskResponse(
        answer=validated_answer,
        records=retrieved_records,
        dropped=dropped_count,
        timeline=timeline,
        retrieval_strength=retrieval_strength
    )
