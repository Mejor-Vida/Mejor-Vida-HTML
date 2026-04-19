#!/usr/bin/env python3
"""
STEP 3: Assemble video clips with audio sync.
Extends video (holds last frame) if audio is longer than video so full script plays.

Requires: ffmpeg, ffprobe
Input: clips/*.mp4, audio/audio.mp3
Output: julie_wildfire_assembled.mp4
"""
import os
import sys
import json
import shutil
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
CLIPS_DIR = os.path.join(SCRIPT_DIR, "clips")
AUDIO_DIR = os.path.join(SCRIPT_DIR, "audio")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "julie_wildfire_assembled.mp4")
_ff = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
_pr = shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
FFMPEG = os.environ.get("FFMPEG", _ff)
FFPROBE = os.environ.get("FFPROBE", _pr)


def load_config():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def run(cmd, check=True):
    r = subprocess.run(cmd, shell=True)
    if check and r.returncode != 0:
        sys.exit(r.returncode)
    return r.returncode


def get_duration(path, use_concat=False):
    """Get duration in seconds via ffprobe."""
    if use_concat:
        cmd = f'{FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 -f concat -safe 0 -i {path!r}'
    else:
        cmd = f'{FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 -i {path!r}'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        return 0.0
    try:
        return float(result.stdout.strip())
    except (ValueError, TypeError):
        return 0.0


def main():
    config = load_config()
    clips = config["script"]["clips"]

    clip_files = []
    for clip in clips:
        path = os.path.join(CLIPS_DIR, f"{clip['id']}.mp4")
        if not os.path.isfile(path):
            print(f"ERROR: Clip not found: {path}", file=sys.stderr)
            sys.exit(1)
        clip_files.append(path)

    audio_path = os.path.join(AUDIO_DIR, "audio.mp3")
    if not os.path.isfile(audio_path):
        print(f"ERROR: Audio not found: {audio_path}. Run: python 1_generate_voice.py", file=sys.stderr)
        sys.exit(1)

    list_path = os.path.join(SCRIPT_DIR, "concat_list.txt")
    with open(list_path, "w") as f:
        for p in clip_files:
            f.write(f"file '{os.path.abspath(p)}'\n")

    audio_dur = get_duration(audio_path)
    video_dur = get_duration(list_path, use_concat=True)
    extend = max(0, audio_dur - video_dur - 0.5)  # small buffer

    print("🎬 Assembling video...")
    if extend > 0.5:
        print(f"   Extending video by {extend:.1f}s so full script plays")

    # Extend video with tpad (hold last frame) when audio is longer
    vf = f"tpad=stop_mode=clone:stop_duration={extend}" if extend > 0.5 else None
    cmd = (
        f"{FFMPEG} -y -f concat -safe 0 -i {list_path!r} "
        f"-i {audio_path!r} "
    )
    if vf:
        cmd += f"-vf {vf!r} "
    cmd += f"-c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -t {audio_dur} {OUTPUT_PATH!r}"

    run(cmd)
    os.remove(list_path)

    print(f"\n✅ Step 3 complete. Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
