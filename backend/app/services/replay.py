import json
import sqlite3
from typing import Optional, Dict, Any
from backend.app.schemas import ReplayResponse, CopilotAnswer
from backend.app.db import get_connection

def replay_session_query(session_id: Optional[str] = None, audit_seq: Optional[int] = None) -> ReplayResponse:
    """
    Reproduces previous answer from stored audit trail without calling LLM again.
    """
    conn = get_connection()
    cursor = conn.cursor()

    if audit_seq:
        cursor.execute("SELECT * FROM audit_log WHERE seq = ?;", (audit_seq,))
    elif session_id:
        cursor.execute("SELECT * FROM audit_log WHERE session_id = ? AND event = 'ASK_QUERY' ORDER BY seq DESC LIMIT 1;", (session_id,))
    else:
        cursor.execute("SELECT * FROM audit_log WHERE event = 'ASK_QUERY' ORDER BY seq DESC LIMIT 1;")

    row = cursor.fetchone()
    conn.close()

    if not row:
        raise ValueError("No matching audit record found for replay.")

    payload = json.loads(row["payload_json"])
    query = payload.get("query", "")
    raw_output = payload.get("raw_model_output", "")
    validated_dict = payload.get("validated_output", {})
    retrieved_ids = payload.get("retrieved_ids", [])
    dropped = payload.get("dropped_claims", 0)

    validated_answer = CopilotAnswer.model_validate(validated_dict)

    return ReplayResponse(
        replayed=True,
        query=query,
        raw_output=raw_output,
        validated_answer=validated_answer,
        retrieved_ids=retrieved_ids,
        dropped=dropped
    )
