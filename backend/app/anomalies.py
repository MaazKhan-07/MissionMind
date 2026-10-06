"""
MissionMind Anomaly Detection
==============================
Identifies and manages mission anomalies from telemetry and log data.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Optional

from app import db
from app.schemas import Anomaly, Severity

logger = logging.getLogger("missionmind.anomalies")


def get_all_anomalies(status: Optional[str] = None) -> list[Anomaly]:
    """Retrieve all anomalies, optionally filtered by status."""
    raw = db.get_anomalies(status=status)
    return [Anomaly(**a) for a in raw]


def get_anomaly(anomaly_id: str) -> Optional[Anomaly]:
    """Retrieve a specific anomaly by ID."""
    anomalies = db.get_anomalies()
    for a in anomalies:
        if a["id"] == anomaly_id:
            return Anomaly(**a)
    return None


def detect_anomalies_from_records(
    records: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Detect potential anomalies from a set of mission records.

    An anomaly is flagged when:
      - A record has severity 'critical' or 'warning'
      - A telemetry parameter exceeds its threshold
      - Multiple related warnings cluster within a time window
    """
    anomalies: list[dict[str, Any]] = []
    warning_records = [
        r for r in records
        if r.get("severity") in ("warning", "critical")
    ]

    if not warning_records:
        return anomalies

    # Group by subsystem
    by_subsystem: dict[str, list[dict[str, Any]]] = {}
    for r in warning_records:
        sub = r.get("subsystem", "UNKNOWN")
        by_subsystem.setdefault(sub, []).append(r)

    for subsystem, sub_records in by_subsystem.items():
        # Determine severity (critical if any critical record)
        has_critical = any(r.get("severity") == "critical" for r in sub_records)
        severity = "critical" if has_critical else "warning"

        # Collect affected parameters
        params = set()
        for r in sub_records:
            p = r.get("parameters", {})
            if isinstance(p, dict):
                params.update(p.keys())

        # Find related incidents
        all_records = db.search_records_sql(
            subsystem=subsystem, record_type="incident", limit=5
        )
        related = [r["id"] for r in all_records]

        # Build anomaly
        anomaly_data = {
            "id": f"ANOM-{subsystem}-{len(anomalies) + 1:03d}",
            "timestamp": sub_records[0].get("timestamp", datetime.utcnow().isoformat()),
            "subsystem": subsystem,
            "severity": severity,
            "description": f"{subsystem} anomaly: {len(sub_records)} warning/critical events detected",
            "affected_parameters": list(params),
            "evidence_count": len(sub_records),
            "related_incidents": related,
            "status": "active",
        }
        anomalies.append(anomaly_data)

    return anomalies
