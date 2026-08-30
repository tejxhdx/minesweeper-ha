# 💣 Minesweeper for Home Assistant

A mobile-friendly Minesweeper game for Home Assistant with a persistent leaderboard tied to the authenticated Home Assistant user.

## Install

### HACS

1. Open **HACS → Integrations**.
2. Search for **Minesweeper** (or add the GitHub repository as a custom Integration repository while the project is not yet in the default HACS list).
3. Install.
4. Restart Home Assistant.
5. Go to **Settings → Devices & services → Add integration → Minesweeper**.
6. Add the dashboard card:

```yaml
type: custom:minesweeper-card
```

No `configuration.yaml` entry is required.

No manual upload to `/config/www` is required.

No manual Lovelace resource entry is required. The integration serves and registers its bundled card automatically.

## Dashboard

Recommended:

```yaml
type: custom:minesweeper-card
difficulty: medium
show_leaderboard: true
```

The card is responsive:

- desktop: game and leaderboard side-by-side
- mobile/tablet: game above leaderboard
- the board keeps a square aspect ratio
- no iframe
- no `panel: true` requirement

## Features

- Easy / Medium / Hard
- Safe first click
- Touch-friendly flag mode
- Desktop right-click flags
- Home Assistant dark/light theme variables
- Persistent top-10 leaderboard
- Separate leaderboard per difficulty
- Logged-in HA user names
- Personal best
- Config Flow
- Automatic frontend resource registration
- HACS-ready
- Automatically registers the Lovelace module after Home Assistant startup
- Leaderboard uses Home Assistant's authenticated `hass.callApi()` frontend API
- Local integration icon under `custom_components/minesweeper/brand/`
- Frontend card registered at integration setup so it is available before dashboards are constructed
- Czech and English config-flow translations

## Reset records

Developer Tools → Actions:

```yaml
action: minesweeper.reset_records
data:
  difficulty: all
```

Available: `all`, `easy`, `medium`, `hard`.

## Development

Run the Home Assistant custom integration test suite with pytest.

HACS and Hassfest validation are included in GitHub Actions.

## Publishing

Before publishing, replace:

- `YOUR_GITHUB_USER` in `manifest.json`
- `@YOUR_GITHUB_USER` in `manifest.json`

Then create a GitHub release such as `v1.2.0`.

For inclusion in the default HACS store, the repository must meet HACS requirements, including brand assets and passing HACS/Hassfest validation.
