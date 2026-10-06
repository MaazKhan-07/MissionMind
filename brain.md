# 🧠 BRAIN.MD // MISSIONMIND COGNITIVE ARCHITECTURE & REASONING ENGINE

> **MissionMind: Mission Operations Intelligence & Evidence-Grounded Decision Copilot**  
> *Problem ID: ST-10 | Domain: Space Technology / Mission Operations*

---

## 🛰️ 1. Executive Cognitive Philosophy

Generic AI chatbots optimize for generating plausible answers. **MissionMind optimizes for generating verifiable operational intelligence.**

In critical spacecraft operations (satellites, deep-space probes, orbital stations), a hallucinated voltage limit or invented procedure step can cause mission degradation or vehicle loss. 

MissionMind operates on a strict **Evidence-First Architectural Mandate**:
```
GROUNDING  ──►  TRACEABILITY  ──►  CALIBRATED REASONING  ──►  SAFE RECOMMENDATIONS  ──►  AUDITABILITY
```

---

## 📐 2. High-Level System Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                     MISSIONMIND FRONTEND WORKSTATION            │
│  React + Vite + TypeScript + Tailwind CSS                       │
│  Three.js 3D Orbital Scene • Recharts Telemetry • Audit Trail    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ REST API / JSON Schema
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FASTAPI BACKEND SERVICES                  │
│  App Layer • Request Validation • Session Tracking              │
└───────┬────────────────────────┬───────────────────────┬────────┘
        │                        │                       │
        ▼                        ▼                       ▼
┌──────────────┐         ┌──────────────┐        ┌──────────────┐
│  Retrieval   │         │ AI / RAG     │        │ Validator    │
│  Engine      │         │ Pipeline     │        │ Guardrails   │
└───────┬──────┘         └──────┬───────┘        └──────┬───────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                      ┌───────────────────┐
                      │ SQLite + FTS5 DB  │
                      │ Mission Telemetry │
                      └───────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ SHA-256 Audit   │
                       │ Hash Chain      │
                       └─────────────────┘
```

---

## 🧠 3. The 10-Step Cognitive Reasoning Pipeline

```
                    ┌─────────────────────────┐
                    │       USER QUERY        │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   QUERY UNDERSTANDING   │
                    │   & TIME WINDOW EXT.    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    HYBRID RETRIEVAL     │
                    │  ┌─────┬─────────┬───┐  │
                    │  │ SQL │  FTS5   │VEC│  │
                    │  └─────┴─────────┴───┘  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ RECIPROCAL RANK FUSION  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ EVIDENCE STRENGTH CHECK │
                    └────────────┬────────────┘
                       │                     │
                (Weak Evidence)       (Strong Evidence)
                       │                     │
                       ▼                     ▼
             ┌──────────────────┐   ┌──────────────────┐
             │ AI ABSTENTION UI │   │  LLM SYNTHESIS   │
             │ (Refuse Answer)  │   │ (Structured Out) │
             └──────────────────┘   └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ PYDANTIC SCHEMA  │
                                    │   VALIDATION     │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ EVIDENCE REASON  │
                                    │   GUARDRAILS     │
                                    └────────┬─────────┘
                                 ┌───────────┴──────────┐
                                 ▼                      ▼
                             VALIDATED               DROPPED
                              CLAIMS                  CLAIMS
                                 │                      │
                                 └───────────┬──────────┘
                                             ▼
                                    ┌──────────────────┐
                                    │ THREE-TIER ANSWER│
                                    │   PRESENTATION   │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ TAMPER-EVIDENT   │
                                    │   AUDIT LOGGING  │
                                    └──────────────────┘
```

### Pipeline Details:

1. **Query Parsing & Time Extraction**: Extract target subsystems (e.g. `EPS`, `COMMS`) and timestamp ranges (e.g., `14:28:00 UTC` to `14:35:00 UTC`).
2. **Hybrid Multi-Vector Retrieval**:
   - **SQL Structured Search**: Retrieves explicit numeric parameters (`battery_bus_voltage`, `comms_current_draw`).
   - **SQLite FTS5 Keyword Search**: Full-text indexing across unstructured flight log entries.
   - **Vector Embedding Search**: Semantic similarity matching across historical incident database (`INC-047`).
3. **Reciprocal Rank Fusion (RRF)**: Merges ranked results into a unified top-K evidence set.
4. **Evidence Strength Gatekeeper**: Evaluates signal-to-noise ratio. If evidence is missing or below confidence threshold, triggers **AI Abstention Protocol**.
5. **Structured LLM Generation**: Uses Gemini 3.6 Flash with enforced Pydantic output schemas (Facts, Inferences, Recommendations).
6. **Numerical Claim Validator**: Verifies generated numbers against source records. If LLM outputs `21.5 V` when source states `23.8 V`, the statement is immediately dropped.
7. **Prompt Injection Shield**: Sandboxes retrieved log text so string commands like `"IGNORE ALL RULES"` are parsed strictly as unexecuted data payloads (`LOG-99999`).
8. **Three-Tier Categorization**:
   - 🟢 **Observed Facts**: Directly supported by record IDs.
   - 🟠 **Inferences**: Multi-observation reasoning with explicit confidence scores (`HIGH` / `MEDIUM` / `LOW`).
   - 🔵 **Recommendations**: Operational steps backed by procedure documents (`COMMS-04`).
9. **Dropped Claims Audit**: Logged for total transparency so operators see exactly which unsupported statements were stripped.
10. **Cryptographic SHA-256 Audit Chain**: Hashes every session (`MM-2026-001`) with the previous block hash for tamper-evident reproducibility.

---

## 🛡️ 4. AI Abstention & Safety Principles

MissionMind enforces the **Zero-Hallucination Policy**:

> *"When evidence is insufficient, refusing to answer is a system success, not a failure."*

### Trigger Criteria for Abstention:
- Zero relevant telemetry logs found within specified time window.
- Missing critical baseline parameters (e.g. `Gyroscope bias calibration`).
- Numerical citation validation failure rate exceeding threshold.

---

## 🔗 5. Audit Chain Cryptography

Each investigation generates an auditable block:

```json
{
  "session_id": "MM-2026-001",
  "timestamp": "2026-03-14 14:32:45 UTC",
  "query": "Why did the comms subsystem fail at 14:32?",
  "retrieved_record_ids": ["T-19281", "T-19282", "LOG-04412", "INC-047", "COMMS-04"],
  "dropped_claims_count": 1,
  "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
  "current_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "chain_status": "VERIFIED"
}
```

This guarantees full auditability for flight safety boards and mission evaluators.
