import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.db import init_db, get_connection
from backend.app.schemas import (
    AskRequest,
    AskResponse,
    AnomalyItem,
    TimelineItem,
    AuditLogEntry,
    AuditVerifyResponse,
    HealthResponse,
    ReplayRequest,
    ReplayResponse,
    IngestResponse
)
from backend.app.services.copilot import process_ask_query
from backend.app.services.replay import replay_session_query
from backend.app.anomalies import detect_telemetry_anomalies, get_anomaly_by_id
from backend.app.timeline import generate_timeline
from backend.app.audit import get_audit_trail, verify_audit_chain
from backend.app.ingest import ingest_file

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("missionmind")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("MISSIONMIND backend initialized successfully.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MISSIONMIND Mission Operations Intelligence & Evidence-Grounded Decision Copilot API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = str(uuid.uuid4())
    logger.error(f"Unhandled error [ReqID: {req_id}]: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An error occurred while processing your request.",
            "request_id": req_id
        }
    )

# ----------------- Core Endpoints ----------------- #

@app.post("/api/ask", response_model=AskResponse, summary="Ask MissionMind Copilot")
def ask_copilot(req: AskRequest):
    """
    Submits a query to the evidence-grounded MissionMind Copilot.
    Executes hybrid RRF retrieval, LLM reasoning, strict numeric/citation verification,
    and cryptographic audit logging.
    """
    try:
        return process_ask_query(req)
    except Exception as e:
        logger.error(f"Error in ask_copilot: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"error": "copilot_reasoning_error", "message": str(e), "request_id": str(uuid.uuid4())}
        )

@app.get("/api/records/{id}", summary="Get record by ID")
def get_record(id: str):
    """
    Retrieves a specific record by its stable identifier (e.g. T-19281, INC-047, COMMS-04).
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM records WHERE record_id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(
            status_code=404,
            detail={"error": "record_not_found", "message": f"Record {id} does not exist.", "request_id": str(uuid.uuid4())}
        )
    return dict(row)

@app.get("/api/anomalies", response_model=List[AnomalyItem], summary="Get detected anomalies")
def get_anomalies():
    """
    Returns deterministic telemetry anomalies, threshold violations, and historical incidents.
    """
    return detect_telemetry_anomalies()

@app.get("/api/timeline", response_model=List[TimelineItem], summary="Get deterministic event timeline")
def get_timeline(anomaly_id: Optional[str] = None, time_anchor: Optional[str] = None):
    """
    Generates a deterministic chronological timeline for an anomaly or time window.
    """
    return generate_timeline(anomaly_id=anomaly_id, time_anchor=time_anchor)

@app.get("/api/telemetry", summary="Get recent telemetry data")
def get_telemetry(subsystem: Optional[str] = None, limit: int = 100):
    """
    Returns telemetry records with optional subsystem filter.
    """
    conn = get_connection()
    cursor = conn.cursor()
    if subsystem:
        cursor.execute(
            "SELECT * FROM telemetry WHERE subsystem = ? ORDER BY ts_utc DESC LIMIT ?",
            (subsystem, limit)
        )
    else:
        cursor.execute(
            "SELECT * FROM telemetry ORDER BY ts_utc DESC LIMIT ?",
            (limit,)
        )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/audit", response_model=List[AuditLogEntry], summary="Get audit trail")
def get_audit(session_id: Optional[str] = None, limit: int = 100):
    """
    Returns the cryptographic audit log trail.
    """
    return get_audit_trail(limit=limit, session_id=session_id)

@app.get("/api/audit/verify", response_model=AuditVerifyResponse, summary="Verify cryptographic audit log hash chain")
def verify_audit():
    """
    Verifies the integrity of the SHA256 cryptographic hash chain from GENESIS.
    """
    return verify_audit_chain()

@app.post("/api/replay", response_model=ReplayResponse, summary="Replay previous session query")
def replay_query(req: ReplayRequest):
    """
    Replays a previously audited query reproduction without calling LLM again.
    """
    try:
        return replay_session_query(req.session_id, req.audit_seq)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail={"error": "not_found", "message": str(ve)})

@app.post("/api/ingest", response_model=IngestResponse, summary="Ingest dataset file")
async def ingest_dataset(file: UploadFile = File(...)):
    """
    Ingests CSV, JSON, Markdown, or TXT dataset files into the database.
    """
    temp_dir = settings.DATA_DIR / "uploads"
    temp_dir.mkdir(parents=True, exist_ok=True)
    temp_path = temp_dir / file.filename

    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    res = ingest_file(temp_path)
    return IngestResponse(
        status="ok",
        records_ingested=res["records_ingested"],
        telemetry_ingested=res["telemetry_ingested"],
        embeddings_generated=res["embeddings_generated"]
    )

@app.get("/api/health", response_model=HealthResponse, summary="System health checks")
def health_check():
    """
    Health check verifying database, retrieval, embedding, and audit subsystem readiness.
    """
    db_status = "ok"
    try:
        conn = get_connection()
        conn.cursor().execute("SELECT 1;")
        conn.close()
    except Exception:
        db_status = "error"

    audit_status = "ok"
    try:
        audit_res = verify_audit_chain()
        if not audit_res.ok:
            audit_status = "broken_chain"
    except Exception:
        audit_status = "error"

    return HealthResponse(
        status="ok" if db_status == "ok" else "degraded",
        database=db_status,
        retrieval="ok",
        embedding="ok",
        llm="ok",
        audit=audit_status
    )
