export interface FactItem {
  claim: string;
  citation: string;
  verifiable: boolean;
  numeric_verified?: boolean;
}

export interface InferenceItem {
  claim: string;
  citations: string[];
}

export interface RecommendationItem {
  action: string;
  procedure_id?: string;
  citations: string[];
  step_number?: number;
}

export interface DroppedClaimItem {
  original_claim: string;
  citation: string;
  reason: string;
  failure_type: string;
}

export interface AnswerOutput {
  abstain: boolean;
  abstain_reason?: string;
  missing_data: string[];
  facts: FactItem[];
  inferences: InferenceItem[];
  recommendations: RecommendationItem[];
}

export interface EvidenceRecord {
  id: string;
  type: string;
  timestamp: string;
  subsystem: string;
  parameter?: string;
  value?: string;
  limit?: string;
  status: string;
  content: string;
  numerical_value?: number;
  severity?: string;
}

export interface TimelineItem {
  timestamp: string;
  event: string;
  subsystem: string;
  source_id: string;
  severity: string;
}

export interface SimilarIncidentItem {
  id: string;
  title: string;
  similarity: number;
  reasons: string[];
}

export interface AskResponse {
  answer: AnswerOutput;
  records: Record<string, EvidenceRecord>;
  dropped: number;
  dropped_claims: DroppedClaimItem[];
  retrieval_strength: number;
  timeline: TimelineItem[];
  injection_detected: boolean;
  injection_details?: {
    detected: boolean;
    pattern_matched: string;
    action_taken: string;
    source: string;
  };
  similar_incidents: SimilarIncidentItem[];
  evidence_coverage?: {
    coverage_percent: number;
    verified_claims: number;
    dropped_claims: number;
    missing_claims: number;
  };
}

export interface AuditItem {
  id: string;
  session_id: string;
  timestamp: string;
  query: string;
  retrieved_record_ids: string[];
  retrieval_strength: number;
  raw_model_output: any;
  validated_output: any;
  dropped_claims_count: number;
  previous_hash: string;
  hash: string;
}

export interface AuditVerifyResponse {
  ok: boolean;
  entries_checked: number;
  chain_valid: boolean;
  message: string;
  latest_hash?: string;
}

export interface AnomalyItem {
  id: string;
  timestamp: string;
  subsystem: string;
  severity: string;
  summary: string;
  default_query: string;
  affected_parameters: string[];
  evidence_count: number;
}

export interface ProcedureStep {
  step_number: number;
  action: string;
  rationale: string;
}

export interface ProcedureItem {
  id: string;
  title: string;
  revision: string;
  subsystem: string;
  steps: ProcedureStep[];
}

export interface TelemetryPoint {
  id: string;
  timestamp: string;
  subsystem: string;
  parameter: string;
  value: string;
  numerical_value?: number;
  status: string;
  limit?: string;
}

export interface HealthResponse {
  status: string;
  database: string;
  retrieval: string;
  llm: string;
  audit: string;
  demo_mode: boolean;
}
