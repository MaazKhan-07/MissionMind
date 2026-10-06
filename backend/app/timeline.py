import sqlite3
import re
from typing import List, Optional
from datetime import datetime, timedelta
from backend.app.schemas import TimelineItem
from backend.app.db import get_connection

def generate_timeline(
    anomaly_id: Optional[str] = None,
    time_anchor: Optional[str] = None,
    window_before_min: int = 20,
    window_after_min: int = 15,
    conn: Optional[sqlite3.Connection] = None
) -> List[TimelineItem]:
    """
    Generates a strictly deterministic chronological event sequence across telemetry, logs, and incidents.
    Never uses LLM for event generation.
    """
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True

    cursor = conn.cursor()
    target_time: Optional[datetime] = None

    if anomaly_id:
        # Look up anomaly timestamp if record exists
        cursor.execute("SELECT ts_utc FROM records WHERE record_id = ?", (anomaly_id,))
        row = cursor.fetchone()
        if row:
            target_time = datetime.fromisoformat(row["ts_utc"].replace("Z", "+00:00"))

    if not target_time and time_anchor:
        # Try parse ISO timestamp or time string like 14:32
        try:
            target_time = datetime.fromisoformat(time_anchor.replace("Z", "+00:00"))
        except ValueError:
            m = re.search(r"(\d{1,2}):(\d{2})", time_anchor)
            if m:
                # Find matching record on that hour/minute
                hour, minute = int(m.group(1)), int(m.group(2))
                cursor.execute(
                    "SELECT ts_utc FROM records WHERE strftime('%H', ts_utc) = ? AND strftime('%M', ts_utc) = ? ORDER BY ts_utc ASC LIMIT 1",
                    (f"{hour:02d}", f"{minute:02d}")
                )
                row = cursor.fetchone()
                if row:
                    target_time = datetime.fromisoformat(row["ts_utc"].replace("Z", "+00:00"))

    # Query records and telemetry in window
    timeline_items: List[TimelineItem] = []

    if target_time:
        start_ts = (target_time - timedelta(minutes=window_before_min)).isoformat()
        end_ts = (target_time + timedelta(minutes=window_after_min)).isoformat()

        # Query records
        cursor.execute("""
            SELECT record_id, ts_utc, subsystem, severity, rtype, text
            FROM records
            WHERE ts_utc >= ? AND ts_utc <= ?
            ORDER BY ts_utc ASC;
        """, (start_ts, end_ts))
        record_rows = cursor.fetchall()

        # Query telemetry
        cursor.execute("""
            SELECT record_id, ts_utc, subsystem, parameter, value, unit, status
            FROM telemetry
            WHERE ts_utc >= ? AND ts_utc <= ?
            ORDER BY ts_utc ASC;
        """, (start_ts, end_ts))
        telemetry_rows = cursor.fetchall()
    else:
        # Default: latest anomaly / critical events
        cursor.execute("""
            SELECT record_id, ts_utc, subsystem, severity, rtype, text
            FROM records
            ORDER BY ts_utc DESC LIMIT 30;
        """)
        record_rows = cursor.fetchall()
        
        cursor.execute("""
            SELECT record_id, ts_utc, subsystem, parameter, value, unit, status
            FROM telemetry
            WHERE status IN ('warning', 'critical')
            ORDER BY ts_utc DESC LIMIT 30;
        """)
        telemetry_rows = cursor.fetchall()

    for r in record_rows:
        label = r["text"].split("\n")[0][:100]
        timeline_items.append(TimelineItem(
            timestamp=r["ts_utc"],
            label=f"[{r['subsystem']}] {label}",
            severity=r["severity"],
            record_id=r["record_id"]
        ))

    for t in telemetry_rows:
        status_label = f" ({t['status'].upper()})" if t['status'] != 'normal' else ""
        label = f"[{t['subsystem']}] {t['parameter']}: {t['value']} {t['unit']}{status_label}"
        severity = "critical" if t["status"] == "critical" else ("warning" if t["status"] == "warning" else "info")
        timeline_items.append(TimelineItem(
            timestamp=t["ts_utc"],
            label=label,
            severity=severity,
            record_id=t["record_id"]
        ))

    # Sort strictly by timestamp ASC
    timeline_items.sort(key=lambda x: x.timestamp)

    if should_close:
        conn.close()

    return timeline_items
