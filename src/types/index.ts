export type SubsystemType = 'EPS' | 'COMMS' | 'TCS' | 'ADCS' | 'OBT' | 'ALL';
export type SeverityType = 'NOMINAL' | 'INFO' | 'WARNING' | 'CRITICAL';
export type ConfidenceType = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Fact {
  id: string;
  statement: string;
  citation: string;
  parameter?: string;
  observed_value?: string;
}

export interface Inference {
  id: string;
  statement: string;
  confidence: ConfidenceType;
  reasoning: string;
  citations: string[];
}

export interface Recommendation {
  step_number: number;
  action: string;
  procedure_id: string;
  procedure_name: string;
}

export interface DroppedClaim {
  id: string;
  claim: string;
  reason: string;
  source_cited: string;
  raw_value_in_record: string;
}

export interface CopilotAnswer {
  query: string;
  time_window: {
    start: string;
    end: string;
  };
  retrieved_records_count: number;
  abstain: boolean;
  abstain_reason?: string;
  missing_data?: string[];
  facts: Fact[];
  inferences: Inference[];
  recommendations: Recommendation[];
  dropped_claims: DroppedClaim[];
  prompt_injection_detected?: boolean;
  suspicious_source?: string;
  audit_session_id: string;
  chain_hash: string;
  retrieval_strength: ConfidenceType;
}

export interface EvidenceRecord {
  id: string;
  type: 'Telemetry' | 'Log' | 'Incident' | 'Procedure';
  timestamp: string;
  subsystem: SubsystemType;
  parameter?: string;
  value?: string | number;
  unit?: string;
  limit?: string;
  status?: 'NOMINAL' | 'WARNING' | 'LOW' | 'HIGH' | 'CRITICAL';
  source_file: string;
  raw_content: string;
  details?: Record<string, any>;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  time_offset: string;
  severity: SeverityType;
  event: string;
  subsystem: SubsystemType;
  source_id: string;
  details?: string;
}

export interface AnomalyItem {
  id: string;
  title: string;
  severity: SeverityType;
  timestamp: string;
  subsystem: string;
  subsystem_impact: string;
  description: string;
  evidence_count: number;
  suggested_query: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
}

export interface TelemetryPoint {
  time: string;
  timestamp: string;
  battery_voltage: number;
  comms_current: number;
  signal_strength: number;
  temperature: number;
  is_anomaly: boolean;
  notes?: string;
}

export interface HistoricalIncident {
  id: string;
  title: string;
  subsystems: string;
  similarity_score: number;
  similarity_reasons: string[];
  root_cause: string;
  resolution: string;
  timestamp: string;
  procedure_used: string;
}

export interface ProcedureStep {
  step_number: number;
  action: string;
  description: string;
  verification_telemetry?: string;
}

export interface OperationalProcedure {
  id: string;
  title: string;
  subsystem: SubsystemType;
  revision: string;
  last_updated: string;
  source: string;
  purpose: string;
  steps: ProcedureStep[];
}

export interface AuditEntry {
  session_id: string;
  timestamp: string;
  query: string;
  retrieved_record_ids: string[];
  raw_model_output: string;
  validated_output: string;
  dropped_claims_count: number;
  previous_hash: string;
  current_hash: string;
  chain_status: 'VERIFIED' | 'TAMPERED';
}

export interface MissionHealthData {
  health_percentage: number;
  power: {
    voltage: number;
    unit: string;
    status: SeverityType;
    limit: string;
    sparkline: number[];
  };
  comms: {
    signal_strength: number;
    unit: string;
    status: SeverityType;
    limit: string;
    sparkline: number[];
  };
  thermal: {
    temp: number;
    unit: string;
    status: SeverityType;
    limit: string;
    sparkline: number[];
  };
  subsystems: {
    name: string;
    status: SeverityType;
    load: number;
  }[];
}
