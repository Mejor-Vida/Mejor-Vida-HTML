# Final avatar asset pack — specifications for `mvi-chat-avatar`

Use this when exporting **idle.png**, **blink.png**, **happy.png**, **thinking.png**, and **attention.png** so swaps stay stable in the widget.

---

## 1. Canvas size (all five files **identical**)

| Setting | Recommended | Acceptable range |
|--------|-------------|------------------|
| **Pixel dimensions** | **1024 × 1536 px** (2:3 portrait) | Same **width × height** for every PNG; 512×768 or 2048×3072 OK if you keep2:3 |
| **Aspect ratio** | **2 : 3** (width : height) | Do **not** mix ratios across files |
| **Resolution** | 72 or 144 DPI for web (DPI metadata does not matter to browsers) | — |
| **Color** | **sRGB** | Export as sRGB |

**Rule:** Every file must be the **same pixel width and same pixel height**. The code scales the whole stack inside a fixed CSS box; mismatched canvas sizes are the #1 cause of “jumping.”

---

## 2. Alignment (character in frame)

| Rule | Detail |
|------|--------|
| **Horizontal** | Character’s **midline** (nose ↔ belt buckle) centered on the canvas **horizontal center** |
| **Vertical anchor** | **Feet** sit on a single imaginary **baseline** — use the **same baseline** in all five images |
| **Scale** | **Full-body visible** (or same crop from head to feet). **Head-to-toe scale must match** across all five (no zoom in/out between states) |

**Practical method:** In your editor, place a **horizontal guide** at the foot contact line and a **vertical guide** at mid-body. Lock these for every export.

---

## 3. Bottom padding (“toe room”)

| Setting | Recommended |
|--------|-------------|
| **Padding from bottom edge of canvas to lowest point of shoes/feet** | **4%–7% of canvas height** (e.g. ~60–110 px at 1536 px height) |
| **Consistency** | **Same padding** in all five files — do not shift the feet closer to the edge in one expression |

This keeps `object-position: bottom` from clipping toes on different screens and avoids subpixel flicker at the bottom edge.

---

## 4. Transparent background

| Requirement | Detail |
|-------------|--------|
| **Format** | **PNG** with **alpha channel** |
| **Background** | **Fully transparent** — no white mat, no gradient halo |
| **Edges** | Clean silhouette; avoid heavy semi-transparent fringe (use a light matte only if needed for hair, consistent across all files) |
| **Bit depth** | 8-bit/channel RGBA is standard |

---

## 5. Naming & location

Place files next to each other (paths are configurable via `data-mvi-avatar-base`):

```
img/mvi-chat-avatar/
  idle.png
  blink.png
  happy.png
  thinking.png
  attention.png
```

| File | Role |
|------|------|
| `idle.png` | Default neutral; **master reference** for alignment |
| `blink.png` | Eyes closed; **same pose** as idle |
| `happy.png` | Warmer smile; **same stance and scale** |
| `thinking.png` | Thoughtful face; **minimal** head/body shift |
| `attention.png` | Slightly more alert; **minimal** pose shift |

Names are **lowercase**, **exact** — the loader expects these filenames unless you override with `data-mvi-avatar-idle`, etc.

---

## 6. How much **pose** change is acceptable

| State | Body / shoulders / hands | Feet |
|-------|----------------------------|------|
| **idle** | Reference | Reference |
| **blink** | **None** (only eyelids) | **No movement** |
| **happy** | **None** preferred; tiny shoulder relax allowed | **Locked** |
| **thinking** | Slight head tilt **≤ 3–4°**, optional small hand-to-chin **if** it stays inside the same bounding box | Stay on baseline |
| **attention** | Very subtle forward lean **≤ 2–3°** or slightly open posture | Stay on baseline |

**Hard rule:** Do not change **stance width**, **hip position**, or **zoom**. If anything moves, it must stay inside a **tight bounding box** drawn around the idle character (e.g. ±2% of canvas width/height).

---

## 7. How much **facial** change is acceptable

| State | Eyes | Mouth / brows |
|------|------|----------------|
| **idle** | Neutral, open | Neutral closed or soft closed-lip smile |
| **blink** | **Fully closed** | Same as idle |
| **happy** | Same openness as idle or slightly narrower (smile cheeks) | **Clear but subtle** smile — still professional |
| **thinking** | Slight upward or sideways gaze **without** moving head much | Mild furrow or raised inner brow |
| **attention** | Slightly wider / brighter | Soft “I’m listening” expression |

**Hard rule:** Same **face shape**, **hair**, **skin**, **glasses**, **jewelry**. Only **expression** changes — not age, lighting direction, or camera.

---

## 8. Keeping swaps from visually jumping (checklist)

1. **Same canvas** W×H for all files.  
2. **Same baseline** for feet and **same vertical scale** (character occupies the same % of frame height).  
3. **Same camera** — eye level, distance, focal length (no re-framing between renders).  
4. **Same lighting direction** and softness (no harsh relight on one state only).  
5. Export from a **single scene** or lock camera + rig; only blend shapes / morphs / small bone rotations.  
6. **Overlay test:** In Figma/Photoshop/Affinity, stack states at **50% opacity** over **idle** — outline of head, shoulders, and feet should **almost line up**; large drift = re-export.  
7. **Blink test:** `blink` should look like **idle with eyes shut**, not a new pose.  
8. Optional **safe frame:** Draw a rectangle around the full character in idle; all other states must stay inside it.

The widget uses **~0.22s opacity crossfade** between layers — large misalignment will read as “slide” or “pulse,” not as a clean expression change.

---

## 9. Quick creation order1. Finalize **idle.png** (master).  
2. **blink.png** — duplicate idle, close eyes only.  
3. **happy.png** — same pose, smile only.  
4. **thinking.png** — smallest head tilt + brows only if possible.  
5. **attention.png** — between idle and happy in energy; avoid big motion.

---

## 10. Reference line for AI / 3D tools (paste into prompts)

> Full-body character, **2:3 vertical canvas**, **transparent PNG**, **sRGB**. **Identical camera, distance, and framing** for every render. Character **centered horizontally**, **feet on a fixed baseline** with **~5% empty space below the shoes**. **No background.** Only **facial expression** changes between variants; **no change** to clothing, body proportions, hair, or global lighting. **No zoom** between variants.

---

*This spec matches `css/mvi-chat-avatar.css` (`object-fit: contain`, `object-position: center bottom`) and `js/mvi-chat-avatar.js` (opacity crossfade between layers).*
