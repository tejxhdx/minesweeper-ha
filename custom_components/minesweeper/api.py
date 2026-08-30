"""Authenticated REST API."""
from __future__ import annotations

import json

from aiohttp import web
from homeassistant.components.http.view import HomeAssistantView

from .const import DIFFICULTIES
from .storage import MinesweeperStore


class MinesweeperRecordsView(HomeAssistantView):
    """Read/write authenticated Minesweeper records."""

    url = "/api/minesweeper/records"
    name = "api:minesweeper:records"
    requires_auth = True

    def __init__(self, store: MinesweeperStore) -> None:
        self.store = store

    async def get(self, request: web.Request) -> web.Response:
        user = request["hass_user"]
        difficulty = request.query.get("difficulty", "medium")

        if difficulty not in DIFFICULTIES:
            return self.json_message("Invalid difficulty", status_code=400)

        return self.json(
            {
                "difficulty": difficulty,
                "difficulty_name": DIFFICULTIES[difficulty]["name"],
                "records": self.store.top(difficulty),
                "my_best": self.store.best_for_user(difficulty, user.id),
            }
        )

    async def post(self, request: web.Request) -> web.Response:
        user = request["hass_user"]

        try:
            body = await request.json()
        except (ValueError, json.JSONDecodeError):
            return self.json_message("Invalid JSON", status_code=400)

        difficulty = body.get("difficulty")
        raw_time = body.get("time")

        if difficulty not in DIFFICULTIES:
            return self.json_message("Invalid difficulty", status_code=400)

        try:
            time_seconds = int(raw_time)
        except (TypeError, ValueError):
            return self.json_message("Invalid time", status_code=400)

        if not 1 <= time_seconds <= 86400:
            return self.json_message("Invalid time", status_code=400)

        record = self.store.add_score(
            difficulty,
            user.id,
            user.name or "Neznámý hráč",
            time_seconds,
        )
        await self.store.async_save()

        return self.json(
            {
                "ok": True,
                "record": record,
                "records": self.store.top(difficulty),
            }
        )


class MinesweeperResetView(HomeAssistantView):
    """Reset leaderboard for administrators."""

    url = "/api/minesweeper/reset"
    name = "api:minesweeper:reset"
    requires_auth = True

    def __init__(self, store: MinesweeperStore) -> None:
        self.store = store

    async def post(self, request: web.Request) -> web.Response:
        if not request["hass_user"].is_admin:
            return self.json_message("Admin only", status_code=403)

        try:
            body = await request.json()
        except (ValueError, json.JSONDecodeError):
            body = {}

        difficulty = body.get("difficulty", "all")
        if difficulty != "all" and difficulty not in DIFFICULTIES:
            return self.json_message("Invalid difficulty", status_code=400)

        await self.store.async_reset(difficulty)
        return self.json_message("Records reset")
