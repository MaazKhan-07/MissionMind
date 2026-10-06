"""
MissionMind Pydantic Schemas
============================
Defines the core output model and all request / response types.

Central identity of MissionMind:
    Every response contains OBSERVED FACTS + INFERENCES + RECOMMENDATIONS
    or ABSTAIN.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════════════════
# Enums
# ═══════════════════════════════════════════════════════════════════════════

class Severity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class Confidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RecordType(str, Enum):
    TELEMETRY = "telemetry"
    LOG = "log"
    INCIDENT = "incident"
    PROCEDURE = "procedure"
    COMMAND = "command"


# ═══════════════════════════════════════════════════════════════════════════
# Mission Record (input)
# ═══════════════════════════════════════════════════════════════════════════

class MissionRecord(BaseModel):
    """A single mission record as stored in the database."""
    id: str = Field(..., description="Unique record ID e.g. T-19281, INC-047, COMMS-04")
    timestamp: datetime
    subsystem: str
    record_type: RecordType
    severity: Severity = Severity.INFO
    text: str = Field(..., description="Full textual content of the record")
    parameters: dict[str, Any] = Field(default_factory=dict,
                                       description="Structured key-value data")


# ═══════════════════════════════════════════════════════════════════════════
# AI Output — Facts, Inferences, Recommendations
# ═══════════════════════════════════════════════════════════════════════════

class Fact(BaseModel):
    """An observed fact directly supported by a retrieved record."""
    statement: str
    citations: list[str] = Field(..., min_length=1,
                                 description="IDs of supporting records")


class Inference(BaseModel):
    """An inference drawn from multiple observed facts."""
    statement: str
    confidence: Confidence
    reasoning: str
    citations: list[str] = Field(..., min_length=1)


class Recommendation(BaseModel):
    """An operationally conservative recommendation."""
    order: int
    action: str
    rationale: str
    procedure_id: Optional[str] = None
    citations: list[str] = Field(default_factory=list)


class SimilarIncident(BaseModel):
    """A previous incident with measured similarity."""
    incident_id: str
    similarity: float = Field(..., ge=0.0, le=1.0)
    reason: str


# ═══════════════════════════════════════════════════════════════════════════
# Core AI Answer — the central output model
# ═══════════════════════════════════════════════════════════════════════════

class MissionMindAnswer(BaseModel):
    """
    The structured answer returned by MissionMind.
    This is the CORE OUTPUT MODEL described in the spec.
    """
    abstain: bool = False
    abstain_reason: Optional[str] = None
    missing_data: list[str] = Field(default_factory=list)
    facts: list[Fact] = Field(default_factory=list)
    inferences: list[Inference] = Field(default_factory=list)
    recommendations: list[Recommendation] = Field(default_factory=list)
    similar_incidents: list[SimilarIncident] = Field(default_factory=list)


# ═══════════════════════════════════════════════════════════════════════════
# Validation Result
# ═══════════════════════════════════════════════════════════════════════════

class ValidationResult(BaseModel):
    """Result of evidence validation on an AI answer."""
    validated_answer: MissionMindAnswer
    dropped_facts: list[Fact] = Field(default_factory=list)
    dropped_inferences: list[Inference] = Field(default_factory=list)
    dropped_recommendations: list[Recommendation] = Field(default_factory=list)
    dropped_count: int = 0
    injection_flags: list[str] = Field(default_factory=list,
                                       description="Record IDs flagged as suspicious")
    confidence_override: Optional[Confidence] = None


# ═══════════════════════════════════════════════════════════════════════════
# Evidence Score
# ═══════════════════════════════════════════════════════════════════════════

class EvidenceScore(BaseModel):
    """Metadata about the evidence supporting an answer."""
    retrieval_strength: float = Field(..., ge=0.0, le=1.0)
    citation_count: int = 0
    valid_citation_count: int = 0
    dropped_claims: int = 0
    matching_incidents: int = 0
    matching_procedures: int = 0
    confidence: Confidence = Confidence.LOW


# ═══════════════════════════════════════════════════════════════════════════
# Timeline Event
# ═══════════════════════════════════════════════════════════════════════════

class TimelineEvent(BaseModel):
    """A single event in a deterministic timeline."""
    timestamp: datetime
    record_id: str
    subsystem: str
    event_type: str
    description: str
    severity: Severity = Severity.INFO


# ═══════════════════════════════════════════════════════════════════════════
# Anomaly
# ═══════════════════════════════════════════════════════════════════════════

class Anomaly(BaseModel):
    """A detected mission anomaly."""
    id: str
    timestamp: datetime
    subsystem: str
    severity: Severity
    description: str
    affected_parameters: list[str] = Field(default_factory=list)
    evidence_count: int = 0
    related_incidents: list[str] = Field(default_factory=list)
    status: str = "active"


# ═══════════════════════════════════════════════════════════════════════════
# Audit Event
# ═══════════════════════════════════════════════════════════════════════════

class AuditEvent(BaseModel):
    """An entry in the tamper-evident audit chain."""
    id: str
    timestamp: datetime
    event_type: str
    session_id: str
    query: Optional[str] = None
    record_ids: list[str] = Field(default_factory=list)
    retrieval_strength: Optional[float] = None
    raw_output: Optional[str] = None
    validated_output: Optional[str] = None
    dropped_claims: int = 0
    previous_hash: Optional[str] = None
    current_hash: str = ""


# ═══════════════════════════════════════════════════════════════════════════
# API Request / Response
# ═══════════════════════════════════════════════════════════════════════════

class AskRequest(BaseModel):
    """Request body for POST /api/ask"""
    query: str
    anomaly_id: Optional[str] = None
    session_id: Optional[str] = None


class AskResponse(BaseModel):
    """Response body for POST /api/ask"""
    answer: MissionMindAnswer
    records: dict[str, MissionRecord] = Field(default_factory=dict)
    evidence_score: EvidenceScore
    dropped: int = 0
    retrieval_strength: float = 0.0
    timeline: list[TimelineEvent] = Field(default_factory=list)
    injection_flags: list[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    """Response body for GET /api/health"""
    status: str = "ok"
    database: str = "ok"
    retrieval: str = "ok"
    llm: str = "ok"
    audit: str = "ok"
    demo_mode: bool = False


class AuditVerifyResponse(BaseModel):
    """Response body for GET /api/audit/verify"""
    ok: bool
    entries_checked: int
    broken_at: Optional[str] = None


class TelemetryPoint(BaseModel):
    """A single telemetry data point."""
    timestamp: datetime
    parameter: str
    value: float
    unit: str = ""
    subsystem: str = ""
    threshold_low: Optional[float] = None
    threshold_high: Optional[float] = None
    status: str = "nominal"
