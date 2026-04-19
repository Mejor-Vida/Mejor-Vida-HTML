#!/usr/bin/env python3
"""
STEP 1: Generate Julie voice with ElevenLabs TTS (cloned voice).
Output: audio/audio.wav (full script) and audio/clip_*.wav (per-clip segments)

Requires: ELEVENLABS_API_KEY in .env.local or environment
Voice: FalLEKHJXUP87G7DLPfk (Julie clone from julie-avatar-reference.json)
"""
import os
import sys
import json

# Load .env.local if present
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.isfile(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

API_KEY = os.environ.get("ELEVENLABS_API_KEY")
if not API_KEY:
    print("ERROR: ELEVENLABS_API_KEY not set. Add to .env.local or environment.", file=sys.stderr)
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
AUDIO_DIR = os.path.join(SCRIPT_DIR, "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)


def load_config():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def generate_audio(text: str, output_path: str, voice_id: str, model: str, stability: float, similarity_boost: float, style: float = 0):
    """Generate TTS and save to file."""
    try:
        from elevenlabs.client import ElevenLabs
        from elevenlabs.types import VoiceSettings
    except ImportError:
        print("ERROR: elevenlabs required. Run: pip install elevenlabs", file=sys.stderr)
        sys.exit(1)

    client = ElevenLabs(api_key=API_KEY)
    voice_settings = VoiceSettings(
        stability=stability,
        similarity_boost=similarity_boost,
        style=style,
    )
    audio_stream = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id=model,
        output_format="mp3_44100_128",
        voice_settings=voice_settings,
    )

    with open(output_path, "wb") as f:
        for chunk in audio_stream:
            if isinstance(chunk, bytes):
                f.write(chunk)
    print(f"✅ Saved: {output_path}")


def main():
    config = load_config()
    eleven = config["elevenlabs"]
    voice_id = eleven["voice_id"]
    model = eleven.get("model", "eleven_multilingual_v2")
    stability = eleven.get("stability", 0.5)
    similarity_boost = eleven.get("similarity_boost", 0.8)
    style = eleven.get("style_exaggeration", eleven.get("style", 0))

    full_script = config["script"]["full"]
    full_path = os.path.join(AUDIO_DIR, "audio.mp3")

    print("🎙️ Generating full script audio...")
    generate_audio(full_script, full_path, voice_id, model, stability, similarity_boost, style)

    # Per-clip segments (for sync with video clips)
    for clip in config["script"]["clips"]:
        clip_id = clip["id"]
        text = clip["text"]
        out_path = os.path.join(AUDIO_DIR, f"{clip_id}.mp3")
        print(f"🎙️ Generating {clip_id}...")
        generate_audio(text, out_path, voice_id, model, stability, similarity_boost, style)

    print("\n✅ Step 1 complete. Audio files in:", AUDIO_DIR)


if __name__ == "__main__":
    main()
