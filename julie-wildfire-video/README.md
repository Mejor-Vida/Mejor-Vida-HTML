# Julie Wildfire Insurance Video (Pixar Style)

Create a short cinematic animated video with Julie firefighter delivering an insurance news update in Colombian Spanish.

## Style
- 3D Pixar-style animation
- Colombian Spanish (Bogotá tone)
- ~25–30 seconds, 16:9

## Prerequisites

1. **Python 3.8+** with:
   ```bash
   pip install elevenlabs fal-client requests
   ```

2. **ffmpeg** installed (`brew install ffmpeg` on macOS)

3. **API keys** in `.env.local` (project root):
   - `ELEVENLABS_API_KEY` – for Julie cloned voice
   - `FAL_KEY` – for Kling video generation

4. **Assets** in `julie-wildfire-video/assets/`:
   - `julie_firefighter_base.png` – Julie firefighter character (Pixar-style)
   - Or per-clip: `clip1_intro.png`, `clip2_news.png`, `clip3_fire_reaction.png`, `clip4_action_cta.png`
   - Optional: `fire_crackle.wav`, `water_spray.wav` for sound design

## Workflow

### Step 0: Generate base images (optional)
```bash
cd /path/to/Mejor-Vida-HTML
python julie-wildfire-video/0_generate_base_images.py
```
- Uses `tools/generate_julie_images.py` + Julie LoRA to create firefighter base image
- Copies result to `assets/julie_firefighter_base.png`

### Step 1: Generate voice
```bash
cd julie-wildfire-video
python 1_generate_voice.py
```
- Output: `audio/audio.wav` (full) and `audio/clip_*.wav` (per clip)

### Step 2: Generate video clips
```bash
python 2_generate_video_clips.py
```
- **Character lock on** (config): Kling O1 Reference-to-Video + Elements — locks Julie's face and body
- **Character lock off**: Kling 2.1 Pro image-to-video
- Output: `clips/clip1_intro.mp4`, `clip2_news.mp4`, etc.

### Step 3: Assemble video
```bash
python 3_assemble_video.py
```
- Concatenates clips and syncs with audio
- Output: `julie_wildfire_assembled.mp4`

### Step 4: Sound design (optional)
```bash
python 4_sound_design.py
```
- Adds fire crackling / water spray if assets provided
- Output: `julie_wildfire_final.mp4`

## Run all steps
```bash
python 1_generate_voice.py && \
python 2_generate_video_clips.py && \
python 3_assemble_video.py && \
python 4_sound_design.py
```

## Config
Edit `config.json` to change:
- **character_lock** — Julie avatar URL for face/body consistency (Kling O1 Elements)
- ElevenLabs voice settings (stability, clarity)
- Clip prompts and durations
- Asset paths

## Voice
Julie cloned voice ID: `FalLEKHJXUP87G7DLPfk` (from `img/julie-avatar-reference.json`)
