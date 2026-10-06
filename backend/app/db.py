"""
MissionMind Database
====================
SQLite database with FTS5 full-text search support.
Manages schema creation, connections, and provides
helper functions for record storage and retrieval.
"""

from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import numpy as np

from app.config import DATABASE_PATH, EMBEDDING_DIM


# ═══════════════════════════════════════════════════════════════════════════
# Database Initialization
# ═══════════════════════════════════════════════════════════════════════════

_SCHEMA_SQL = """
-- Mission Records: core table for all mission data
CREATE TABLE IF NOT EXISTS mission_records (
    id            TEXT PRIMARY KEY,
    timestamp     TEXT NOT NULL,
    subsystem     TEXT NOT NULL,
    record_type   TEXT NOT NULL,    -- telemetry | log | incident | procedure | command
    severity      TEXT DEFAULT 'info',
    text          TEXT NOT NULL,
    parameters    TEXT DEFAULT '{}' -- JSON blob
);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS records_fts USING fts5(
    id,
    subsystem,
    record_type,
    text,
    content='mission_records',
    content_rowid='rowid'
);

-- Triggers to keep FTS5 in sync
CREATE TRIGGER IF NOT EXISTS records_ai AFTER INSERT ON mission_records BEGIN
    INSERT INTO records_fts(rowid, id, subsystem, record_type, text)
    VALUES (new.rowid, new.id, new.subsystem, new.record_type, new.text);
END;

CREATE TRIGGER IF NOT EXISTS records_ad AFTER DELETE ON mission_records BEGIN
    INSERT INTO records_fts(records_fts, rowid, id, subsystem, record_type, text)
    VALUES ('delete', old.rowid, old.id, old.subsystem, old.record_type, old.text);
END;

CREATE TRIGGER IF NOT EXISTS records_au AFTER UPDATE ON mission_records BEGIN
    INSERT INTO records_fts(records_fts, rowid, id, subsystem, record_type, text)
    VALUES ('delete', old.rowid, old.id, old.subsystem, old.record_type, old.text);
    INSERT INTO records_fts(rowid, id, subsystem, record_type, text)
    VALUES (new.rowid, new.id, new.subsystem, new.record_type, new.text);
END;

-- Embeddings table for vector retrieval
CREATE TABLE IF NOT EXISTS record_embeddings (
    record_id   TEXT PRIMARY KEY REFERENCES mission_records(id),
    embedding   BLOB NOT NULL,
    model       TEXT NOT NULL
);

-- Anomalies
CREATE TABLE IF NOT EXISTS anomalies (
    id                    TEXT PRIMARY KEY,
    timestamp             TEXT NOT NULL,
    subsystem             TEXT NOT NULL,
    severity              TEXT DEFAULT 'warning',
    description           TEXT NOT NULL,
    affected_parameters   TEXT DEFAULT '[]',   -- JSON array
    evidence_count        INTEGER DEFAULT 0,
    related_incidents     TEXT DEFAULT '[]',    -- JSON array
    status                TEXT DEFAULT 'active'
);

-- Telemetry time-series data
CREATE TABLE IF NOT EXISTS telemetry (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp      TEXT NOT NULL,
    parameter      TEXT NOT NULL,
    value          REAL NOT NULL,
    unit           TEXT DEFAULT '',
    subsystem      TEXT DEFAULT '',
    threshold_low  REAL,
    threshold_high REAL,
    status         TEXT DEFAULT 'nominal'
);

CREATE INDEX IF NOT EXISTS idx_telemetry_ts ON telemetry(timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_param ON telemetry(parameter);
CREATE INDEX IF NOT EXISTS idx_telemetry_subsystem ON telemetry(subsystem);

-- Audit chain
CREATE TABLE IF NOT EXISTS audit_events (
    id                  TEXT PRIMARY KEY,
    timestamp           TEXT NOT NULL,
    event_type          TEXT NOT NULL,
    session_id          TEXT NOT NULL,
    query               TEXT,
    record_ids          TEXT DEFAULT '[]',    -- JSON array
    retrieval_strength  REAL,
    raw_output          TEXT,
    validated_output    TEXT,
    dropped_claims      INTEGER DEFAULT 0,
    previous_hash       TEXT,
    current_hash        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_events(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(timestamp);

-- Record indices
CREATE INDEX IF NOT EXISTS idx_records_ts ON mission_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_records_subsystem ON mission_records(subsystem);
CREATE INDEX IF NOT EXISTS idx_records_type ON mission_records(record_type);
CREATE INDEX IF NOT EXISTS idx_records_severity ON mission_records(severity);
"""


def init_db() -> None:
    """Create all tables and indices if they don't exist."""
    Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as conn:
        conn.executescript(_SCHEMA_SQL)


@contextmanager
def get_connection():
    """Yield a sqlite3 connection with WAL mode and foreign keys."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ═══════════════════════════════════════════════════════════════════════════
# Record CRUD
# ═══════════════════════════════════════════════════════════════════════════

def insert_record(record: dict[str, Any]) -> None:
    """Insert a single mission record."""
    with get_connection() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO mission_records
               (id, timestamp, subsystem, record_type, severity, text, parameters)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                record["id"],
                record["timestamp"],
                record["subsystem"],
                record["record_type"],
                record.get("severity", "info"),
                record["text"],
                json.dumps(record.get("parameters", {})),
            ),
        )


def get_record(record_id: str) -> Optional[dict[str, Any]]:
    """Retrieve a single record by ID."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM mission_records WHERE id = ?", (record_id,)
        ).fetchone()
        if row:
            return _row_to_dict(row)
    return None


def get_records_by_ids(record_ids: list[str]) -> dict[str, dict[str, Any]]:
    """Retrieve multiple records by their IDs."""
    if not record_ids:
        return {}
    placeholders = ",".join("?" for _ in record_ids)
    with get_connection() as conn:
        rows = conn.execute(
            f"SELECT * FROM mission_records WHERE id IN ({placeholders})",
            record_ids,
        ).fetchall()
        return {row["id"]: _row_to_dict(row) for row in rows}


def get_all_records() -> list[dict[str, Any]]:
    """Retrieve all mission records."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM mission_records ORDER BY timestamp"
        ).fetchall()
        return [_row_to_dict(row) for row in rows]


def search_records_sql(
    subsystem: Optional[str] = None,
    record_type: Optional[str] = None,
    severity: Optional[str] = None,
    time_start: Optional[str] = None,
    time_end: Optional[str] = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Structured SQL search over mission records."""
    conditions: list[str] = []
    params: list[Any] = []

    if subsystem:
        conditions.append("subsystem = ?")
        params.append(subsystem)
    if record_type:
        conditions.append("record_type = ?")
        params.append(record_type)
    if severity:
        conditions.append("severity = ?")
        params.append(severity)
    if time_start:
        conditions.append("timestamp >= ?")
        params.append(time_start)
    if time_end:
        conditions.append("timestamp <= ?")
        params.append(time_end)

    where = " AND ".join(conditions) if conditions else "1=1"
    query = f"SELECT * FROM mission_records WHERE {where} ORDER BY timestamp LIMIT ?"
    params.append(limit)

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [_row_to_dict(row) for row in rows]


def search_records_fts(query_text: str, limit: int = 20) -> list[dict[str, Any]]:
    """Full-text search using FTS5."""
    # Sanitize FTS query — escape special characters
    safe_query = query_text.replace('"', '""')
    with get_connection() as conn:
        rows = conn.execute(
            """SELECT m.*, rank
               FROM records_fts f
               JOIN mission_records m ON f.id = m.id
               WHERE records_fts MATCH ?
               ORDER BY rank
               LIMIT ?""",
            (f'"{safe_query}"', limit),
        ).fetchall()
        return [_row_to_dict(row) for row in rows]


# ═══════════════════════════════════════════════════════════════════════════
# Embeddings
# ═══════════════════════════════════════════════════════════════════════════

def store_embedding(record_id: str, embedding: np.ndarray, model: str) -> None:
    """Store a vector embedding for a record."""
    blob = embedding.astype(np.float32).tobytes()
    with get_connection() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO record_embeddings (record_id, embedding, model)
               VALUES (?, ?, ?)""",
            (record_id, blob, model),
        )


def get_all_embeddings(model: str) -> list[tuple[str, np.ndarray]]:
    """Load all embeddings for a given model."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT record_id, embedding FROM record_embeddings WHERE model = ?",
            (model,),
        ).fetchall()
        result = []
        for row in rows:
            vec = np.frombuffer(row["embedding"], dtype=np.float32)
            result.append((row["record_id"], vec))
        return result


# ═══════════════════════════════════════════════════════════════════════════
# Telemetry
# ═══════════════════════════════════════════════════════════════════════════

def insert_telemetry(data: dict[str, Any]) -> None:
    """Insert a telemetry data point."""
    with get_connection() as conn:
        conn.execute(
            """INSERT INTO telemetry
               (timestamp, parameter, value, unit, subsystem,
                threshold_low, threshold_high, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["timestamp"],
                data["parameter"],
                data["value"],
                data.get("unit", ""),
                data.get("subsystem", ""),
                data.get("threshold_low"),
                data.get("threshold_high"),
                data.get("status", "nominal"),
            ),
        )


def get_telemetry(
    parameter: Optional[str] = None,
    subsystem: Optional[str] = None,
    time_start: Optional[str] = None,
    time_end: Optional[str] = None,
    limit: int = 500,
) -> list[dict[str, Any]]:
    """Retrieve telemetry data points."""
    conditions: list[str] = []
    params: list[Any] = []

    if parameter:
        conditions.append("parameter = ?")
        params.append(parameter)
    if subsystem:
        conditions.append("subsystem = ?")
        params.append(subsystem)
    if time_start:
        conditions.append("timestamp >= ?")
        params.append(time_start)
    if time_end:
        conditions.append("timestamp <= ?")
        params.append(time_end)

    where = " AND ".join(conditions) if conditions else "1=1"
    query = f"SELECT * FROM telemetry WHERE {where} ORDER BY timestamp LIMIT ?"
    params.append(limit)

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]


# ═══════════════════════════════════════════════════════════════════════════
# Anomalies
# ═══════════════════════════════════════════════════════════════════════════

def insert_anomaly(anomaly: dict[str, Any]) -> None:
    """Insert an anomaly record."""
    with get_connection() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO anomalies
               (id, timestamp, subsystem, severity, description,
                affected_parameters, evidence_count, related_incidents, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                anomaly["id"],
                anomaly["timestamp"],
                anomaly["subsystem"],
                anomaly.get("severity", "warning"),
                anomaly["description"],
                json.dumps(anomaly.get("affected_parameters", [])),
                anomaly.get("evidence_count", 0),
                json.dumps(anomaly.get("related_incidents", [])),
                anomaly.get("status", "active"),
            ),
        )


def get_anomalies(status: Optional[str] = None) -> list[dict[str, Any]]:
    """Retrieve anomalies, optionally filtered by status."""
    with get_connection() as conn:
        if status:
            rows = conn.execute(
                "SELECT * FROM anomalies WHERE status = ? ORDER BY timestamp DESC",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM anomalies ORDER BY timestamp DESC"
            ).fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["affected_parameters"] = json.loads(d.get("affected_parameters", "[]"))
            d["related_incidents"] = json.loads(d.get("related_incidents", "[]"))
            result.append(d)
        return result


# ═══════════════════════════════════════════════════════════════════════════
# Audit
# ═══════════════════════════════════════════════════════════════════════════

def insert_audit_event(event: dict[str, Any]) -> None:
    """Insert an audit event."""
    with get_connection() as conn:
        conn.execute(
            """INSERT INTO audit_events
               (id, timestamp, event_type, session_id, query,
                record_ids, retrieval_strength, raw_output,
                validated_output, dropped_claims, previous_hash, current_hash)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                event["id"],
                event["timestamp"],
                event["event_type"],
                event["session_id"],
                event.get("query"),
                json.dumps(event.get("record_ids", [])),
                event.get("retrieval_strength"),
                event.get("raw_output"),
                event.get("validated_output"),
                event.get("dropped_claims", 0),
                event.get("previous_hash"),
                event["current_hash"],
            ),
        )


def get_audit_events(
    session_id: Optional[str] = None, limit: int = 100
) -> list[dict[str, Any]]:
    """Retrieve audit events."""
    with get_connection() as conn:
        if session_id:
            rows = conn.execute(
                "SELECT * FROM audit_events WHERE session_id = ? ORDER BY timestamp LIMIT ?",
                (session_id, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM audit_events ORDER BY timestamp LIMIT ?", (limit,)
            ).fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["record_ids"] = json.loads(d.get("record_ids", "[]"))
            result.append(d)
        return result


def get_all_audit_events_ordered() -> list[dict[str, Any]]:
    """Get all audit events ordered by timestamp for chain verification."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM audit_events ORDER BY timestamp"
        ).fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["record_ids"] = json.loads(d.get("record_ids", "[]"))
            result.append(d)
        return result


# ═══════════════════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════════════════

def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    """Convert a sqlite Row to dict, parsing JSON fields."""
    d = dict(row)
    if "parameters" in d and isinstance(d["parameters"], str):
        try:
            d["parameters"] = json.loads(d["parameters"])
        except (json.JSONDecodeError, TypeError):
            d["parameters"] = {}
    # Remove rank column if present (from FTS joins)
    d.pop("rank", None)
    return d


def record_count() -> int:
    """Return total number of mission records."""
    with get_connection() as conn:
        row = conn.execute("SELECT COUNT(*) as cnt FROM mission_records").fetchone()
        return row["cnt"] if row else 0
