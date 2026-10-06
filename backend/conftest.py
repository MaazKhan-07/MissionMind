"""
Pytest configuration for MissionMind backend tests.
Adds the project root and backend to sys.path.
"""

import sys
from pathlib import Path

# Project root
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_BACKEND_ROOT = Path(__file__).resolve().parent

# Add both to path
for p in [str(_PROJECT_ROOT), str(_BACKEND_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)
