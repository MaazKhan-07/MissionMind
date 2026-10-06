from backend.app.timeline import generate_timeline

def test_generate_timeline_deterministic():
    timeline1 = generate_timeline(time_anchor="14:32")
    timeline2 = generate_timeline(time_anchor="14:32")

    assert len(timeline1) == len(timeline2)
    for item1, item2 in zip(timeline1, timeline2):
        assert item1.timestamp == item2.timestamp
        assert item1.record_id == item2.record_id
        assert item1.label == item2.label

def test_timeline_chronological_ordering():
    timeline = generate_timeline(time_anchor="14:32")
    for i in range(len(timeline) - 1):
        assert timeline[i].timestamp <= timeline[i + 1].timestamp
