# MissionMind Architecture & RAG Pipeline Specification

## System Overview

MissionMind is an Evidence-Grounded Mission Operations Copilot designed for ST-10 Spacecraft Anomaly Operations.

```
+-------------------------------------------------------------------+
|                        MISSIONMIND FRONTEND                       |
| React + Vite + TypeScript + Tailwind CSS + Three.js + Recharts    |
| Command Center • Copilot • Telemetry • Timeline • Audit • Brief   |
+-------------------------------------------------------------------+
                                 |
                                 | REST API (/api)
                                 v
+-------------------------------------------------------------------+
|                           FASTAPI SERVER                          |
| Config • Schemas • Evidence Validator • Deterministic Timeline    |
+-------------------------------------------------------------------+
       |                         |                         |
       v                         v                         v
+--------------+        +-----------------+      +------------------+
| SQLite + FTS5|        | Hybrid Retrieval|      | SHA-256 Audit    |
| Mission Data |        | (SQL + FTS + RRF|      | Hash Chain       |
+--------------+        +-----------------+      +------------------+
```

## Core Principles

1. **EVIDENCE FIRST. EXPLANATION SECOND.**
   - Every claim is tied to a verified record ID (e.g., `T-19281`).
   - Unsupported numeric values (e.g., hallucinated voltage numbers) are dropped by post-generation guardrails.

2. **3-LAYER ANSWER STRUCTURE**
   - 🟢 **Observed Facts**: Claims directly supported by retrieved telemetry/logs.
   - 🟠 **Inferences**: Deductions combining multiple observations.
   - 🔵 **Recommendations**: Operational steps grounded in procedures (e.g., `COMMS-04`).

3. **TAMPER-EVIDENT SHA-256 AUDIT CHAIN**
   - Each investigation logs query, retrieved record IDs, strength, model output, and previous SHA-256 entry hash.
   - Replay functionality uses stored audit payloads without repeating LLM calls.
