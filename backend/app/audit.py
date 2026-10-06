import sqlite3
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from backend.app.schemas import AuditLogEntry, AuditVerifyResponse
from backend.app.db import get_connection

def compute_hash(prev_hash: str, event: str, payload_json: str) -> str:
    hasher = hashlib.sha256()
    hasher.update((prev_hash + event + payload_json).encode("utf-8"))
    return hasher.hexdigest()

def log_audit_event(
    session_id: str,
    event: str,
    payload: Dict[str, Any],
    conn: Optional[sqlite3.Connection] = None
) -> AuditLogEntry:
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True

    cursor = conn.cursor()
    cursor.execute("SELECT seq, hash FROM audit_log ORDER BY seq DESC LIMIT 1;")
    last_row = cursor.fetchone()

    prev_hash = "GENESIS" if last_row is None else last_row["hash"]
    ts_utc = datetime.now(timezone.utc).isoformat()
    payload_json = json.dumps(payload, sort_keys=True)
    entry_hash = compute_hash(prev_hash, event, payload_json)

    cursor.execute("""
        INSERT INTO audit_log (ts_utc, session_id, event, payload_json, prev_hash, hash)
        VALUES (?, ?, ?, ?, ?, ?);
    """, (ts_utc, session_id, event, payload_json, prev_hash, entry_hash))
    
    seq = cursor.lastrowid
    conn.commit()

    entry = AuditLogEntry(
        seq=seq,
        ts_utc=ts_utc,
        session_id=session_id,
        event=event,
        payload_json=payload_json,
        prev_hash=prev_hash,
        hash=entry_hash
    )

    if should_close:
        conn.close()

    return entry

def get_audit_trail(limit: int = 100, session_id: Optional[str] = None) -> List[AuditLogEntry]:
    conn = get_connection()
    cursor = conn.cursor()
    if session_id:
        cursor.execute("SELECT * FROM audit_log WHERE session_id = ? ORDER BY seq ASC LIMIT ?", (session_id, limit))
    else:
        cursor.execute("SELECT * FROM audit_log ORDER BY seq ASC LIMIT ?", (limit,))
    
    rows = cursor.fetchall()
    conn.close()

    return [
        AuditLogEntry(
            seq=r["seq"],
            ts_utc=r["ts_utc"],
            session_id=r["session_id"],
            event=r["event"],
            payload_json=r["payload_json"],
            prev_hash=r["prev_hash"],
            hash=r["hash"]
        )
        for r in rows
    ]

def verify_audit_chain() -> AuditVerifyResponse:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT seq, ts_utc, session_id, event, payload_json, prev_hash, hash FROM audit_log ORDER BY seq ASC;")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return AuditVerifyResponse(ok=True, entries_checked=0)

    expected_prev = "GENESIS"
    for idx, row in enumerate(rows):
        # Verify previous hash pointer
        if row["prev_hash"] != expected_prev:
            return AuditVerifyResponse(
                ok=False,
                entries_checked=idx,
                error=f"Hash chain broken at seq {row['seq']}: expected prev_hash '{expected_prev}', found '{row['prev_hash']}'"
            )

        # Recompute hash
        computed = compute_hash(row["prev_hash"], row["event"], row["payload_json"])
        if computed != row["hash"]:
            return AuditVerifyResponse(
                ok=False,
                entries_checked=idx,
                error=f"Hash mismatch at seq {row['seq']}: computed '{computed}', stored '{row['hash']}'"
            )

        expected_prev = row["hash"]

    return AuditVerifyResponse(ok=True, entries_checked=len(rows))
