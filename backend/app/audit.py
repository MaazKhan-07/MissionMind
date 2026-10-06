"""
MissionMind Audit Trail
=======================
Tamper-evident audit chain using hash chaining.

Implements:
  - Session-based audit event recording
  - SHA-256 hash chaining (genesis → hash_01 → hash_02 → ...)
  - Chain verification
  - Answer replay support
"""

from __future__ import annotations

import hashlib
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from app import db
from app.config import AUDIT_HASH_ALGORITHM
from app.schemas import AuditEvent, AuditVerifyResponse

logger = logging.getLogger("missionmind.audit")


# ═══════════════════════════════════════════════════════════════════════════
# Hash Computation
# ═══════════════════════════════════════════════════════════════════════════

def _compute_hash(data: str, previous_hash: Optional[str] = None) -> str:
    """
    Compute a SHA-256 hash of the data chained with the previous hash.
    """
    content = f"{previous_hash or 'GENESIS'}:{data}"
    return hashlib.new(AUDIT_HASH_ALGORITHM, content.encode("utf-8")).hexdigest()


def _event_to_hash_content(event: dict[str, Any]) -> str:
    """
    Create a deterministic string representation of an audit event
    for hashing purposes.
    """
    parts = [
        event.get("timestamp", ""),
        event.get("event_type", ""),
        event.get("session_id", ""),
        event.get("query", ""),
        json.dumps(event.get("record_ids", []), sort_keys=True),
        str(event.get("retrieval_strength", "")),
        str(event.get("dropped_claims", 0)),
    ]
    return "|".join(parts)


# ═══════════════════════════════════════════════════════════════════════════
# Audit Event Recording
# ═══════════════════════════════════════════════════════════════════════════

def record_audit_event(
    event_type: str,
    session_id: str,
    query: Optional[str] = None,
    record_ids: Optional[list[str]] = None,
    retrieval_strength: Optional[float] = None,
    raw_output: Optional[str] = None,
    validated_output: Optional[str] = None,
    dropped_claims: int = 0,
) -> AuditEvent:
    """
    Record a new audit event and chain it to the previous entry.
    """
    # Get the last audit event for chain linking
    all_events = db.get_all_audit_events_ordered()
    previous_hash = all_events[-1]["current_hash"] if all_events else None

    # Build event data
    event_id = f"AUD-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()

    event_data = {
        "id": event_id,
        "timestamp": timestamp,
        "event_type": event_type,
        "session_id": session_id,
        "query": query,
        "record_ids": record_ids or [],
        "retrieval_strength": retrieval_strength,
        "raw_output": raw_output,
        "validated_output": validated_output,
        "dropped_claims": dropped_claims,
        "previous_hash": previous_hash,
    }

    # Compute chained hash
    hash_content = _event_to_hash_content(event_data)
    current_hash = _compute_hash(hash_content, previous_hash)
    event_data["current_hash"] = current_hash

    # Store in database
    db.insert_audit_event(event_data)

    logger.info(
        "Audit event %s recorded (type=%s, session=%s, hash=%s...)",
        event_id,
        event_type,
        session_id,
        current_hash[:12],
    )

    return AuditEvent(**event_data)


# ═══════════════════════════════════════════════════════════════════════════
# Chain Verification
# ═══════════════════════════════════════════════════════════════════════════

def verify_audit_chain() -> AuditVerifyResponse:
    """
    Verify the integrity of the entire audit chain.

    Each event's hash must match the recomputed hash based on
    its content and the previous event's hash.
    """
    events = db.get_all_audit_events_ordered()

    if not events:
        return AuditVerifyResponse(ok=True, entries_checked=0)

    previous_hash: Optional[str] = None

    for i, event in enumerate(events):
        # Verify previous_hash link
        expected_prev = previous_hash
        actual_prev = event.get("previous_hash")

        if i == 0:
            # Genesis event should have no previous hash
            if actual_prev is not None:
                return AuditVerifyResponse(
                    ok=False,
                    entries_checked=i + 1,
                    broken_at=event["id"],
                )
        else:
            if actual_prev != expected_prev:
                return AuditVerifyResponse(
                    ok=False,
                    entries_checked=i + 1,
                    broken_at=event["id"],
                )

        # Recompute hash and verify
        hash_content = _event_to_hash_content(event)
        expected_hash = _compute_hash(hash_content, actual_prev)
        actual_hash = event.get("current_hash", "")

        if expected_hash != actual_hash:
            return AuditVerifyResponse(
                ok=False,
                entries_checked=i + 1,
                broken_at=event["id"],
            )

        previous_hash = actual_hash

    return AuditVerifyResponse(ok=True, entries_checked=len(events))


# ═══════════════════════════════════════════════════════════════════════════
# Audit Retrieval
# ═══════════════════════════════════════════════════════════════════════════

def get_audit_trail(
    session_id: Optional[str] = None, limit: int = 100
) -> list[dict[str, Any]]:
    """Retrieve audit events, optionally filtered by session."""
    return db.get_audit_events(session_id=session_id, limit=limit)


def get_audit_event_for_replay(event_id: str) -> Optional[dict[str, Any]]:
    """Get a single audit event for answer replay."""
    events = db.get_audit_events()
    for event in events:
        if event["id"] == event_id:
            return event
    return None
