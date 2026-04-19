# Level 1 animated website chat avatar (FREE, self-hosted)

## 1. Architecture recommendation

- **Rendering:** stacked PNG layers in a `<figure>`, one visible at a time (`opacity` + CSS transition). No canvas, no Rive, no paid hosts.
- **Motion:** CSS keyframes on a wrapper “shell” (breathing, sway, hover perk, attention pulse, thinking tilt, happy nod). `prefers-reduced-motion` respected.
- **Lifecycle:** `website-assistant-widget.js` owns the DOM and dispatches **`mvi-assistant-hook`** on `#mvi-assistant-root`. `mvi-chat-avatar.js` listens and drives expression + timers (blink, attention).
- **Placement:** One physical avatar subtree (`[data-mvi-avatar-shell]`). When the panel opens, the shell is **moved** into the header host (`[data-mvi-avatar-host-open]`); when closed, it returns beside the FAB. The **FAB stays fixed** on the page.

## 2. Chosen approach: **A — full-image swapping**

**Why not layered parts (B)?**  
Layered rigs need pixel-perfect alignment for eyes/mouth/ brows on every export, more files, and more failure modes when regenerating with fal.ai. For Level 1, **5 full-body (or bust) PNGs** with identical framing swap cleanly with a 0.35s crossfade and optional CSS motion on the wrapper—easier to generate, QA, and replace.

**When to consider B later:** micro-expressions, lip sync, or eye-only blinks without swapping the whole body (Phase 2).

## 3. Asset list

### Minimum viable (ship Level 1)

| File | Role |
|------|------|
| `idle.png` | Default / neutral |
| `blink.png` | Eyes closed (~1 frame), same pose as idle |
| `happy.png` | Warm smile after a good reply |
| `thinking.png` | Slight concern / hand near chin or gaze up—still professional |
| `attention.png` | “Perked up” — shoulders slightly raised, brighter eyes (optional; falls back to idle via CSS if same as idle) |

All: **transparent PNG**, same **pixel dimensions**, same **scale** and **camera**, **bottom-aligned** in frame (feet baseline consistent).

### Recommended polished pack (same specs + extras)

| File | Role |
|------|------|
| `hover.png` | Optional; can reuse idle + CSS hover only |
| `error.png` | Gentle empathetic face after `replied` with `ok: false` (not wired by default; easy to add) |
| `speaking.png` | If you add TTS later—mouth slightly more open |

## 4. fal.ai / image prompts (copy-paste)

Use the **same reference image** every run (your neutral Julie). Append: “exact same character, clothing, proportions, 3D style, camera angle, framing, full body vertical composition, transparent background, PNG, no text, no watermark.”

**idle.png**  
“Neutral professional smile, relaxed posture, full body, front camera, studio soft light, transparent background, match reference character exactly.”

**blink.png**  
“Identical pose and framing as reference; eyes fully closed; natural blink; same outfit and scale; transparent background.”

**happy.png**  
“Slightly warmer, confident smile—helpful agent energy; same pose, outfit, camera, scale as reference; transparent background.”

**thinking.png**  
“Subtle thoughtful expression: eyes slightly up or to the side, mild brow furrow, professional not cartoonish; same full-body framing and outfit as reference; transparent background.”

**attention.png**  
“Alert, ‘I’m here to help’ energy: slightly more open eyes, subtle forward lean, shoulders relaxed not tense; same character, outfit, camera, scale; transparent background.”

**QA checklist:** overlay idle + thinking in an image editor—faces and feet should align; if not, re-roll with “lock head position to reference” or reduce pose change.

## 5. File / folder structure

```
css/mvi-chat-avatar.css          # Avatar + launcher layout + keyframes
js/mvi-chat-avatar.js            # Layers, blink/attention timers, hook listener
js/website-assistant-widget.js   # Launcher markup, reparent shell, emits hooks
img/mvi-chat-avatar/
  idle.png
  happy.png
  thinking.png
  attention.png
  blink.png
website-avatar/LEVEL1_AVATAR_SYSTEM.md   # This doc
```

**Naming:** lowercase, `state.png`. Overrides on root: `data-mvi-avatar-idle`, `data-mvi-avatar-happy`, etc.

## 6. Event hooks (for other integrations)

Dispatched on **`#mvi-assistant-root`**, non-bubbling:

| `detail.hook` | `detail` | When |
|---------------|----------|------|
| `panel` | `{ open: boolean }` | Chat opened or closed |
| `thinking` | `{}` | After user sends; before reply |
| `replied` | `{ ok: boolean }` | After response (HTTP ok / error path) |

Listen:

```js
document.getElementById('mvi-assistant-root').addEventListener('mvi-assistant-hook', (e) => {
  console.log(e.detail);
});
```

## 7. Integration instructions

1. **Assets:** Put PNGs in `img/mvi-chat-avatar/` (or point `data-mvi-avatar-base` elsewhere).
2. **HTML:** On pages that already have `#mvi-assistant-root`, add:
   - `<link href="css/mvi-chat-avatar.css" rel="stylesheet" />` (after `mvi-assistant-widget.css`).
   - `data-mvi-avatar-base="img/mvi-chat-avatar"` on the root div (optional if default).
3. **JS:** After `website-assistant-widget.js`, load `mvi-chat-avatar.js` (both `defer` is fine; order matters: widget first, avatar second).
4. **Disable avatar:** `data-mvi-avatar-disabled="1"` on `#mvi-assistant-root`.
5. **Debug overlay:** `data-mvi-avatar-debug="1"` — shows `panelOpen`, `botPhase`, active layer, and reduced-motion live.
6. **Broken images:** optional `data-mvi-avatar-fallback="…/idle.png"` after idle + per-layer fallback to a 1×1 transparent GIF.

**Per-URL overrides (optional):**

```html
<div
  id="mvi-assistant-root"
  data-api-url="/api/website-chat"
  data-mvi-avatar-base="img/mvi-chat-avatar"
  data-mvi-avatar-idle="img/mvi-chat-avatar/idle.png"
  data-mvi-avatar-thinking="img/mvi-chat-avatar/thinking.png"
></div>
```

## 8. Future improvements (Phase 2)

- **Crossfade blending:** duplicate `<img>` crossfade queue or short CSS `@starting-style` / `view-transition` where supported.
- **Sprite sheet:** one PNG + `background-position` steps; fewer HTTP requests; tooling to slice.
- **Layered mouth/eyes:** 2–3 small layers only for blink/talk; body stays one static PNG.
- **Sound-reactive:** Web Audio `AnalyserNode` drives `transform: scaleY()` on mouth layer when you add voice.
- **More states:** `error`, `speaking`, `away` (tab hidden), tied to same hook pattern.
- **error.png:** wire `onRepliedHook(false)` to a dedicated asset instead of idle-only.

---

*Implemented in-repo: see `css/mvi-chat-avatar.css`, `js/mvi-chat-avatar.js`, and launcher/header changes in `js/website-assistant-widget.js`.*
