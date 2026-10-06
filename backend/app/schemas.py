from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FactItem(BaseModel):
    claim: str
    citation: str
    verifiable: bool = True
    numeric_verified: Optional[bool] = True

class InferenceItem(BaseModel):
    claim: str
    citations: List[str]

class RecommendationItem(BaseModel):
    action: str
    procedure_id: Optional[str] = None
    citations: List[str] = Field(default_factory=list)
    step_number: Optional[int] = None

class DroppedClaimItem(BaseModel):
    original_claim: str
    citation: str
    reason: str
    failure_type: str = "NUMERIC_MISMATCH"  # NUMERIC_MISMATCH | MISSING_CITATION | INSTRUCTION_INJECTION

class AnswerOutput(BaseModel):
    abstain: bool = False
    abstain_reason: Optional[str] = None
    missing_data: List[str] = Field(default_factory=list)
    facts: List[FactItem] = Field(default_factory=list)
    inferences: List[InferenceItem] = Field(default_factory=list)
    recommendations: List[RecommendationItem] = Field(default_factory=list)

class AskRequest(BaseModel):
    query: str
    anomaly_id: Optional[str] = None
    session_id: Optional[str] = "MM-SESSION-001"

class EvidenceRecord(BaseModel):
    id: str
    type: str  # Telemetry | Log | Incident | Procedure
    timestamp: str
    subsystem: str
    parameter: Optional[str] = "N/A"
    value: Optional[str] = "N/A"
    limit: Optional[str] = "N/A"
    status: str = "NOMINAL"
    content: str
    numerical_value: Optional[float] = None
    severity: Optional[str] = "INFO"

class TimelineItem(BaseModel):
    timestamp: str
    event: str
    subsystem: str
    source_id: str
    severity: str = "INFO"

class SimilarIncidentItem(BaseModel):
    id: str
    title: str
    similarity: float
    reasons: List[str]

class AskResponse(BaseModel):
    answer: AnswerOutput
    records: Dict[str, Dict[str, Any]]
    dropped: int = 0
    dropped_claims: List[DroppedClaimItem] = Field(default_factory=list)
    retrieval_strength: float = 0.90
    timeline: List[TimelineItem] = Field(default_factory=list)
    injection_detected: bool = False
    injection_details: Optional[Dict[str, Any]] = None
    similar_incidents: List[SimilarIncidentItem] = Field(default_factory=list)
    evidence_coverage: Dict[str, Any] = Field(default_factory=dict)

class AuditItem(BaseModel):
    id: str
    session_id: str
    timestamp: str
    query: str
    retrieved_record_ids: List[str]
    retrieval_strength: float
    raw_model_output: Dict[str, Any]
    validated_output: Dict[str, Any]
    dropped_claims_count: int
    previous_hash: str
    hash: str

class AuditVerifyResponse(BaseModel):
    ok: bool
    entries_checked: int
    chain_valid: bool
    message: str
    latest_hash: Optional[str] = None

class HealthResponse(BaseModel):
    status: str = "ok"
    database: str = "ok"
    retrieval: str = "ok"
    llm: str = "ok"
    audit: str = "ok"
    demo_mode: bool = True
