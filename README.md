# 💣 Minesweeper for Home Assistant

A mobile-friendly Minesweeper game for Home Assistant with a persistent leaderboard tied to the authenticated Home Assistant user.

[![Open in HACS](https://img.shields.io/badge/Open%20in-HACS-18BCF2?logo=homeassistant&logoColor=white)](https://my.home-assistant.io/redirect/hacs_repository/?owner=tejxhdx&repository=minesweeper-ha&category=integration)

## Install with HACS

1. Click **Open in HACS** above, or open **HACS → Integrations**.
2. Install **Minesweeper**.
3. Restart Home Assistant.
4. Go to **Settings → Devices & services → Add integration → Minesweeper**.
5. Add the dashboard card:

```yaml
type: custom:minesweeper-card
difficulty: medium
show_leaderboard: true
```

No `configuration.yaml` entry is required.

No manual upload to `/config/www` is required.

No manual Lovelace resource entry is required. The integration serves and registers its bundled card automatically.

## Features

- Easy / Medium / Hard
- Safe first click
- Touch-friendly flag mode
- Desktop right-click flags
- Home Assistant dark/light theme variables
- Persistent top-10 leaderboard
- Separate leaderboard per difficulty
- Logged-in Home Assistant user names
- Personal best
- Config Flow
- Automatic frontend resource registration
- Responsive desktop, tablet and mobile layout
- No iframe and no `panel: true` requirement
- Czech and English config-flow translations
- Integration icon and HACS metadata

## Reset records

Developer Tools → Actions:

```yaml
action: minesweeper.reset_records
data:
  difficulty: all
```

Available: `all`, `easy`, `medium`, `hard`.

## Development

Run the test suite with:

```bash
python -m pytest -q
```

GitHub Actions validates the project with HACS validation, Hassfest and pytest.

## Release

Current release: **v1.2.4**.

The project is distributed under the MIT License.
