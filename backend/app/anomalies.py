import json
from typing import List, Dict, Any
from app.db import get_db_connection
from app.schemas import SimilarIncidentItem

def get_all_anomalies() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM anomalies ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    
    anomalies = []
    for r in rows:
        anomalies.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "subsystem": r["subsystem"],
            "severity": r["severity"],
            "summary": r["summary"],
            "default_query": r["default_query"],
            "affected_parameters": json.loads(r["affected_parameters"]),
            "evidence_count": r["evidence_count"]
        })
    conn.close()
    return anomalies

def get_similar_incidents(subsystem: str) -> List[SimilarIncidentItem]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents")
    rows = cursor.fetchall()
    
    results = []
    for r in rows:
        reasons = json.loads(r["matching_reasons"]) if r["matching_reasons"] else []
        results.append(SimilarIncidentItem(
            id=r["id"],
            title=r["title"],
            similarity=r["similarity_score"] or 0.92,
            reasons=reasons
        ))
    conn.close()
    return results
