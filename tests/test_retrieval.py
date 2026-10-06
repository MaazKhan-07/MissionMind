from backend.app.retrieval import hybrid_retrieval, extract_time_anchor

def test_extract_time_anchor():
    anchor = extract_time_anchor("What caused comms failure at 14:32?")
    assert anchor is not None
    assert anchor.hour == 14
    assert anchor.minute == 32

def test_hybrid_retrieval_golden_scenario():
    records, strength = hybrid_retrieval("Why did the comms subsystem fail at 14:32?")
    assert len(records) > 0
    assert strength > 0.0
    # Must preserve out of limit telemetry in window
    assert "T-19281" in records or "T-19282" in records
