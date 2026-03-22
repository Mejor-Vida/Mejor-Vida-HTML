# Mejor Vida HTML Site

## Secure Hugging Face Image Pipeline

This project includes a protected Vercel API for AI image generation and a local save workflow for editorial approval.

### Required Vercel environment variables

- `HF_TOKEN` (server-only)
- `IMAGE_API_AUTH_TOKEN` (shared secret for calling your protected API)

### Endpoints

- `POST /api/generate-image`
  - Requires header: `Authorization: Bearer <IMAGE_API_AUTH_TOKEN>`
  - Accepts JSON:
    - `prompt` (string)
    - `type` (`blog-hero` | `blog-inline` | `social-post` | `ad-creative`)
    - `filename` (string)
    - optional `width`, `height`
  - Returns:
    - `success`, `mimeType`, `base64`, `filename`, `meta`

- `GET /api/test`
  - Returns `{ "ok": true, "message": "API working" }`

### Local generation script

Script: `scripts/generate-image.js`

The script calls your protected endpoint and saves output locally to:

- `img/generated/`

Run example:

```bash
IMAGE_API_AUTH_TOKEN="your_local_auth_token" \
node scripts/generate-image.js \
  --base-url http://localhost:3000 \
  --prompt "Familia hispana sonriendo en casa, estilo editorial, seguro de vida, iluminación natural, sin texto" \
  --type blog-hero \
  --filename blog-hero-sample
```

### Batch weekly generation script

Script: `scripts/generate-weekly-set.js`

Use this when you want one command to generate:
- 1 blog hero
- multiple inline images
- 1 social image
- 1 ad creative

Example config:
- `scripts/weekly-set.example.json`

Run example:

```bash
IMAGE_API_AUTH_TOKEN="your_local_auth_token" \
node scripts/generate-weekly-set.js \
  --base-url http://localhost:3000 \
  --slug weekly-insurance-update-2026-03-08 \
  --config scripts/weekly-set.example.json
```

Output naming pattern:
- `weekly-insurance-update-2026-03-08-hero.png`
- `weekly-insurance-update-2026-03-08-inline-1.png`
- `weekly-insurance-update-2026-03-08-inline-2.png`
- `weekly-insurance-update-2026-03-08-social.png`
- `weekly-insurance-update-2026-03-08-ad.png`

### Approval workflow

1. Generate image(s) locally.
2. Review visuals.
3. Keep only approved images in repo.
4. Commit + push to GitHub.
5. Vercel deploys from GitHub.

### Blog image generation (Fal.ai) — recommended for weekly posts

Script: `tools/generate_blog_images.py`  
Rules: `tools/blog-image-rules.md` (Narrative Editorial Image Strategy)

Generates hero + story images for weekly insurance update blog posts. Uses the **Narrative Editorial Image Strategy**: all people Hispanic/Latino, human-centric and narrative-driven. Hero = Hispanic person in dramatic metaphorical setting; one office shot (Golden Hour) per post; rest = narrative events with active metaphors. Cinematic lighting, professional editorial 8k.

**Important:** Run from a **local terminal** (not Cursor's sandbox). The script needs full network access to Fal.ai; sandboxed runs can fail silently or be blocked.

```bash
# From project root. FAL_KEY is loaded from .env.local automatically.
python3 tools/generate_blog_images.py \
  --slug weekly-insurance-update-2026-03-22 \
  --week-label "March 22, 2026" \
  --provider fal \
  --fal-model realistic-vision \
  --story "Hispanic family reviewing life insurance documents with agent in modern office" \
  --story "Insurance agent using laptop and digital portal for quotes" \
  --story "Senior couple planning final expense coverage" \
  --story "Young couple discussing life insurance with living benefits"
```

Output: `img/blog-generated/<slug>/hero.png` and `story-1.png`, `story-2.png`, etc. Expect ~30–60 seconds per image (hero + 4 stories ≈ 3–5 minutes).

Then update the blog post HTML to use:
- `../img/blog-generated/<slug>/hero.png` for the main hero
- `../img/blog-generated/<slug>/story-N.png` in each story section

### FLUX LoRA training (fal.ai)

Script: `tools/train_flux_lora_fal.py`

Trains a FLUX LoRA on fal.ai using **flux-lora-fast-training** (~10x faster, ~$2/run).

```bash
pip install fal-client
export FAL_KEY="your-fal-key"

# Dataset: LoRA Training Folder/LoRA-Training-Individual-clean.zip (default)
python tools/train_flux_lora_fal.py

# Custom dataset or steps
python tools/train_flux_lora_fal.py --dataset path/to/dataset.zip --steps 1500 --output my_lora.safetensors
```

Settings: trigger word `julie_mv`, 1000 steps (default). Use `tools/fetch_fal_lora_result.py` to download results from a completed job.

### Security notes

- `HF_TOKEN` is used only on server/API routes.
- No Hugging Face calls from frontend/browser code.
- Do not commit secrets to git.
