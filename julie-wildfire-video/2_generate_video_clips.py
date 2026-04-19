#!/usr/bin/env python3
"""
STEP 2: Generate 4 video clips via Kling (fal.ai).
- With character_lock: Kling O1 Reference-to-Video + Elements (locks Julie face/body)
- Without: Kling 2.1 Pro image-to-video

Requires: FAL_KEY in .env.local or environment
Output: clips/clip1_intro.mp4, clip2_news.mp4, clip3_fire_reaction.mp4, clip4_action_cta.mp4
"""
import os
import sys
import json
import time

# Load .env.local if present
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.isfile(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

API_KEY = os.environ.get("FAL_KEY")
if not API_KEY:
    print("ERROR: FAL_KEY not set. Add to .env.local or environment.", file=sys.stderr)
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
CLIPS_DIR = os.path.join(SCRIPT_DIR, "clips")
ASSETS_DIR = os.path.join(SCRIPT_DIR, "assets")
os.makedirs(CLIPS_DIR, exist_ok=True)


def load_config():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def get_image_url(image_path: str) -> str:
    """Get fal URL for image (upload if local file)."""
    path = os.path.join(SCRIPT_DIR, image_path) if not os.path.isabs(image_path) else image_path
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Image not found: {path}")

    try:
        import fal_client
    except ImportError:
        print("ERROR: fal-client required. Run: pip install fal-client", file=sys.stderr)
        sys.exit(1)

    return fal_client.upload_file(path)


def download_video(url: str, output_path: str) -> bool:
    """Download video from URL to file."""
    try:
        import requests
    except ImportError:
        print("ERROR: requests required. pip install requests", file=sys.stderr)
        return False

    r = requests.get(url, timeout=120)
    if r.status_code != 200:
        print(f"ERROR: Failed to download {url}: {r.status_code}", file=sys.stderr)
        return False

    with open(output_path, "wb") as f:
        f.write(r.content)
    print(f"✅ Saved: {output_path}")
    return True


def generate_clip_kling21(clip_id: str, prompt: str, image_path: str, duration: int, output_path: str) -> bool:
    """Generate via Kling 2.1 Pro image-to-video (no character lock)."""
    import fal_client
    print(f"🎬 Generating {clip_id} ({duration}s) [Kling 2.1]...")
    image_url = get_image_url(image_path)
    result = fal_client.subscribe(
        "fal-ai/kling-video/v2.1/pro/image-to-video",
        arguments={
            "prompt": prompt,
            "image_url": image_url,
            "duration": "10" if duration >= 8 else "5",
            "negative_prompt": "blur, distort, low quality, exaggerated motion",
            "cfg_scale": 0.5,
        },
        with_logs=True,
    )
    video_url = result.get("video", {}).get("url") if isinstance(result.get("video"), dict) else result.get("video")
    if not video_url:
        print(f"ERROR: No video URL in result: {result}", file=sys.stderr)
        return False
    return download_video(video_url, output_path)


def generate_clip_o1_with_elements(
    clip_id: str,
    prompt: str,
    scene_image_path: str,
    julie_avatar_url: str,
    character_name: str,
    duration: int,
    output_path: str,
) -> bool:
    """Generate via Kling O1 Reference-to-Video with Elements (locks Julie face/body)."""
    import fal_client
    print(f"🎬 Generating {clip_id} ({duration}s) [Kling O1 + Elements]...")
    scene_url = get_image_url(scene_image_path)
    # O1: image_urls[0] = start frame, elements[0] = character locked in
    o1_prompt = (
        f"Take @Image1 as the start frame. {prompt} "
        f"The character {character_name} (@Element1) — maintain her face and body shape consistently throughout."
    )
    dur = str(min(max(duration, 3), 10))  # O1 supports 3-10
    result = fal_client.subscribe(
        "fal-ai/kling-video/o1/reference-to-video",
        arguments={
            "prompt": o1_prompt,
            "image_urls": [scene_url],
            "elements": [
                {
                    "frontal_image_url": julie_avatar_url,
                    "reference_image_urls": [julie_avatar_url],
                }
            ],
            "duration": dur,
            "aspect_ratio": "16:9",
        },
        with_logs=True,
    )
    video_url = result.get("video", {}).get("url") if isinstance(result.get("video"), dict) else result.get("video")
    if not video_url:
        print(f"ERROR: No video URL in result: {result}", file=sys.stderr)
        return False
    return download_video(video_url, output_path)


def main():
    config = load_config()
    clips = config["script"]["clips"]
    assets = config["assets"]

    # Fallback order: per-clip image → firefighter base → Julie avatar from JSON
    base = (
        assets.get("julie_firefighter_base")
        or assets.get("clip1_image")
        or assets.get("julie_avatar_reference")
    )
    if not base:
        base = "assets/julie_firefighter_base.png"

    for i, clip in enumerate(clips, 1):
        clip_id = clip["id"]
        prompt = clip["prompt"]
        duration = clip.get("duration_seconds", 6)

        # Prefer per-clip image, fallback to base
        image_key = f"clip{i}_image" if f"clip{i}_image" in assets else "julie_firefighter_base"
        image_path = assets.get(image_key, base)
        # julie_avatar_reference is at project root (img/), others in julie-wildfire-video/
        root = PROJECT_DIR if image_path.startswith("img/") else SCRIPT_DIR
        full_path = os.path.join(root, image_path)

        if not os.path.isfile(full_path):
            # Try first available asset (includes Julie avatar from JSON)
            for k in ["clip1_image", "clip2_image", "clip3_image", "clip4_image", "julie_firefighter_base", "julie_avatar_reference"]:
                p = os.path.join(PROJECT_DIR, assets.get(k, "")) if k == "julie_avatar_reference" else os.path.join(SCRIPT_DIR, assets.get(k, ""))
                if os.path.isfile(p):
                    full_path = p
                    print(f"   Using fallback image: {p}")
                    break

        if not os.path.isfile(full_path):
            print(f"ERROR: No base image found. Add Julie firefighter images to {ASSETS_DIR}/", file=sys.stderr)
            sys.exit(1)

        out_path = os.path.join(CLIPS_DIR, f"{clip_id}.mp4")
        lock = config.get("character_lock", {})
        if lock.get("enabled") and lock.get("julie_avatar_url"):
            char_name = config.get("character", {}).get("name", "Julie_mv")
            success = generate_clip_o1_with_elements(
                clip_id, prompt, full_path, lock["julie_avatar_url"], char_name, duration, out_path
            )
        else:
            success = generate_clip_kling21(clip_id, prompt, full_path, duration, out_path)
        if not success:
            sys.exit(1)
        time.sleep(2)  # Rate limit

    print("\n✅ Step 2 complete. Clips in:", CLIPS_DIR)


if __name__ == "__main__":
    main()
