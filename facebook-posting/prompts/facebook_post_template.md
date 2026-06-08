# Facebook Post Template — Mejor Vida Insurance

Authoring guide. **Canonical rules:** `facebook-post-rules.md` at the repository root.

---

## Required structure

1. **Hook** — 1–2 lines; scroll-stopping; personal or curiosity-based. **Do not** open like a newsletter (“Esta semana…”, “En este artículo…”, “Nuevo blog…”).
2. **Value / meat** — 2–4 short points; plain Spanish; real-life “why it matters”; bullets or short lines for mobile.
3. **Trust line** — Helpful, not pushy (e.g. no venderte algo que no necesitas).
4. **CTA** — Prefer **dual keywords:** **INFO** (artículo / educación) y **REVISAR** (revisar situación). Offer **mensaje directo** for people who won’t comment publicly.
5. **Hashtags** — 3–5 máximo; ver lista en `facebook-post-rules.md`.

---

## No link in the main caption

- **Do not** put the blog URL in the **main post text** (mejor alcance orgánico; evita “salida” inmediata).
- The **blog link** va en el **primer comentario**, junto con un **enlace de WhatsApp** opcional (texto + URL clicable; no hay botones HTML en comentarios de Facebook).
- Plantilla: `warm_first_comment` en `scripts/facebook_post_package.py` (tono cálido + párrafo adaptable al post + enlace al sitio web). WhatsApp: `whatsapp_first_comment_url` en `config/settings.json` o `MVS_WHATSAPP_FIRST_COMMENT_URL`.

---

## Deliverables (each weekly post)

El generador produce un **paquete** (`FacebookPostPackage`):

| Campo | Uso |
|--------|-----|
| `main_caption` | Texto del post principal (sin URL) |
| `first_comment` | Primer comentario con enlace al artículo |
| `alternate_caption` | Versión más corta |
| `image_prompt` | Idea / prompt para la imagen |
| `manychat_keywords` | INFO, REVISAR (u otros según reglas) |
| `pinned_comment` | Opcional |

Salida en disco: `FB/post-package.json` junto a la vista previa HTML.

---

## Tone and compliance

- Natural Spanish; ~6th–8th grade reading level; warm, human.
- **No** emojis unless requested.
- **No** promesas de cobertura, precio o aprobación; contenido educativo.
- Evitar jerga de industria (NAIC, LIMRA, etc.) salvo que haga falta y con explicación simple.

---

## Integración técnica

- Lógica por defecto: `facebook-posting/scripts/generate_facebook_post.py` (`build_facebook_post_package`).
- Vista previa: `FB/post-preview.html` (incluye post principal + primer comentario + alternativas).
- Publicación: `publish_post_package()` publica el post principal y, por defecto, llama al webhook de Make.com con `post_id` + `first_comment` (Make espera ~10 min). Opción `--no-first-comment` para omitir; `--first-comment-graph-api` para publicar el comentario vía Graph API.
