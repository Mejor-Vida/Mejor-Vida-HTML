#!/usr/bin/env python3
"""
Generate the5-state mvi-chat-avatar PNG pack from one approved base image.

- idle.png     → exact copy of source (approved identity), unless --expressions-only
- blink/happy/thinking/attention → FLUX Kontext (fal.ai), expression-only edits

Multi-candidate mode (--num-candidates > 1):
  Saves all tries under img/mvi-chat-avatar/_candidates/<run_id>/
  Picks the winner per state by low body/clothing drift vs idle + sufficient face change.

Requires: FAL_KEY, pip install fal-client requests numpy pillow
Loads .env.local from repo root when present.

Usage:
  python3 tools/generate_mvi_chat_avatar_pack.py
  python3 tools/generate_mvi_chat_avatar_pack.py --expressions-only --num-candidates 3 \\
      --endpoint fal-ai/flux-pro/kontext
"""
from __future__ import annotations

import argparse
import io
import os
import shutil
import sys
import time
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = PROJECT_ROOT / "img" / "mvi-chat-avatar" / "source_identity.png"
OUT_DIR = PROJECT_ROOT / "img" / "mvi-chat-avatar"

# Tight lock: wardrobe, hair, pose, lens, background; expression only.
PRESERVE = (
    "Keep this exact same 3D animated professional woman: identical full-body framing, camera distance, "
    "head size in frame, standing pose with arms at sides, same dark navy blazer and matching trousers, "
    "same light grey shirt, same black belt and silver buckle, same black heels, same brown shoulder-length "
    "wavy hair and side part, same necklace, same soft studio lighting and flat white background. "
    "Do not alter clothing folds dramatically, body proportions, hands, or hair silhouette. "
    "Only modify the face: eyes and mouth as specified — subtle and professional, not cartoon-exaggerated."
)

STATE_PROMPTS: dict[str, str] = {
    "blink": PRESERVE
    + " Face: gentle natural blink — upper lids softly lowered so eyes appear closed, no squint, "
    "mouth stays in the same neutral pleasant closed-lip smile as the reference.",
    "happy": PRESERVE
    + " Face: slightly warmer professional smile — closed mouth or small teeth acceptable, cheeks lift a little, "
    "eyes soften slightly; still business-appropriate, not a huge grin.",
    "thinking": PRESERVE
    + " Face: subtle thoughtful look — gaze shifts slightly upward or to the side, lips neutral or very lightly "
    "pursed, minimal eyebrow asymmetry; understated, not theatrical.",
    "attention": PRESERVE
    + " Face: alert and engaged but restrained — eyes a bit more open and bright, eyebrows slightly lifted, "
    "mouth neutral closed; professional attentiveness, not surprised or shocked.",
}


def load_dotenv_local() -> None:
    env_path = PROJECT_ROOT / ".env.local"
    if not env_path.is_file():
        return
    for raw in env_path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key, val = key.strip(), val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


def download_png(url: str, *, timeout_sec: float = 300) -> bytes:
    r = requests.get(url, timeout=timeout_sec)
    r.raise_for_status()
    return r.content


def run_kontext(
    *,
    endpoint: str,
    image_url: str,
    prompt: str,
    seed: int,
    guidance_scale: float,
    num_inference_steps: int,
    client_timeout: float,
    download_timeout: float,
) -> bytes:
    try:
        import fal_client
    except ImportError as e:
        raise RuntimeError("Install fal-client: pip install fal-client") from e

    result = fal_client.subscribe(
        endpoint,
        arguments={
            "prompt": prompt,
            "image_url": image_url,
            "seed": seed,
            "guidance_scale": guidance_scale,
            "num_inference_steps": num_inference_steps,
            "output_format": "png",
            "resolution_mode": "match_input",
            "enable_safety_checker": True,
        },
        client_timeout=client_timeout,
    )
    images = result.get("images") or []
    if not images:
        raise RuntimeError(f"No images in result: {result}")
    img0 = images[0]
    url = img0.get("url") if isinstance(img0, dict) else img0
    if not url:
        raise RuntimeError(f"No url in image: {img0}")
    return download_png(url, timeout_sec=download_timeout)


def match_canvas_to_source(png_bytes: bytes, source_path: Path) -> bytes:
    try:
        from PIL import Image
    except ImportError:
        return png_bytes

    src = Image.open(source_path).convert("RGBA")
    tw, th = src.size
    im = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    if im.size == (tw, th):
        out = im
    else:
        sw, sh = im.size
        scale = max(tw / sw, th / sh)
        nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        l, t = (nw - tw) // 2, (nh - th) // 2
        out = im.crop((l, t, l + tw, t + th))
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def load_rgb_np(path: Path):
    import numpy as np
    from PIL import Image

    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float64)


# Heavier weights = stronger penalty vs idle (favor minimal drift outside the face).
LOCK_WEIGHTS = {
    "legs_mse": 1.05,
    "torso_mse": 1.55,  # blazer body / crop
    "shoulder_mse": 2.15,  # shoulders + upper blazer
    "hair_mse": 1.45,  # hair silhouette
    "framing_mse": 1.4,  # side strips / global crop
}


def full_consistency_scores(idle_rgb, cand_rgb) -> dict[str, float]:
    """
    Region MSEs vs idle (RGB, 0–255). face_mse should rise with expression change;
    everything else should stay low for a good candidate.
    """
    import numpy as np

    h, w = idle_rgb.shape[:2]

    def mse_region(y0: int, y1: int, x0: int = 0, x1: int | None = None) -> float:
        if x1 is None:
            x1 = w
        return float(np.mean((idle_rgb[y0:y1, x0:x1] - cand_rgb[y0:y1, x0:x1]) ** 2))

    xf0, xf1 = int(w * 0.10), int(w * 0.90)
    y_face0, y_face1 = int(h * 0.16), int(h * 0.42)
    y_hair0, y_hair1 = 0, int(h * 0.22)
    y_sh0, y_sh1 = int(h * 0.24), int(h * 0.46)
    y_tor0, y_tor1 = int(h * 0.46), int(h * 0.58)
    y_leg0 = int(h * 0.55)
    strip = max(4, int(w * 0.035))
    m_left = mse_region(0, h, 0, strip)
    m_right = mse_region(0, h, w - strip, w)
    framing_mse = 0.5 * (m_left + m_right)

    return {
        "face_mse": mse_region(y_face0, y_face1, xf0, xf1),
        "hair_mse": mse_region(y_hair0, y_hair1, 0, w),
        "shoulder_mse": mse_region(y_sh0, y_sh1, 0, w),
        "torso_mse": mse_region(y_tor0, y_tor1, 0, w),
        "legs_mse": mse_region(y_leg0, h, 0, w),
        "framing_mse": framing_mse,
    }


def lock_score_from_metrics(m: dict[str, float]) -> float:
    return sum(LOCK_WEIGHTS[k] * m[k] for k in LOCK_WEIGHTS)


def pick_best_candidate(
    idle_path: Path,
    cand_paths: list[Path],
    *,
    min_face_mse: float,
) -> tuple[Path, dict]:
    """
    Minimize weighted body / torso / shoulder / hair / framing drift while keeping enough facial change.
    """
    idle_rgb = load_rgb_np(idle_path)
    rows: list[tuple[Path, dict[str, float], float]] = []
    for p in cand_paths:
        c = load_rgb_np(p)
        if c.shape != idle_rgb.shape:
            continue
        metrics = full_consistency_scores(idle_rgb, c)
        lock = lock_score_from_metrics(metrics)
        rows.append((p, metrics, lock))

    if not rows:
        raise RuntimeError("No valid candidates to score")

    max_face = max(r[1]["face_mse"] for r in rows)
    floor = max(min_face_mse, 0.2 * max_face)
    eligible = [r for r in rows if r[1]["face_mse"] >= floor]
    if not eligible:
        eligible = rows

    best = min(eligible, key=lambda r: (r[2], -r[1]["face_mse"]))
    meta = {
        "path": str(best[0]),
        "metrics": best[1],
        "lock_score": best[2],
        "all": [
            {
                "path": str(p),
                "lock": lk,
                **met,
            }
            for p, met, lk in sorted(rows, key=lambda x: x[2])
        ],
    }
    return best[0], meta


def build_contact_strip(
    *,
    idle_path: Path,
    cand_paths: list[Path],
    out_path: Path,
    thumb_height: int = 440,
    gap: int = 10,
) -> None:
    """Horizontal strip: idle | candidate0 | candidate1 | … for visual review."""
    from PIL import Image, ImageDraw, ImageFont

    tiles: list[Image.Image] = []
    labels: list[str] = ["idle"]
    im_idle = Image.open(idle_path).convert("RGBA")
    ih, iw = im_idle.size[1], im_idle.size[0]
    scale = thumb_height / ih
    tw = max(1, int(iw * scale))
    tiles.append(im_idle.resize((tw, thumb_height), Image.Resampling.LANCZOS))
    for i, cp in enumerate(cand_paths):
        im = Image.open(cp).convert("RGBA")
        ih2, iw2 = im.size[1], im.size[0]
        sc2 = thumb_height / ih2
        tw2 = max(1, int(iw2 * sc2))
        tiles.append(im.resize((tw2, thumb_height), Image.Resampling.LANCZOS))
        labels.append(cp.stem)

    label_h = 22
    total_w = sum(t.width for t in tiles) + gap * (len(tiles) + 1)
    total_h = thumb_height + label_h + gap
    canvas = Image.new("RGBA", (total_w, total_h), (245, 246, 250, 255))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
    except OSError:
        font = ImageFont.load_default()

    x = gap
    for t, lab in zip(tiles, labels):
        canvas.paste(t, (x, gap), t)
        draw.text((x, gap + thumb_height + 2), lab[:28], fill=(30, 41, 59, 255), font=font)
        x += t.width + gap

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, format="PNG", optimize=True)


def run_qa_checks(idle_path: Path, out_dir: Path) -> int:
    """Print extended QA; return0 if all four finals exist and differ from idle."""
    import numpy as np

    states = ["blink", "happy", "thinking", "attention"]
    idle_rgb = load_rgb_np(idle_path)
    ok = True
    per_state: list[tuple[str, dict[str, float], float]] = []
    print("\n--- QA (vs idle.png) ---")
    for s in states:
        p = out_dir / f"{s}.png"
        if not p.is_file():
            print(f"  MISSING {p.name}")
            ok = False
            continue
        c = load_rgb_np(p)
        if c.shape != idle_rgb.shape:
            print(f"  FAIL {s}: size {c.shape} != idle {idle_rgb.shape}")
            ok = False
            continue
        m = full_consistency_scores(idle_rgb, c)
        lk = lock_score_from_metrics(m)
        per_state.append((s, m, lk))
        identical = np.allclose(idle_rgb, c)
        print(
            f"  {s}: lock={lk:.1f} face={m['face_mse']:.0f} "
            f"hair={m['hair_mse']:.0f} sh={m['shoulder_mse']:.0f} "
            f"torso={m['torso_mse']:.0f} legs={m['legs_mse']:.0f} frame={m['framing_mse']:.0f} "
            f"identical={identical}"
        )
        if identical:
            ok = False

    if per_state:
        worst = max(per_state, key=lambda t: t[2])
        best = min(per_state, key=lambda t: t[2])
        print("\n  --- QA summary ---")
        print(f"  All four finals present & not identical to idle: {ok}")
        print(f"  Tightest lock (crop/clothing/hair vs idle): {best[0]} (lock={best[2]:.1f})")
        print(f"  Most drift vs idle: {worst[0]} (lock={worst[2]:.1f}) — compare contact_strip_{worst[0]}.png in the run folder.")

    if ok:
        print("  All four states present and visually distinct from idle at pixel level.")
    return 0 if ok else 1


def main() -> int:
    load_dotenv_local()
    if not os.environ.get("FAL_KEY"):
        print("ERROR: Set FAL_KEY (e.g. in .env.local).", file=sys.stderr)
        return 1

    parser = argparse.ArgumentParser(description="Generate mvi-chat-avatar pack via fal Kontext")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Approved base PNG (idle identity)")
    parser.add_argument(
        "--endpoint",
        default="fal-ai/flux-pro/kontext",
        help="fal model id (flux-kontext/dev is faster/cheaper; flux-pro/kontext is higher quality)",
    )
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds between API calls")
    parser.add_argument("--base-seed", type=int, default=884_102_447, help="Base seed offset for attempts")
    parser.add_argument(
        "--expressions-only",
        action="store_true",
        help="Do not copy source to idle.png; only regenerate blink/happy/thinking/attention",
    )
    parser.add_argument("--num-candidates", type=int, default=3, help="Generations per state when >1")
    parser.add_argument(
        "--guidance-scale",
        type=float,
        default=2.2,
        help="Lower = stick closer to reference (try 2.0–2.5)",
    )
    parser.add_argument("--steps", type=int, default=32, help="Inference steps (pro often benefits from 28–36)")
    parser.add_argument(
        "--fal-client-timeout",
        type=float,
        default=420.0,
        help="fal_client.subscribe client_timeout (seconds); raise if Kontext jobs often hit read timeouts",
    )
    parser.add_argument(
        "--download-timeout",
        type=float,
        default=300.0,
        help="HTTP timeout when downloading result PNG from fal CDN",
    )
    parser.add_argument(
        "--min-face-mse",
        type=float,
        default=6.0,
        help="Minimum mean squared RGB diff in face band vs idle to count as expression change",
    )
    parser.add_argument("--skip-qa", action="store_true", help="Do not print post-run QA block")
    args = parser.parse_args()

    source = args.source.resolve()
    if not source.is_file():
        print(f"ERROR: Source image not found: {source}", file=sys.stderr)
        return 1

    idle_ref = OUT_DIR / "idle.png"
    if args.expressions_only:
        if not idle_ref.is_file():
            print(f"ERROR: --expressions-only requires existing {idle_ref}", file=sys.stderr)
            return 1
        identity_for_compare = idle_ref
    else:
        identity_for_compare = source

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    cand_root = OUT_DIR / "_candidates" / run_id
    cand_root.mkdir(parents=True, exist_ok=True)

    try:
        import fal_client
    except ImportError:
        print("ERROR: pip install fal-client", file=sys.stderr)
        return 1

    try:
        import numpy as np # noqa: F401
    except ImportError:
        print("ERROR: pip install numpy", file=sys.stderr)
        return 1

    print(f"Uploading identity reference: {source}")
    uploaded = fal_client.upload_file(str(source))
    print(f"  image_url: {uploaded[:60]}...")

    if not args.expressions_only:
        shutil.copy2(source, idle_ref)
        print(f"Saved idle.png (exact copy of source) → {idle_ref}")

    states = ["blink", "happy", "thinking", "attention"]
    k = max(1, args.num_candidates)

    for si, state in enumerate(states):
        prompt = STATE_PROMPTS[state]
        cand_paths: list[Path] = []
        print(f"\n=== {state} ({k} candidates) ===")
        for j in range(k):
            seed = args.base_seed + si * 251 + j * 10_007
            t0 = time.time()
            raw: bytes | None = None
            last_err: Exception | None = None
            for attempt in range(4):
                try:
                    raw = run_kontext(
                        endpoint=args.endpoint,
                        image_url=uploaded,
                        prompt=prompt,
                        seed=seed,
                        guidance_scale=args.guidance_scale,
                        num_inference_steps=args.steps,
                        client_timeout=args.fal_client_timeout,
                        download_timeout=args.download_timeout,
                    )
                    last_err = None
                    break
                except Exception as e:
                    last_err = e
                    msg = str(e).lower()
                    if attempt < 3 and ("timeout" in msg or "timed out" in msg):
                        wait = 8.0 * (attempt + 1)
                        print(
                            f"  timeout on {state} #{j} attempt {attempt + 1}/4 — retry in {wait:.0f}s",
                            file=sys.stderr,
                        )
                        time.sleep(wait)
                        continue
                    print(f"ERROR fal Kontext ({state} #{j}): {e}", file=sys.stderr)
                    return 1
            if raw is None:
                print(f"ERROR fal Kontext ({state} #{j}): {last_err}", file=sys.stderr)
                return 1
            png = match_canvas_to_source(raw, source)
            cpath = cand_root / f"{state}_{j}.png"
            cpath.write_bytes(png)
            cand_paths.append(cpath)
            print(f"  candidate {j} seed={seed} saved {cpath.name} ({len(png)} b) {time.time() - t0:.1f}s")
            if args.delay > 0:
                time.sleep(args.delay)

        best_path, meta = pick_best_candidate(identity_for_compare, cand_paths, min_face_mse=args.min_face_mse)
        final_path = OUT_DIR / f"{state}.png"
        shutil.copy2(best_path, final_path)
        mm = meta["metrics"]
        print(
            f"  → winner {best_path.name} lock={meta['lock_score']:.2f} "
            f"face={mm['face_mse']:.0f} hair={mm['hair_mse']:.0f} sh={mm['shoulder_mse']:.0f} "
            f"tor={mm['torso_mse']:.0f} legs={mm['legs_mse']:.0f} fr={mm['framing_mse']:.0f} → {final_path.name}"
        )

    print(f"\nCandidates kept under: {cand_root}")

    def sorted_cands(state: str) -> list[Path]:
        ps = list(cand_root.glob(f"{state}_*.png"))

        def sort_key(p: Path) -> int:
            m = re.match(rf"^{state}_(\d+)\.png$", p.name)
            return int(m.group(1)) if m else 0

        return sorted(ps, key=sort_key)

    for state in states:
        cands = sorted_cands(state)
        if cands:
            strip_path = cand_root / f"contact_strip_{state}.png"
            build_contact_strip(
                idle_path=identity_for_compare,
                cand_paths=cands,
                out_path=strip_path,
            )
            print(f"Contact strip: {strip_path.name}")

    print("Final outputs:", OUT_DIR)

    if not args.skip_qa:
        code = run_qa_checks(idle_ref, OUT_DIR)
        if code != 0:
            print("QA reported issues; review candidates folder and re-run with different seeds if needed.", file=sys.stderr)
        return code
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
