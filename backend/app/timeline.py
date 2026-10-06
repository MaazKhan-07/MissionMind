from typing import List, Dict, Any, Optional
from app.db import get_db_connection
from app.schemas import TimelineItem

def get_deterministic_timeline(anomaly_id: Optional[str] = None) -> List[TimelineItem]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM records ORDER BY timestamp ASC")
    rows = cursor.fetchall()
    
    timeline_events = []
    
    for r in rows:
        ts_full = r["timestamp"]
        # Format timestamp to 14:XX:XX
        time_str = ts_full.split(" ")[1] if " " in ts_full else ts_full
        
        event_label = r["content"]
        if r["type"] == "Telemetry":
            event_label = f"{r['subsystem']} {r['parameter']} = {r['value']} ({r['status']})"
        elif r["type"] == "Log":
            event_label = f"LOG: {r['content']}"
        elif r["type"] == "Incident":
            event_label = f"INCIDENT: {r['value']} - {r['content']}"
        elif r["type"] == "Procedure":
            event_label = f"PROCEDURE: {r['content']}"

        timeline_events.append(TimelineItem(
            timestamp=time_str,
            event=event_label,
            subsystem=r["subsystem"],
            source_id=r["id"],
            severity=r["severity"] or "INFO"
        ))

    conn.close()
    return timeline_events
