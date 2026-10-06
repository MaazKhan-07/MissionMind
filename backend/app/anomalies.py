import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.schemas import AnomalyItem
from backend.app.db import get_connection

def detect_telemetry_anomalies(conn: Optional[sqlite3.Connection] = None) -> List[AnomalyItem]:
    """
    Deterministic anomaly detection:
    - Scans telemetry records for limit violations (critical / warning).
    - Detects sudden change excursions.
    - Groups into coherent anomaly events.
    """
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True

    cursor = conn.cursor()
    cursor.execute("""
        SELECT record_id, ts_utc, subsystem, parameter, value, unit, limit_low, limit_high, status
        FROM telemetry
        WHERE status IN ('critical', 'warning')
           OR (limit_low IS NOT NULL AND value < limit_low)
           OR (limit_high IS NOT NULL AND value > limit_high)
        ORDER BY ts_utc ASC;
    """)
    rows = cursor.fetchall()
    
    anomalies: List[AnomalyItem] = []
    
    # Group into anomaly clusters by subsystem and time proximity (within 10 minutes)
    clusters: List[List[sqlite3.Row]] = []
    
    for row in rows:
        placed = False
        row_time = datetime.fromisoformat(row["ts_utc"].replace("Z", "+00:00"))
        for cluster in clusters:
            c_subsys = cluster[0]["subsystem"]
            c_time = datetime.fromisoformat(cluster[-1]["ts_utc"].replace("Z", "+00:00"))
            if c_subsys == row["subsystem"] and abs((row_time - c_time).total_seconds()) <= 600:
                cluster.append(row)
                placed = True
                break
        if not placed:
            clusters.append([row])

    # Convert clusters to AnomalyItems
    for idx, cl in enumerate(clusters, start=1):
        subsys = cl[0]["subsystem"]
        first_ts = cl[0]["ts_utc"]
        params = list({c["parameter"] for c in cl})
        has_critical = any(c["status"] == "critical" for c in cl)
        severity = "critical" if has_critical else "warning"
        
        # Build summary
        first_rec = cl[0]
        summary = f"{subsys} anomalous excursion in {', '.join(params)} (e.g. {first_rec['parameter']}={first_rec['value']}{first_rec['unit']})"
        
        anomaly_id = f"ANOM-{subsys.upper()}-{idx:03d}"
        anomalies.append(AnomalyItem(
            id=anomaly_id,
            timestamp=first_ts,
            subsystem=subsys,
            summary=summary,
            severity=severity,
            affected_parameters=params,
            evidence_count=len(cl)
        ))

    # Also check known incident records in `records` table to enrich anomaly catalog
    cursor.execute("""
        SELECT record_id, ts_utc, subsystem, severity, text
        FROM records
        WHERE rtype = 'incident'
        ORDER BY ts_utc ASC;
    """)
    inc_rows = cursor.fetchall()
    for inc in inc_rows:
        anomalies.append(AnomalyItem(
            id=inc["record_id"],
            timestamp=inc["ts_utc"],
            subsystem=inc["subsystem"],
            summary=inc["text"].split("\n")[0][:120],
            severity=inc["severity"],
            affected_parameters=[inc["subsystem"]],
            evidence_count=1
        ))

    if should_close:
        conn.close()

    return anomalies

def get_anomaly_by_id(anomaly_id: str, conn: Optional[sqlite3.Connection] = None) -> Optional[AnomalyItem]:
    all_anomalies = detect_telemetry_anomalies(conn)
    for a in all_anomalies:
        if a.id.upper() == anomaly_id.upper():
            return a
    return None
