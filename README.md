# 💣 Minesweeper for Home Assistant

A mobile-friendly Minesweeper game for Home Assistant with a persistent leaderboard tied to the authenticated Home Assistant user.

[![Find in Home Assistant Marketplace](https://img.shields.io/badge/Find%20in-Home%20Assistant%20Marketplace-18BCF2?logo=homeassistant&logoColor=white)](https://www.home-assistant.io/integrations/marketplace/)

## Install from Home Assistant Marketplace

Available in the built-in Home Assistant Marketplace (Home Assistant 2026.11 and newer).

1. In Home Assistant, open **Settings → Marketplace**.
2. Search for **Minesweeper** and open the project page.
3. Select **Install** and confirm the installation.
4. Follow the integration setup flow. If you close it, you can add Minesweeper later under **Settings → Devices & services**.
5. Add the dashboard card:

```yaml
type: custom:minesweeper-card
difficulty: medium
show_leaderboard: true
```

No `configuration.yaml` entry is required.

No manual upload to `/config/www` is required.

No manual Lovelace resource entry is required. The integration serves and registers its bundled card automatically.

For more information about the Marketplace, see the [official Home Assistant Marketplace documentation](https://www.home-assistant.io/integrations/marketplace/).

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
- Integration icon and Marketplace metadata

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
