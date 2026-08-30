import pytest
from homeassistant import config_entries

from custom_components.minesweeper.const import DOMAIN


@pytest.mark.asyncio
async def test_user_flow(hass):
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == "form"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {}
    )

    assert result["type"] == "create_entry"
    assert result["title"] == "Minesweeper"
