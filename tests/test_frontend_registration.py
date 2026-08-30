from pathlib import Path

from custom_components.minesweeper.const import (
    CARD_FILENAME,
    FRONTEND_DIR,
    RESOURCE_URL,
    STATIC_URL,
)


def test_bundled_card_exists():
    card_path = Path(FRONTEND_DIR) / CARD_FILENAME
    assert card_path.is_file()


def test_card_defines_expected_element():
    card = (Path(FRONTEND_DIR) / CARD_FILENAME).read_text(encoding="utf-8")
    assert 'customElements.define("minesweeper-card"' in card


def test_resource_url_is_versioned():
    assert RESOURCE_URL.startswith(STATIC_URL + "?v=")
