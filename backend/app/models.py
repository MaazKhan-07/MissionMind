from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field

class RecordModel(BaseModel):
    record_id: str
    rtype: str  # telemetry, log, procedure, incident
    ts_utc: str
    subsystem: str
    severity: str  # info, warning, critical
    text: str
    raw_json: str
    source_file: str

class TelemetryModel(BaseModel):
    record_id: str
    ts_utc: str
    subsystem: str
    parameter: str
    value: float
    unit: str
    limit_low: Optional[float] = None
    limit_high: Optional[float] = None
    status: str  # normal, warning, critical

class EmbeddingModel(BaseModel):
    record_id: str
    vec: list[float]

class AuditLogModel(BaseModel):
    seq: Optional[int] = None
    ts_utc: str
    session_id: str
    event: str
    payload_json: str
    prev_hash: str
    hash: str
