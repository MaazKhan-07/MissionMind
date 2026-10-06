import hashlib
import json
import time
from typing import List, Dict, Any, Tuple
from app.db import get_db_connection
from app.schemas import AuditItem, AuditVerifyResponse

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def calculate_audit_hash(prev_hash: str, audit_id: str, query: str, timestamp: str, record_ids: List[str]) -> str:
    payload = f"{prev_hash}|{audit_id}|{query}|{timestamp}|{','.join(sorted(record_ids))}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def record_audit_entry(
    session_id: str,
    query: str,
    retrieved_record_ids: List[str],
    retrieval_strength: float,
    raw_model_output: Dict[str, Any],
    validated_output: Dict[str, Any],
    dropped_claims_count: int
) -> AuditItem:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get latest entry to get previous hash
    cursor.execute("SELECT hash FROM audit_logs ORDER BY rowid DESC LIMIT 1")
    last_row = cursor.fetchone()
    prev_hash = last_row["hash"] if last_row else GENESIS_HASH

    audit_id = f"AUD-{int(time.time() * 1000)}"
    ts_now = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())

    entry_hash = calculate_audit_hash(prev_hash, audit_id, query, ts_now, retrieved_record_ids)

    cursor.execute(
        "INSERT INTO audit_logs (id, session_id, timestamp, query, retrieved_record_ids, retrieval_strength, raw_model_output, validated_output, dropped_claims_count, previous_hash, hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            audit_id, session_id, ts_now, query,
            json.dumps(retrieved_record_ids), retrieval_strength,
            json.dumps(raw_model_output), json.dumps(validated_output),
            dropped_claims_count, prev_hash, entry_hash
        )
    )
    conn.commit()
    conn.close()

    return AuditItem(
        id=audit_id,
        session_id=session_id,
        timestamp=ts_now,
        query=query,
        retrieved_record_ids=retrieved_record_ids,
        retrieval_strength=retrieval_strength,
        raw_model_output=raw_model_output,
        validated_output=validated_output,
        dropped_claims_count=dropped_claims_count,
        previous_hash=prev_hash,
        hash=entry_hash
    )

def get_audit_trail() -> List[AuditItem]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY rowid DESC")
    rows = cursor.fetchall()
    
    entries = []
    for r in rows:
        entries.append(AuditItem(
            id=r["id"],
            session_id=r["session_id"],
            timestamp=r["timestamp"],
            query=r["query"],
            retrieved_record_ids=json.loads(r["retrieved_record_ids"]),
            retrieval_strength=r["retrieval_strength"],
            raw_model_output=json.loads(r["raw_model_output"]),
            validated_output=json.loads(r["validated_output"]),
            dropped_claims_count=r["dropped_claims_count"],
            previous_hash=r["previous_hash"],
            hash=r["hash"]
        ))
    conn.close()
    return entries

def verify_audit_chain() -> AuditVerifyResponse:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY rowid ASC")
    rows = cursor.fetchall()

    if not rows:
        conn.close()
        return AuditVerifyResponse(
            ok=True,
            entries_checked=0,
            chain_valid=True,
            message="Audit log chain is empty. Initialized with genesis hash.",
            latest_hash=GENESIS_HASH
        )

    expected_prev = GENESIS_HASH
    entries_checked = 0

    for r in rows:
        rec_ids = json.loads(r["retrieved_record_ids"])
        expected_hash = calculate_audit_hash(r["previous_hash"], r["id"], r["query"], r["timestamp"], rec_ids)
        
        if r["previous_hash"] != expected_prev:
            conn.close()
            return AuditVerifyResponse(
                ok=False,
                entries_checked=entries_checked,
                chain_valid=False,
                message=f"Tamper detected! Previous hash mismatch at entry {r['id']}.",
                latest_hash=r["hash"]
            )
            
        if r["hash"] != expected_hash:
            conn.close()
            return AuditVerifyResponse(
                ok=False,
                entries_checked=entries_checked,
                chain_valid=False,
                message=f"Tamper detected! Entry {r['id']} hash corruption.",
                latest_hash=r["hash"]
            )

        expected_prev = r["hash"]
        entries_checked += 1

    conn.close()
    return AuditVerifyResponse(
        ok=True,
        entries_checked=entries_checked,
        chain_valid=True,
        message=f"Tamper-evident hash chain valid. {entries_checked} entries verified.",
        latest_hash=expected_prev
    )
