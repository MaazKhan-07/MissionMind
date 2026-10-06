from typing import Optional, Any, List, Dict, Union
from pydantic import BaseModel, Field

class Fact(BaseModel):
    statement: str
    citations: List[str] = Field(default_factory=list)

class Inference(BaseModel):
    statement: str
    confidence: Union[float, str] = 0.85
    reasoning: str
    citations: List[str] = Field(default_factory=list)

class Recommendation(BaseModel):
    order: int
    action: str
    rationale: str
    procedure_id: Optional[str] = None
    citations: List[str] = Field(default_factory=list)

class CopilotAnswer(BaseModel):
    abstain: bool = False
    abstain_reason: Optional[str] = None
    missing_data: List[str] = Field(default_factory=list)
    facts: List[Fact] = Field(default_factory=list)
    inferences: List[Inference] = Field(default_factory=list)
    recommendations: List[Recommendation] = Field(default_factory=list)

class TimelineItem(BaseModel):
    timestamp: str
    label: str
    severity: str
    record_id: str

class AskRequest(BaseModel):
    query: str
    anomaly_id: Optional[str] = None
    session_id: Optional[str] = None

class AskResponse(BaseModel):
    answer: CopilotAnswer
    records: Dict[str, Any] = Field(default_factory=dict)
    dropped: int = 0
    timeline: List[TimelineItem] = Field(default_factory=list)
    retrieval_strength: float = 0.0

class AnomalyItem(BaseModel):
    id: str
    timestamp: str
    subsystem: str
    summary: str
    severity: str
    affected_parameters: List[str] = Field(default_factory=list)
    evidence_count: int = 0

class AuditLogEntry(BaseModel):
    seq: int
    ts_utc: str
    session_id: str
    event: str
    payload_json: str
    prev_hash: str
    hash: str

class AuditVerifyResponse(BaseModel):
    ok: bool
    entries_checked: int
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str = "ok"
    database: str = "ok"
    retrieval: str = "ok"
    embedding: str = "ok"
    llm: str = "ok"
    audit: str = "ok"

class ReplayRequest(BaseModel):
    session_id: Optional[str] = None
    audit_seq: Optional[int] = None

class ReplayResponse(BaseModel):
    replayed: bool
    query: str
    raw_output: str
    validated_answer: CopilotAnswer
    retrieved_ids: List[str]
    dropped: int

class IngestResponse(BaseModel):
    status: str = "ok"
    records_ingested: int = 0
    telemetry_ingested: int = 0
    embeddings_generated: int = 0

# Compatibility Aliases
MissionMindAnswer = CopilotAnswer
Confidence = Union[float, str]
TimelineEvent = TimelineItem

