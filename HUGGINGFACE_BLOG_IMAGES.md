# Hugging Face Images for Weekly Blog

This lets us generate:
- 1 hero image for the weekly post
- 1 image per story section

All outputs are saved under:
- `img/blog-generated/<slug>/`

---

## 1) Create Hugging Face token

1. Sign in to [Hugging Face](https://huggingface.co/).
2. Go to **Settings -> Access Tokens**.
3. Create a token with inference permissions.

In Terminal:

```bash
export HF_TOKEN="your_token_here"
```

(Add this to your shell profile if you want it permanent.)

---

## 2) Generate images for a weekly post

Run from project root:

```bash
python3 tools/generate_blog_images.py \
  --slug weekly-insurance-update-2026-03-08 \
  --week-label "March 8, 2026" \
  --story "California wildfire insurance reforms in 2026" \
  --story "Health insurance tax credit expiration impact on families" \
  --story "Medicare Advantage prior authorization timeline reforms" \
  --story "Meta coverage ruling and liability policy implications" \
  --story "AI-powered insurance fraud and carrier countermeasures"
```

Generated files:
- `img/blog-generated/weekly-insurance-update-2026-03-08/hero.png`
- `img/blog-generated/weekly-insurance-update-2026-03-08/story-1.png`
- `img/blog-generated/weekly-insurance-update-2026-03-08/story-2.png`
- ...

---

## 3) Use images in blog HTML

Blog pages live in `/blog/`, so paths should usually be:

- `../img/blog-generated/<slug>/hero.png`
- `../img/blog-generated/<slug>/story-1.png`

---

## Notes

- Default model: `stabilityai/stable-diffusion-xl-base-1.0`
- You can pass `--model <model-id>` to test alternatives.
- Prompts are optimized for clean editorial images with no text/logo overlays.
- Always review generated images for quality and relevance before publishing.
