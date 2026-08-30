"""Config flow."""
from __future__ import annotations

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN


class MinesweeperConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the Minesweeper config flow."""

    VERSION = 1

    async def async_step_user(self, user_input=None) -> FlowResult:
        """Create the single config entry."""
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")

        if user_input is not None:
            return self.async_create_entry(title="Minesweeper", data={})

        return self.async_show_form(step_id="user")
