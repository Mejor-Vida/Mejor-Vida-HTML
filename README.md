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

### Security notes

- `HF_TOKEN` is used only on server/API routes.
- No Hugging Face calls from frontend/browser code.
- Do not commit secrets to git.
