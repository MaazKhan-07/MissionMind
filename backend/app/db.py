import sqlite3
import json
import numpy as np
from pathlib import Path
from typing import Optional, Any, List, Dict
from backend.app.config import settings

def get_connection() -> sqlite3.Connection:
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(settings.DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS records (
        record_id TEXT PRIMARY KEY,
        rtype TEXT NOT NULL,
        ts_utc TEXT NOT NULL,
        subsystem TEXT NOT NULL,
        severity TEXT NOT NULL,
        text TEXT NOT NULL,
        raw_json TEXT,
        source_file TEXT
    );
    """)

    # Telemetry Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry (
        record_id TEXT PRIMARY KEY,
        ts_utc TEXT NOT NULL,
        subsystem TEXT NOT NULL,
        parameter TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        limit_low REAL,
        limit_high REAL,
        status TEXT NOT NULL
    );
    """)

    # Embeddings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS embeddings (
        record_id TEXT PRIMARY KEY,
        vec BLOB NOT NULL
    );
    """)

    # Audit Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_log (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        ts_utc TEXT NOT NULL,
        session_id TEXT NOT NULL,
        event TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        prev_hash TEXT NOT NULL,
        hash TEXT NOT NULL
    );
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_ts ON records(ts_utc);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_subsystem ON records(subsystem);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_severity ON records(severity);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_rtype ON records(rtype);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_ts ON telemetry(ts_utc);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_subsystem ON telemetry(subsystem);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_param ON telemetry(parameter);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_status ON telemetry(status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_log(session_id);")

    # FTS5 Virtual Table
    cursor.execute("""
    CREATE VIRTUAL TABLE IF NOT EXISTS records_fts USING fts5(
        record_id UNINDEXED,
        subsystem,
        severity,
        text
    );
    """)

    conn.commit()
    conn.close()

def rebuild_fts():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM records_fts;")
    cursor.execute("""
        INSERT INTO records_fts(record_id, subsystem, severity, text)
        SELECT record_id, subsystem, severity, text FROM records;
    """)
    conn.commit()
    conn.close()

def serialize_vec(vec: list[float] | np.ndarray) -> bytes:
    arr = np.array(vec, dtype=np.float32)
    return arr.tobytes()

def deserialize_vec(b: bytes) -> np.ndarray:
    return np.frombuffer(b, dtype=np.float32)
