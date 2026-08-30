# Changelog

## 1.2.3

- Fixed automatic Lovelace resource registration timing
- Register the module after `EVENT_HOMEASSISTANT_STARTED`, when Lovelace storage is ready
- Removed `add_extra_js_url()` as the primary loader because Home Assistant documents a race for extra JS modules
- Versioned the resource URL to invalidate browser caches after HACS updates
- Existing Minesweeper resources are updated instead of duplicated
- Kept the v1.2.2 leaderboard API, responsive layout, and branding fixes

## 1.2.2

- Fixed leaderboard GET/POST by using the Home Assistant `hass.callApi()` frontend API
- Fixed desktop leaderboard clipping with fluid grid columns and `min-width: 0`
- Added container-query breakpoint so the card responds to its actual card width
- Added `getGridOptions()` for Sections dashboards
- Moved integration brand icon to `custom_components/minesweeper/brand/icon.png`
- Added stronger API error handling

## 1.2.1

- Fixed the main `Custom element not found: minesweeper-card` installation path
- Register the frontend module during `async_setup`, not only after config-flow setup
- Added explicit `frontend` and `http` dependencies
- Kept the bundled card inside the integration; no `/config/www` file is required
