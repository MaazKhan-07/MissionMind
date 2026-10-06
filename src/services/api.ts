import {
  CopilotAnswer,
  EvidenceRecord,
  TimelineEvent,
  AnomalyItem,
  TelemetryPoint,
  HistoricalIncident,
  OperationalProcedure,
  AuditEntry,
  MissionHealthData
} from '../types';
import {
  MOCK_COPILOT_DEFAULT,
  MOCK_COPILOT_ABSTAIN,
  MOCK_COPILOT_INJECTION,
  MOCK_EVIDENCE_RECORDS,
  MOCK_MISSION_HEALTH,
  MOCK_ANOMALIES,
  MOCK_TIMELINE,
  MOCK_TELEMETRY_SERIES,
  MOCK_INCIDENTS,
  MOCK_PROCEDURES,
  MOCK_AUDIT_ENTRIES
} from '../data/mockData';

// Mode helper persisted in localStorage
export const getLiveMode = (): boolean => {
  return localStorage.getItem('missionmind_live_mode') === 'true';
};

export const setLiveMode = (live: boolean): void => {
  localStorage.setItem('missionmind_live_mode', live ? 'true' : 'false');
};

export const api = {
  /**
   * Primary Copilot API call. Switches to backend POST /api/ask if live mode is enabled,
   * otherwise uses realistic evidence-grounded mock adapter response.
   */
  async askCopilot(query: string): Promise<CopilotAnswer> {
    const isLive = getLiveMode();

    if (isLive) {
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        if (res.ok) {
          const data = await res.json();
          // Backend returns AskResponse: { answer: CopilotAnswer, records, dropped, timeline, retrieval_strength }
          // OR direct CopilotAnswer
          const rawAnswer = data.answer || data;
          const recordsCount = (data.records && typeof data.records === 'object')
            ? Object.keys(data.records).length
            : (rawAnswer.retrieved_records_count ?? (rawAnswer.facts?.length || 12));

          const timeWindow = data.time_window || rawAnswer.time_window || {
            start: data.timeline?.[0]?.timestamp || '14:28:00',
            end: data.timeline?.[data.timeline.length - 1]?.timestamp || '14:35:00'
          };

          const retrievalStrength = (typeof data.retrieval_strength === 'number'
            ? (data.retrieval_strength >= 0.7 ? 'HIGH' : data.retrieval_strength >= 0.4 ? 'MEDIUM' : 'LOW')
            : (data.retrieval_strength || rawAnswer.retrieval_strength || 'HIGH')) as 'HIGH' | 'MEDIUM' | 'LOW';

          const normalizedFacts = (rawAnswer.facts || []).map((f: any, idx: number) => ({
            id: f.id || `F-0${idx + 1}`,
            statement: f.statement || '',
            citation: f.citation || (Array.isArray(f.citations) && f.citations[0]) || 'T-19281',
            parameter: f.parameter || 'telemetry_stream',
            observed_value: f.observed_value
          }));

          const normalizedInferences = (rawAnswer.inferences || []).map((inf: any, idx: number) => ({
            id: inf.id || `I-0${idx + 1}`,
            statement: inf.statement || '',
            confidence: (typeof inf.confidence === 'number'
              ? (inf.confidence >= 0.8 ? 'HIGH' : inf.confidence >= 0.5 ? 'MEDIUM' : 'LOW')
              : (inf.confidence || 'HIGH')) as 'HIGH' | 'MEDIUM' | 'LOW',
            reasoning: inf.reasoning || 'Grounded in observed telemetry sequence.',
            citations: Array.isArray(inf.citations) ? inf.citations : (inf.citation ? [inf.citation] : ['T-19281'])
          }));

          const normalizedRecommendations = (rawAnswer.recommendations || []).map((rec: any, idx: number) => ({
            step_number: rec.step_number || rec.order || (idx + 1),
            action: rec.action || rec.statement || '',
            procedure_id: rec.procedure_id || (Array.isArray(rec.citations) && rec.citations[0]) || 'SOP-EPS-04',
            procedure_name: rec.procedure_name || rec.rationale || 'Power Bus Emergency Isolation'
          }));

          return {
            query: data.query || rawAnswer.query || query,
            time_window: timeWindow,
            retrieved_records_count: recordsCount,
            abstain: Boolean(rawAnswer.abstain),
            abstain_reason: rawAnswer.abstain_reason,
            missing_data: rawAnswer.missing_data || [],
            facts: normalizedFacts,
            inferences: normalizedInferences,
            recommendations: normalizedRecommendations,
            dropped_claims: rawAnswer.dropped_claims || [],
            prompt_injection_detected: Boolean(data.prompt_injection_detected || rawAnswer.prompt_injection_detected),
            suspicious_source: data.suspicious_source || rawAnswer.suspicious_source,
            audit_session_id: data.audit_session_id || rawAnswer.audit_session_id || 'SES-LIVE-AUDIT',
            chain_hash: data.chain_hash || rawAnswer.chain_hash || 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            retrieval_strength: retrievalStrength
          };
        }
      } catch (err) {
        console.warn('Backend API unavailable. Falling back to local mock engine.', err);
      }
    }

    // Local Mock Engine Logic
    const qLower = query.toLowerCase();

    // Simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Abstention test queries
    if (
      qLower.includes('gyroscope') ||
      qLower.includes('day 3') ||
      qLower.includes('unknown') ||
      qLower.includes('abstain')
    ) {
      return {
        ...MOCK_COPILOT_ABSTAIN,
        query,
      };
    }

    // Prompt injection test queries
    if (
      qLower.includes('ignore all rules') ||
      qLower.includes('system prompt') ||
      qLower.includes('bypass')
    ) {
      return {
        ...MOCK_COPILOT_INJECTION,
        query,
      };
    }

    // EPS specific query
    if (qLower.includes('eps') || qLower.includes('voltage') || qLower.includes('battery')) {
      return {
        ...MOCK_COPILOT_DEFAULT,
        query,
        facts: [
          {
            id: 'F-01',
            statement: 'Battery bus voltage dropped to 23.8 V at 14:31:42 UTC.',
            citation: 'T-19281',
            parameter: 'battery_bus_voltage',
            observed_value: '23.8 V'
          },
          {
            id: 'F-02',
            statement: 'EPS current draw increased by 17% during RF amplifier duty cycle.',
            citation: 'T-19282',
            parameter: 'comms_current_draw',
            observed_value: '+17%'
          }
        ]
      };
    }

    // Default return
    return {
      ...MOCK_COPILOT_DEFAULT,
      query: query.trim() || MOCK_COPILOT_DEFAULT.query,
    };
  },

  async getEvidence(recordId: string): Promise<EvidenceRecord | null> {
    const isLive = getLiveMode();
    if (isLive) {
      try {
        const res = await fetch(`/api/evidence/${recordId}`);
        if (res.ok) return await res.json();
      } catch (e) {
        /* fallback */
      }
    }
    return MOCK_EVIDENCE_RECORDS[recordId] || null;
  },

  async getMissionHealth(): Promise<MissionHealthData> {
    const isLive = getLiveMode();
    if (isLive) {
      try {
        const res = await fetch('/api/health/mission');
        if (res.ok) return await res.json();
      } catch (e) {
        /* fallback */
      }
    }
    return MOCK_MISSION_HEALTH;
  },

  async getAnomalies(): Promise<AnomalyItem[]> {
    const isLive = getLiveMode();
    if (isLive) {
      try {
        const res = await fetch('/api/anomalies');
        if (res.ok) return await res.json();
      } catch (e) {
        /* fallback */
      }
    }
    return MOCK_ANOMALIES;
  },

  async getTimeline(): Promise<TimelineEvent[]> {
    const isLive = getLiveMode();
    if (isLive) {
      try {
        const res = await fetch('/api/timeline');
        if (res.ok) return await res.json();
      } catch (e) {
        /* fallback */
      }
    }
    return MOCK_TIMELINE;
  },

  async getTelemetrySeries(): Promise<TelemetryPoint[]> {
    const isLive = getLiveMode();
    if (isLive) {
      try {
        const res = await fetch('/api/telemetry/series');
        if (res.ok) return await res.json();
      } catch (e) {
        /* fallback */
      }
    }
    return MOCK_TELEMETRY_SERIES;
  },

  async getIncidents(): Promise<HistoricalIncident[]> {
    const isLive = getLiveMode();
    if (isLive) {
      try {
        const res = await fetch('/api/incidents');
        if (res.ok) return await res.json();
      } catch (e) {
        /* fallback */
      }
    }
    return MOCK_INCIDENTS;
  },

  async getProcedures(): Promise<OperationalProcedure[]> {
    const isLive = getLiveMode();
    if (isLive) {
      try {
        const res = await fetch('/api/procedures');
        if (res.ok) return await res.json();
      } catch (e) {
        /* fallback */
      }
    }
    return MOCK_PROCEDURES;
  },

  async getAuditTrail(): Promise<AuditEntry[]> {
    const isLive = getLiveMode();
    if (isLive) {
      try {
        const res = await fetch('/api/audit');
        if (res.ok) return await res.json();
      } catch (e) {
        /* fallback */
      }
    }
    return MOCK_AUDIT_ENTRIES;
  }
};
