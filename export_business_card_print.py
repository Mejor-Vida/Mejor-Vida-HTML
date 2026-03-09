from pathlib import Path
from urllib.parse import urljoin

from PIL import Image
from playwright.sync_api import sync_playwright


DPI = 300
TRIM_W, TRIM_H = 1050, 600
BLEED_W, BLEED_H = 1125, 675
SAFE_W, SAFE_H = 975, 525


def render_card_faces(html_path: Path, output_dir: Path) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    raw_front = output_dir / "_raw-front.png"
    raw_back = output_dir / "_raw-back.png"

    url = urljoin("file:", str(html_path.resolve()))

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1400, "height": 1200}, device_scale_factor=2)
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(1200)

        cards = page.locator(".card")
        if cards.count() < 2:
            browser.close()
            raise RuntimeError("Expected two .card elements (front and back).")

        cards.nth(0).screenshot(path=str(raw_front))
        cards.nth(1).screenshot(path=str(raw_back))
        browser.close()

    return raw_front, raw_back


def build_print_image(raw_path: Path, out_png: Path, out_pdf: Path) -> None:
    src = Image.open(raw_path).convert("RGB")
    trim = src.resize((TRIM_W, TRIM_H), Image.Resampling.LANCZOS)

    bleed = Image.new("RGB", (BLEED_W, BLEED_H))
    off_x = (BLEED_W - TRIM_W) // 2
    off_y = (BLEED_H - TRIM_H) // 2
    right_w = BLEED_W - TRIM_W - off_x
    bottom_h = BLEED_H - TRIM_H - off_y

    # Center trim artwork.
    bleed.paste(trim, (off_x, off_y))

    # Extend left/right edges.
    left_edge = trim.crop((0, 0, 1, TRIM_H)).resize((off_x, TRIM_H), Image.Resampling.BICUBIC)
    right_edge = trim.crop((TRIM_W - 1, 0, TRIM_W, TRIM_H)).resize((right_w, TRIM_H), Image.Resampling.BICUBIC)
    bleed.paste(left_edge, (0, off_y))
    bleed.paste(right_edge, (off_x + TRIM_W, off_y))

    # Extend top/bottom edges.
    top_edge = trim.crop((0, 0, TRIM_W, 1)).resize((TRIM_W, off_y), Image.Resampling.BICUBIC)
    bottom_edge = trim.crop((0, TRIM_H - 1, TRIM_W, TRIM_H)).resize((TRIM_W, bottom_h), Image.Resampling.BICUBIC)
    bleed.paste(top_edge, (off_x, 0))
    bleed.paste(bottom_edge, (off_x, off_y + TRIM_H))

    # Fill corners from nearest corner pixels.
    tl = trim.crop((0, 0, 1, 1)).resize((off_x, off_y), Image.Resampling.NEAREST)
    tr = trim.crop((TRIM_W - 1, 0, TRIM_W, 1)).resize((right_w, off_y), Image.Resampling.NEAREST)
    bl = trim.crop((0, TRIM_H - 1, 1, TRIM_H)).resize((off_x, bottom_h), Image.Resampling.NEAREST)
    br = trim.crop((TRIM_W - 1, TRIM_H - 1, TRIM_W, TRIM_H)).resize((right_w, bottom_h), Image.Resampling.NEAREST)
    bleed.paste(tl, (0, 0))
    bleed.paste(tr, (off_x + TRIM_W, 0))
    bleed.paste(bl, (0, off_y + TRIM_H))
    bleed.paste(br, (off_x + TRIM_W, off_y + TRIM_H))

    bleed.save(out_png, format="PNG", dpi=(DPI, DPI))
    bleed.save(out_pdf, format="PDF", resolution=DPI)


def main() -> None:
    root = Path(__file__).resolve().parent
    html_path = root / "business_card.html"
    print_dir = root / "print"

    raw_front, raw_back = render_card_faces(html_path, print_dir)

    build_print_image(
        raw_front,
        print_dir / "business-card-front.png",
        print_dir / "business-card-front.pdf",
    )
    build_print_image(
        raw_back,
        print_dir / "business-card-back.png",
        print_dir / "business-card-back.pdf",
    )

    raw_front.unlink(missing_ok=True)
    raw_back.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
