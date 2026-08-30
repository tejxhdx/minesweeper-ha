from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.minesweeper.storage import MinesweeperStore


@pytest.mark.asyncio
async def test_scores_are_sorted():
    store = MinesweeperStore(MagicMock())
    store._store.async_save = AsyncMock()

    for value in (50, 20, 40):
        store.add_score("medium", "user", "User", value)

    assert [item["time"] for item in store.top("medium")] == [20, 40, 50]


@pytest.mark.asyncio
async def test_best_for_user():
    store = MinesweeperStore(MagicMock())
    store._store.async_save = AsyncMock()

    store.add_score("medium", "user-a", "Alice", 60)
    store.add_score("medium", "user-b", "Bob", 30)
    store.add_score("medium", "user-a", "Alice", 40)

    assert store.best_for_user("medium", "user-a")["time"] == 40
