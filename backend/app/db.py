import os
import sqlite3
import json
from typing import Dict, Any, List, Optional
from app.config import settings

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        subsystem TEXT NOT NULL,
        parameter TEXT,
        value TEXT,
        limit_range TEXT,
        status TEXT,
        content TEXT NOT NULL,
        numerical_value REAL,
        severity TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        subsystem TEXT NOT NULL,
        severity TEXT NOT NULL,
        summary TEXT NOT NULL,
        similarity_score REAL,
        matching_reasons TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS procedures (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        revision TEXT NOT NULL,
        subsystem TEXT NOT NULL,
        steps TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS anomalies (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        subsystem TEXT NOT NULL,
        severity TEXT NOT NULL,
        summary TEXT NOT NULL,
        default_query TEXT NOT NULL,
        affected_parameters TEXT NOT NULL,
        evidence_count INTEGER NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        query TEXT NOT NULL,
        retrieved_record_ids TEXT NOT NULL,
        retrieval_strength REAL NOT NULL,
        raw_model_output TEXT NOT NULL,
        validated_output TEXT NOT NULL,
        dropped_claims_count INTEGER NOT NULL,
        previous_hash TEXT NOT NULL,
        hash TEXT NOT NULL
    );
    """)

    # Check if records table is empty, seed it
    cursor.execute("SELECT COUNT(*) FROM records")
    count = cursor.fetchone()[0]

    if count == 0 and os.path.exists(settings.SEED_DATA_PATH):
        with open(settings.SEED_DATA_PATH, "r", encoding="utf-8") as f:
            seed = json.load(f)

        for item in seed.get("telemetry", []):
            cursor.execute(
                "INSERT OR REPLACE INTO records (id, type, timestamp, subsystem, parameter, value, limit_range, status, content, numerical_value, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    item["id"], "Telemetry", item["timestamp"], item["subsystem"],
                    item.get("parameter", "N/A"), item.get("value", "N/A"),
                    f"{item.get('limit_min', '')} - {item.get('limit_max', '')} {item.get('unit', '')}".strip(),
                    item.get("status", "NOMINAL"), item["content"],
                    item.get("numerical_value"), item.get("status", "INFO")
                )
            )

        for item in seed.get("logs", []):
            cursor.execute(
                "INSERT OR REPLACE INTO records (id, type, timestamp, subsystem, parameter, value, limit_range, status, content, numerical_value, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    item["id"], "Log", item["timestamp"], item["subsystem"],
                    "log_entry", "LOG", "N/A",
                    item.get("severity", "INFO"), item["content"],
                    None, item.get("severity", "INFO")
                )
            )

        for item in seed.get("incidents", []):
            cursor.execute(
                "INSERT OR REPLACE INTO incidents (id, title, timestamp, subsystem, severity, summary, similarity_score, matching_reasons) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    item["id"], item["title"], item["timestamp"], item["subsystem"],
                    item["severity"], item["summary"], item.get("similarity_score", 0.9),
                    json.dumps(item.get("matching_reasons", []))
                )
            )
            cursor.execute(
                "INSERT OR REPLACE INTO records (id, type, timestamp, subsystem, parameter, value, limit_range, status, content, numerical_value, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    item["id"], "Incident", item["timestamp"], item["subsystem"],
                    "incident_summary", item["title"], "N/A",
                    item.get("severity", "MAJOR"), item["summary"],
                    None, item.get("severity", "MAJOR")
                )
            )

        for item in seed.get("procedures", []):
            cursor.execute(
                "INSERT OR REPLACE INTO procedures (id, title, revision, subsystem, steps) VALUES (?, ?, ?, ?, ?)",
                (
                    item["id"], item["title"], item["revision"], item["subsystem"],
                    json.dumps(item["steps"])
                )
            )
            cursor.execute(
                "INSERT OR REPLACE INTO records (id, type, timestamp, subsystem, parameter, value, limit_range, status, content, numerical_value, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    item["id"], "Procedure", "2025-01-15 00:00:00 UTC", item["subsystem"],
                    "procedure_doc", item["revision"], "N/A",
                    "APPROVED", item["title"] + " - " + "; ".join([s["action"] for s in item["steps"]]),
                    None, "INFO"
                )
            )

        for item in seed.get("anomalies", []):
            cursor.execute(
                "INSERT OR REPLACE INTO anomalies (id, timestamp, subsystem, severity, summary, default_query, affected_parameters, evidence_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    item["id"], item["timestamp"], item["subsystem"], item["severity"],
                    item["summary"], item["default_query"], json.dumps(item["affected_parameters"]),
                    item["evidence_count"]
                )
            )

    conn.commit()
    conn.close()
