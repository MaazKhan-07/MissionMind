# MissionMind API Specification

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ask` | Process copilot query, return structured answer with citations |
| `GET` | `/api/records/{id}` | Retrieve verified telemetry/log/incident/procedure record |
| `GET` | `/api/anomalies` | List active spacecraft anomalies |
| `GET` | `/api/timeline` | Get deterministic timeline of events |
| `GET` | `/api/telemetry` | Retrieve time-series telemetry data |
| `GET` | `/api/audit` | Fetch investigation audit log entries |
| `GET` | `/api/audit/verify` | Verify cryptographic SHA-256 hash chain integrity |
| `GET` | `/api/procedures` | List operational procedures |
| `GET` | `/api/health` | Diagnostic status check |
| `POST` | `/api/eval` | Run golden question suite evaluation |
