"""Persistent Minesweeper score storage."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from homeassistant.helpers.storage import Store

from .const import DIFFICULTIES, STORAGE_KEY, STORAGE_VERSION


class MinesweeperStore:
    """Persistent leaderboard."""

    def __init__(self, hass) -> None:
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data: dict[str, list[dict[str, Any]]] = {
            key: [] for key in DIFFICULTIES
        }

    async def async_load(self) -> None:
        saved = await self._store.async_load()
        if not isinstance(saved, dict):
            return
        for difficulty in DIFFICULTIES:
            records = saved.get(difficulty)
            if isinstance(records, list):
                self.data[difficulty] = records[:100]

    async def async_save(self) -> None:
        await self._store.async_save(self.data)

    def add_score(
        self, difficulty: str, user_id: str, user_name: str, time_seconds: int
    ) -> dict[str, Any]:
        record = {
            "user_id": user_id,
            "user_name": user_name or "Neznámý hráč",
            "time": int(time_seconds),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.data[difficulty].append(record)
        self.data[difficulty].sort(key=lambda item: int(item["time"]))
        self.data[difficulty] = self.data[difficulty][:100]
        return record

    def top(self, difficulty: str, limit: int = 10) -> list[dict[str, Any]]:
        return self.data[difficulty][:limit]

    def best_for_user(
        self, difficulty: str, user_id: str
    ) -> dict[str, Any] | None:
        own = [r for r in self.data[difficulty] if r.get("user_id") == user_id]
        return min(own, key=lambda item: int(item["time"])) if own else None

    async def async_reset(self, difficulty: str = "all") -> None:
        if difficulty == "all":
            for key in DIFFICULTIES:
                self.data[key] = []
        else:
            self.data[difficulty] = []
        await self.async_save()
