import os
import json
import pytest

def test_intro_video_asset_exists():
    """Verify official MissionMind intro video is mounted in public static directory."""
    video_path = os.path.join(os.path.dirname(__file__), "..", "public", "media", "missionmind-intro.mp4")
    assert os.path.exists(video_path), "missionmind-intro.mp4 must exist in public/media"
    assert os.path.getsize(video_path) > 1000000, "missionmind-intro.mp4 must be a complete video asset"

def test_background_video_asset_exists():
    """Verify official MissionMind background video is mounted in public static directory."""
    video_path = os.path.join(os.path.dirname(__file__), "..", "public", "media", "missionmind-background.mp4")
    assert os.path.exists(video_path), "missionmind-background.mp4 must exist in public/media"
    assert os.path.getsize(video_path) > 1000000, "missionmind-background.mp4 must be a complete video asset"

def test_design_tokens_configured():
    """Verify CSS tokens for Void Black and Electric Cyan exist in index.css."""
    css_path = os.path.join(os.path.dirname(__file__), "..", "src", "index.css")
    assert os.path.exists(css_path), "index.css must exist"
    with open(css_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "--bg-primary: #0B0F19;" in content
    assert "--accent-cyan: #06B6D4;" in content
    assert "--glass-bg:" in content

def test_mock_ask_schema_validity():
    """Verify mock ask response schema is valid JSON."""
    mock_path = os.path.join(os.path.dirname(__file__), "..", "mock_ask.json")
    if os.path.exists(mock_path):
        with open(mock_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "answer" in data or "facts" in data
