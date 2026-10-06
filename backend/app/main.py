import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import init_db, get_db_connection
from app.schemas import (
    AskRequest, AskResponse, HealthResponse, AuditVerifyResponse,
    AuditItem, TimelineItem, EvidenceRecord
)
from app.retrieval import get_record_by_id
from app.anomalies import get_all_anomalies
from app.timeline import get_deterministic_timeline
from app.audit import get_audit_trail, verify_audit_chain
from app.llm import process_copilot_query

# Ensure database is initialized
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="MissionMind API",
    description="Mission Operations Copilot REST API with Evidence-Grounded RAG and Auditability",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        database="ok",
        retrieval="ok",
        llm="ok",
        audit="ok",
        demo_mode=settings.DEMO_MODE
    )

@app.post("/api/ask", response_model=AskResponse)
def ask_missionmind(request: AskRequest):
    try:
        return process_copilot_query(
            query=request.query,
            anomaly_id=request.anomaly_id,
            session_id=request.session_id or "MM-SESSION-001"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/records/{record_id}")
def get_record(record_id: str):
    record = get_record_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Evidence record '{record_id}' not found.")
    return record

@app.get("/api/anomalies")
def get_anomalies():
    return get_all_anomalies()

@app.get("/api/timeline")
def get_timeline(anomaly_id: str = Query(None)):
    return get_deterministic_timeline(anomaly_id)

@app.get("/api/telemetry")
def get_telemetry(subsystem: str = Query(None)):
    conn = get_db_connection()
    cursor = conn.cursor()
    if subsystem:
        cursor.execute("SELECT * FROM records WHERE type = 'Telemetry' AND subsystem = ?", (subsystem,))
    else:
        cursor.execute("SELECT * FROM records WHERE type = 'Telemetry'")
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "subsystem": r["subsystem"],
            "parameter": r["parameter"],
            "value": r["value"],
            "numerical_value": r["numerical_value"],
            "status": r["status"],
            "limit": r["limit_range"]
        })
    return result

@app.get("/api/audit")
def get_audit():
    return get_audit_trail()

@app.get("/api/audit/verify", response_model=AuditVerifyResponse)
def verify_audit():
    return verify_audit_chain()

@app.get("/api/procedures")
def list_procedures():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM procedures")
    rows = cursor.fetchall()
    conn.close()
    
    procs = []
    for r in rows:
        procs.append({
            "id": r["id"],
            "title": r["title"],
            "revision": r["revision"],
            "subsystem": r["subsystem"],
            "steps": json.loads(r["steps"])
        })
    return procs

@app.get("/api/procedures/{procedure_id}")
def get_procedure(procedure_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM procedures WHERE id = ?", (procedure_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail=f"Procedure '{procedure_id}' not found.")
        
    return {
        "id": row["id"],
        "title": row["title"],
        "revision": row["revision"],
        "subsystem": row["subsystem"],
        "steps": json.loads(row["steps"])
    }

@app.get("/api/golden-questions")
def get_golden_questions():
    if os.path.exists(settings.GOLDEN_QUESTIONS_PATH):
        with open(settings.GOLDEN_QUESTIONS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@app.post("/api/eval")
def run_evaluation():
    golden_q = get_golden_questions()
    total = len(golden_q)
    passed = 0
    
    eval_results = []
    for q in golden_q:
        resp = process_copilot_query(q["query"])
        
        is_pass = True
        if q["category"] == "unanswerable" and not resp.answer.abstain:
            is_pass = False
        elif q["category"] == "answerable" and resp.answer.abstain:
            is_pass = False
        elif q["category"] == "security" and not resp.injection_detected:
            is_pass = False
            
        if is_pass:
            passed += 1
            
        eval_results.append({
            "id": q["id"],
            "query": q["query"],
            "category": q["category"],
            "passed": is_pass,
            "abstain": resp.answer.abstain,
            "injection_detected": resp.injection_detected
        })
        
    return {
        "accuracy": round((passed / total) * 100, 1) if total > 0 else 100.0,
        "total_questions": total,
        "passed": passed,
        "results": eval_results
    }
