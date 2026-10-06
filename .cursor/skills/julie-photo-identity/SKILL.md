---
name: julie-photo-identity
description: >-
  Lock and reuse Julie Braunsroth’s photoreal identity in OpenArt. Use when
  creating a new photo of Julie, changing her pose or outfit, making a Facebook
  or website image with Julie in it, or when the user says lock Julie, Julie
  reference, same person, identity lock, body shape, or a different pose of her body.
---

# Julie photoreal identity lock

Canonical files (do **not** overwrite):

- Face: `img/julie-identity/julie-photo-lock-face.png`
- Look + white blouse: `img/julie-identity/julie-photo-lock.png`
- Body (full): `img/julie-identity/body/`
- Registry: `img/julie-identity/julie-photo-lock.json`

Approved 2026-09-11 ad face. Full-body photos lock **size and shape**. Not the cartoon lock, Pixar chatbot avatar, or HeyGen Beatriz.

## When Julie asks for a new image

1. Read `img/julie-identity/julie-photo-lock.json`.
2. **Wait for her pose/scene prompt.** Do not invent a pose, setting, or outfit.
3. Upload lock files and pass as `visualReferences`:
   - Always: **face** + **look** + **body-front**
   - If the model allows more than 3 images: also **body-front-34** and **body-side-34**
4. Generate **one** `image2image` candidate. Preferred: `grok-imagine-image-2` (max 3 refs). For a large pose change, `gpt-image-2-5-sunburst` or `nano-banana-2` (more refs). Quote credits first; spend only when she asked.
5. Prompt must include the json `bodyLock.promptBlock`. Face from the approved lock; body from the full-body set; pose/scene only what she named. Default clothes: black blazer + white blouse (body photos’ blue top is shape-only). Photoreal. No slim, no de-age, no plastic skin.
6. Save a **candidate**. Show it. Do not replace lock files. Do not put it on a page until she approves.

## Do not

- Generate extra variants or videos.
- Use a random stock woman or regenerate Julie from text alone.
- Overwrite `img/julie-identity/*`.
- Use cartoon/Pixar/HeyGen assets as the photoreal face or body lock.
