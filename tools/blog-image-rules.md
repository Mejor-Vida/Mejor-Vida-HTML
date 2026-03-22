# Narrative Editorial Image Strategy

Art direction rules for blog image generation. Used by `generate_blog_images.py` when creating Fal.ai prompts. Target: Human-centric, narrative-driven, high-end professional magazine aesthetic.

---

## 1. Mandatory Demographic Consistency

**Requirement:** All people featured in any generated images must be Hispanic/Latino.

Ensure a natural variety of features, ages, and professional attire appropriate for a high-level business context.

---

## 2. From "Backgrounds" to "Narrative Events"

We are moving away from empty architectural shots. **Every image must depict a Story or Event** related to the article's theme, even if the connection is metaphorical.

**Avoid:** Empty rooms, static buildings, or "stock" office poses.

**Embrace:** "Active Metaphors." If an article is about Security, show a Hispanic professional inspecting a high-tech holographic shield. If it's about Growth, show a Hispanic gardener in a futuristic vertical farm.

### The "Event" Rule

Something should be **happening**. A hand reaching for a goal, a person navigating a complex path, or a group engaged in intense (but not "sitting at a table") collaboration.

---

## 3. The "Human Element" Quota (Revised)

### The Hero Image

**Must feature a Hispanic person** in a dramatic, metaphorical setting.

- Examples: standing on a summit, looking through a giant lens, or interacting with a large-scale data visualization.

### The "Office" Shot

You are still limited to **exactly one** traditional office/desk scene per article, but it must:
- Feature **Hispanic professionals**
- Use **cinematic "Golden Hour" lighting** to remain high-end

---

## 4. Technical Visual Style

Every prompt sent to Fal.ai must include:

| Element | Options |
|---------|---------|
| **Subject Action** | Describe a specific movement (e.g., "A Hispanic woman confidently leading a group through a glass-walled terminal"). |
| **Perspective** | Use "Dynamic Angles" (e.g., "Low-angle hero shot" or "Wide-angle cinematic side-profile"). |
| **Lighting** | "Cinematic rim lighting," "Soft morning sun," or "Natural office glow." |
| **Style** | "Professional editorial photography, 8k, high-end magazine aesthetic." |

---

## 5. Comparison Examples (Active Metaphors)

| Theme | Instead of… | Use… |
|-------|-------------|------|
| Growth | Empty sapling in atrium | Hispanic professional gardener in a futuristic vertical farm, harvesting thriving plants, symbolizing growth. |
| Security | Abstract bridge | Hispanic professional inspecting a high-tech holographic shield, active security metaphor. |
| Digital/Tech | Prism / glass | Hispanic woman navigating a complex digital dashboard, fingers tracing data streams, clarity metaphor. |
| Final expense / Legacy | Pillar/obelisk | Hispanic couple walking hand-in-hand through a dignified memorial garden, legacy and care. |
| Living benefits | Fluid shape | Young Hispanic professional reaching toward a glowing financial horizon, adaptability metaphor. |
| Insurance / Protection | Static structure | Hispanic family walking confidently across a glass bridge over a canyon, protection metaphor. |
| Office (literal) | Generic boardroom | Hispanic professionals in a modern office, Golden Hour light through windows, collaborative moment. |

---

## Usage in `generate_blog_images.py`

- **Hero:** Hispanic person in dramatic metaphorical setting (summit, lens, data viz).
- **Stories:** One "office" shot (Hispanic professionals, Golden Hour); all others narrative events with Hispanic people in active metaphors.
- **Every prompt:** Subject action + dynamic perspective + cinematic lighting + professional editorial 8k.
