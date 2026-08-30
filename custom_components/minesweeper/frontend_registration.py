"""Register the Minesweeper Lovelace module."""
from __future__ import annotations

import logging

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import Event, HomeAssistant
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED

from .const import CARD_FILENAME, FRONTEND_DIR, RESOURCE_URL, STATIC_URL

_LOGGER = logging.getLogger(__name__)


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the card and register its Lovelace resource before the UI uses it."""
    card_path = FRONTEND_DIR / CARD_FILENAME
    if not card_path.is_file():
        _LOGGER.error("Bundled card file is missing: %s", card_path)
        return

    if hass.data.get("minesweeper_frontend_registered"):
        return

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                STATIC_URL,
                str(card_path),
                cache_headers=False,
            )
        ]
    )
    hass.data["minesweeper_frontend_registered"] = True

    # Lovelace resources are the supported mechanism for custom cards.
    # Register after core startup so the Lovelace resource collection exists
    # and has been initialized. This happens before a user can normally open
    # the dashboard after a restart.
    if hass.is_running:
        hass.async_create_task(_async_register_lovelace_resource(hass))
    else:
        async def _async_handle_started(_event: Event) -> None:
            await _async_register_lovelace_resource(hass)

        hass.bus.async_listen_once(
            EVENT_HOMEASSISTANT_STARTED,
            _async_handle_started,
        )


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Create/update the module resource in Lovelace storage."""
    lovelace_data = hass.data.get("lovelace")
    if lovelace_data is None:
        _LOGGER.warning("Lovelace data is unavailable; card resource was not registered")
        return

    resource_mode = getattr(lovelace_data, "resource_mode", None)
    resources = getattr(lovelace_data, "resources", None)

    if resource_mode == "yaml":
        _LOGGER.warning(
            "Lovelace is using YAML resource mode. Add %s as a module resource.",
            RESOURCE_URL,
        )
        return

    if resources is None:
        _LOGGER.warning("Lovelace resource collection is unavailable")
        return

    try:
        # ResourceStorageCollection is lazy-loaded in current Home Assistant.
        # async_get_info() is the public path that triggers its initial load.
        await resources.async_get_info()

        existing = None
        for item in resources.async_items():
            url = item.get("url", "")
            if url.split("?", 1)[0] == STATIC_URL:
                existing = item
                break

        if existing is None:
            await resources.async_create_item(
                {"res_type": "module", "url": RESOURCE_URL}
            )
            _LOGGER.info("Registered Minesweeper Lovelace resource: %s", RESOURCE_URL)
            return

        if existing.get("url") != RESOURCE_URL or existing.get("res_type") != "module":
            await resources.async_update_item(
                existing["id"],
                {"res_type": "module", "url": RESOURCE_URL},
            )
            _LOGGER.info("Updated Minesweeper Lovelace resource: %s", RESOURCE_URL)
    except Exception:  # noqa: BLE001
        _LOGGER.exception("Unable to register the Minesweeper Lovelace resource")


async def async_unregister_frontend(hass: HomeAssistant) -> None:
    """No-op for the static resource; keep it available across config entries."""
    return
