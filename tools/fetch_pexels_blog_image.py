#!/usr/bin/env python3
"""Download a real Pexels stock photo for blog story images (no AI generation)."""
from __future__ import annotations

import argparse
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def download_pexels(photo_id: int, width: int = 1280, height: int = 720) -> bytes:
    url = (
        f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg"
        f"?auto=compress&cs=tinysrgb&w={width}&h={height}&fit=crop"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "MejorVidaInsurance-Blog/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if len(data) < 10_000:
        raise RuntimeError(f"Download too small ({len(data)} bytes) for photo {photo_id}")
    return data


def main() -> int:
    p = argparse.ArgumentParser(description="Fetch Pexels stock photo into blog-generated folder")
    p.add_argument("--slug", required=True, help="e.g. weekly-insurance-update-2026-05-24")
    p.add_argument("--pexels-id", type=int, required=True, help="Pexels photo ID")
    p.add_argument("--output", default="story-1.png", help="Filename under img/blog-generated/<slug>/")
    p.add_argument("--width", type=int, default=1280)
    p.add_argument("--height", type=int, default=720)
    args = p.parse_args()

    out_dir = ROOT / "img" / "blog-generated" / args.slug
    out_dir.mkdir(parents=True, exist_ok=True)
    jpg = out_dir / f".tmp-{args.pexels_id}.jpg"
    png = out_dir / args.output

    jpg.write_bytes(download_pexels(args.pexels_id, args.width, args.height))
    subprocess.run(
        ["sips", "-s", "format", "png", str(jpg), "--out", str(png)],
        check=True,
        capture_output=True,
    )
    jpg.unlink(missing_ok=True)
    print(f"Saved {png} (Pexels photo {args.pexels_id})")
    print(f"Credit: https://www.pexels.com/photo/{args.pexels_id}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
