import json
from pathlib import Path
from backend.app.db import init_db, get_connection
from backend.app.ingest import ingest_file, normalize_timestamp

def test_normalize_timestamp():
    ts = normalize_timestamp("2026-10-05T14:32:00Z")
    assert "2026-10-05T14:32:00" in ts
    assert "+00:00" in ts or "Z" in ts

def test_ingest_json_file(tmp_path):
    init_db()
    test_data = [
        {
            "record_id": "T-TEST-001",
            "rtype": "telemetry",
            "ts_utc": "2026-10-05T12:00:00Z",
            "subsystem": "POWER",
            "severity": "info",
            "parameter": "bus_voltage",
            "value": 28.0,
            "unit": "V",
            "status": "normal"
        }
    ]
    file_p = tmp_path / "test_ingest.json"
    file_p.write_text(json.dumps(test_data), encoding="utf-8")

    result = ingest_file(file_p)
    assert result["records_ingested"] >= 1
    assert result["telemetry_ingested"] >= 1

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM records WHERE record_id = 'T-TEST-001'")
    row = cursor.fetchone()
    assert row is not None
    assert row["subsystem"] == "POWER"
    conn.close()
