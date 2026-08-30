from unittest.mock import MagicMock

import pytest

from custom_components.minesweeper.api import MinesweeperRecordsView
from custom_components.minesweeper.storage import MinesweeperStore


@pytest.mark.asyncio
async def test_api_view_requires_auth():
    store = MinesweeperStore(MagicMock())
    view = MinesweeperRecordsView(store)

    assert view.requires_auth is True
    assert view.url == "/api/minesweeper/records"
