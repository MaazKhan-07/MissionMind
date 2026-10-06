# 🛰️ MISSIONMIND
### Mission Operations Intelligence & Evidence-Grounded Decision Copilot

> **Problem ID:** ST-10  
> **Domain:** Space Technology / Mission Operations  
> **Frontend:** React + Vite + TypeScript + Tailwind CSS + Three.js + Recharts  
> **Backend:** FastAPI + Pydantic + SQLite FTS5  
> **Design Language:** Aerospace Command Station Workstation  

---

## 🎯 Overview

**MissionMind** is an AI-powered Mission Operations Copilot designed to assist flight directors, satellite controllers, and subsystems engineers in investigating spacecraft anomalies using telemetry summaries, flight logs, operational procedures, and historical incident records.

Unlike generic LLM chatbots that hallucinate plausible answers, MissionMind guarantees **evidence-grounded decision support**: every critical claim is traceable to a specific, verified mission record ID.

---

## ✨ Core Features & Visual Language

- 🟢 **Observed Facts**: Verified telemetry values directly supported by mission log records.
- 🟠 **Inference**: Multi-observation reasoning with explicit confidence scores (`HIGH` / `MEDIUM` / `LOW`).
- 🔵 **Recommendations**: Procedure-grounded action checklists linked to approved SOPs (`COMMS-04`).
- 🛡️ **Evidence Guardrails**: Post-generation validation engine that intercepts and strips numerical hallucinations into a dedicated **Dropped Claims** audit log.
- 🛑 **AI Abstention Protocol**: Refuses to guess when evidence is missing or ambiguous (*"No evidence → No claim"*).
- 🔐 **Prompt Injection Shield**: Treats retrieved flight logs as raw data, neutralizing prompt injection attacks (`LOG-99999`).
- 🌌 **3D Mission Orbital Scene**: Real-time React Three Fiber / Three.js 3D satellite visualization with an interactive 2D Tactical SVG Radar fallback view.
- 📈 **Telemetry Intelligence Console**: Recharts visualization with min/max operational limit threshold lines and highlighted anomaly window shading (`14:30 - 14:33`).
- 🕐 **Deterministic Incident Timeline**: Chronological event sequence built strictly from timestamped telemetry logs.
- 📜 **Historical Incident Library**: Vector similarity search matching current anomalies against historical flight incidents (`INC-047` - 92% match).
- 🔗 **Tamper-Evident SHA-256 Audit Chain**: Hashes every investigation session (`MM-2026-001`) with previous block hashes for complete auditability.

---

## 🛠️ Architecture & Specifications

For detailed architectural and cognitive reasoning specifications, explore:

- 🧠 **[brain.md](file:///c:/Users/Mrigesh%20koyande/OneDrive/Desktop/MissionMind/MissionMind/brain.md)**: Deep dive into the 10-step cognitive reasoning pipeline, hybrid retrieval fusion (SQL + FTS5 + Vector), and SHA-256 audit cryptography.
- 🤖 **[agent.md](file:///c:/Users/Mrigesh%20koyande/OneDrive/Desktop/MissionMind/MissionMind/agent.md)**: Full agent specification, semantic color system rules, TypeScript/Pydantic schema contracts, safety test cases, and team collaboration guidelines.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18 + TypeScript + Vite | Workstation Application Shell |
| **Styling** | Tailwind CSS + Custom CSS Tokens | Aerospace Dark Theme & Glassmorphism |
| **3D Engine** | Three.js + React Three Fiber + Drei | 3D Orbital Telemetry Scene |
| **Data Viz** | Recharts | Telemetry Parameter Console |
| **Icons** | Lucide React | Tactical Interface Icons |
| **Backend API** | FastAPI + Uvicorn | REST API & Service Router |
| **Data Validation** | Pydantic v2 | Strict JSON Schema Enforcement |
| **Database** | SQLite + FTS5 | Structured Parameters & Full-Text Search |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v10+`

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be live at:
👉 **`http://localhost:3000/`**

### 3. Build Production Bundle
```bash
npm run build
```

---

## ⌨️ Global Keyboard Shortcuts

- **`Ctrl + K` / `Cmd + K`**: Open Global Command Palette for instant navigation and telemetry search.
- **`ESC`**: Close slide-over Evidence Inspector or Command Palette modals.

---

## 📄 License & Attribution

Designed and engineered for **Hackathon Problem ST-10 (Space Technology / Mission Operations Copilot)**.