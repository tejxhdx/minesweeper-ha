"""Minesweeper Home Assistant integration."""
from __future__ import annotations

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall

from .api import MinesweeperRecordsView, MinesweeperResetView
from .config_schema import CONFIG_SCHEMA
from .const import DOMAIN
from .frontend_registration import async_register_frontend
from .storage import MinesweeperStore

SERVICE_RESET = "reset_records"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the integration domain."""
    hass.data.setdefault(DOMAIN, {})
    await async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up a Minesweeper config entry."""
    store = MinesweeperStore(hass)
    await store.async_load()
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = store
    hass.http.register_view(MinesweeperRecordsView(store))
    hass.http.register_view(MinesweeperResetView(store))

    async def reset_records(call: ServiceCall) -> None:
        await store.async_reset(call.data["difficulty"])

    if not hass.services.has_service(DOMAIN, SERVICE_RESET):
        hass.services.async_register(
            DOMAIN,
            SERVICE_RESET,
            reset_records,
            schema=vol.Schema(
                {
                    vol.Required("difficulty", default="all"): vol.In(
                        ["all", "easy", "medium", "hard"]
                    )
                }
            ),
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a Minesweeper config entry."""
    hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return True
