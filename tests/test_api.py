import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db import init_db
from data.generate_data import generate_synthetic_mission_dataset
from backend.app.ingest import ingest_file

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()
    from backend.app.db import get_connection
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) as cnt FROM records;")
    cnt = cursor.fetchone()["cnt"]
    conn.close()
    if cnt < 50:
        data_file = generate_synthetic_mission_dataset()
        ingest_file(data_file)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "ok"
    assert data["audit"] == "ok"

def test_ask_golden_scenario_s1():
    payload = {
        "query": "Why did the comms subsystem fail at 14:32?",
        "session_id": "test-session-s1"
    }
    response = client.post("/api/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert "answer" in data
    assert "records" in data
    assert "timeline" in data
    assert "retrieval_strength" in data
    assert data["dropped"] == 0
    assert data["answer"]["abstain"] is False

    # Check citations in facts
    cited_ids = set()
    for f in data["answer"]["facts"]:
        for c in f["citations"]:
            cited_ids.add(c)
    assert "T-19281" in cited_ids or "T-19280" in cited_ids or "T-19282" in cited_ids

def test_ask_unanswerable_triggers_abstention():
    payload = {
        "query": "What is the quantum flux sensor reading on Thruster 4 at 14:32?",
        "session_id": "test-session-unanswerable"
    }
    response = client.post("/api/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["answer"]["abstain"] is True
    assert "Insufficient" in data["answer"]["abstain_reason"] or "No quantum" in data["answer"]["abstain_reason"]

def test_get_record_by_id():
    response = client.get("/api/records/T-19281")
    assert response.status_code == 200
    data = response.json()
    assert data["record_id"] == "T-19281"
    assert "battery_voltage" in data["text"]

def test_get_record_not_found():
    response = client.get("/api/records/NONEXISTENT-99999")
    assert response.status_code == 404

def test_get_anomalies():
    response = client.get("/api/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any("ANOM-" in a["id"] or "INC-" in a["id"] for a in data)

def test_get_timeline():
    response = client.get("/api/timeline?time_anchor=14:32")
    assert response.status_code == 200
    timeline = response.json()
    assert len(timeline) > 0
    # Assert chronological sort
    for i in range(len(timeline) - 1):
        assert timeline[i]["timestamp"] <= timeline[i+1]["timestamp"]

def test_audit_verify_hash_chain():
    response = client.get("/api/audit/verify")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["entries_checked"] > 0

def test_replay_endpoint():
    # First ask a query
    client.post("/api/ask", json={"query": "Why did the comms subsystem fail at 14:32?", "session_id": "replay-sess-1"})
    # Now replay
    response = client.post("/api/replay", json={"session_id": "replay-sess-1"})
    assert response.status_code == 200
    data = response.json()
    assert data["replayed"] is True
    assert "comms" in data["query"].lower()
