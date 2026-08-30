"""Constants for Minesweeper."""
from __future__ import annotations

from pathlib import Path

DOMAIN = "minesweeper"
STORAGE_VERSION = 1
STORAGE_KEY = "minesweeper_scores"

CARD_FILENAME = "minesweeper-card.js"
FRONTEND_VERSION = "1.2.3"
STATIC_URL = f"/api/{DOMAIN}/static/{CARD_FILENAME}"
RESOURCE_URL = f"{STATIC_URL}?v={FRONTEND_VERSION}"
FRONTEND_DIR = Path(__file__).parent / "frontend"

DIFFICULTIES = {
    "easy": {"name": "Lehká", "rows": 9, "cols": 9, "mines": 10},
    "medium": {"name": "Střední", "rows": 12, "cols": 12, "mines": 25},
    "hard": {"name": "Těžká", "rows": 16, "cols": 16, "mines": 40},
}
