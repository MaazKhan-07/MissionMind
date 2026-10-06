from backend.app.schemas import CopilotAnswer, Fact, Inference, Recommendation
from backend.app.validator import validate_copilot_answer

def test_validator_drops_invalid_citation():
    retrieved = {
        "T-19281": {"text": "Battery voltage was 23.8 V at 14:31:42 UTC."}
    }
    
    # Fact citing non-retrieved record
    raw = CopilotAnswer(
        abstain=False,
        facts=[
            Fact(statement="Battery voltage was 23.8 V", citations=["T-99999"])
        ]
    )

    validated, dropped = validate_copilot_answer(raw, retrieved)
    assert dropped == 1
    assert validated.abstain is True  # No valid facts remain

def test_validator_drops_unsupported_numbers():
    retrieved = {
        "T-19281": {"text": "Battery voltage was 23.8 V at 14:31:42 UTC."}
    }
    
    # Hallucinated number 22.1 instead of 23.8
    raw = CopilotAnswer(
        abstain=False,
        facts=[
            Fact(statement="Battery voltage was 22.1 V", citations=["T-19281"])
        ]
    )

    validated, dropped = validate_copilot_answer(raw, retrieved)
    assert dropped == 1
    assert validated.abstain is True

def test_validator_accepts_valid_evidence():
    retrieved = {
        "T-19281": {"text": "Battery voltage was 23.8 V at 14:31:42 UTC.", "rtype": "telemetry"},
        "COMMS-04": {"text": "COMMS-04: RF Recovery", "rtype": "procedure"}
    }
    
    raw = CopilotAnswer(
        abstain=False,
        facts=[
            Fact(statement="Battery voltage was 23.8 V", citations=["T-19281"])
        ],
        recommendations=[
            Recommendation(order=1, action="Execute COMMS-04", rationale="Restore power", procedure_id="COMMS-04", citations=["COMMS-04"])
        ]
    )

    validated, dropped = validate_copilot_answer(raw, retrieved)
    assert dropped == 0
    assert validated.abstain is False
    assert len(validated.facts) == 1
    assert len(validated.recommendations) == 1
