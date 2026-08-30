from pathlib import Path

from custom_components.minesweeper.const import FRONTEND_DIR, CARD_FILENAME


ROOT = Path(__file__).resolve().parents[1]


def test_card_and_brand_are_inside_integration():
    assert (Path(FRONTEND_DIR) / CARD_FILENAME).is_file()
    assert (ROOT / "custom_components" / "minesweeper" / "brand" / "icon.png").is_file()
    assert not (ROOT / "brand").exists()


def test_card_uses_home_assistant_api():
    card = (Path(FRONTEND_DIR) / CARD_FILENAME).read_text(encoding="utf-8")
    assert 'this._hass.callApi(' in card
    assert 'minesweeper/records' in card
