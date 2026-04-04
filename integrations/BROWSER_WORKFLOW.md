# MVS Agent — Browser Workflow (Playwright + APIs + Screenshots)

Technical reference for the MVS agent when navigating web apps and completing tasks with Playwright, HTTP APIs, and vision-based screenshots.

---

## 1. Tool Selection Decision Tree

```
User request received
       │
       ▼
┌──────────────────────────────────────┐
│ Can this be done via API or script?   │
└──────────────────────────────────────┘
       │
       ├── YES (Make, ManyChat, HubSpot API)
       │         → Use API / run script first
       │         → Fastest, no browser needed
       │
       └── NO (Make.com scenario builder UI, unknown admin UI)
                 → Use Playwright + Screenshots
```

| Task | Preferred Tool | Fallback |
|------|----------------|----------|
| CRM / contacts / deals | HubSpot REST API | HubSpot UI if no API for the task |
| Create/edit Make.com scenario | Playwright + screenshots | Make.com API (limited) |
| Get ManyChat contacts/flows | ManyChat API | N/A |
| File import UI (e.g. Integrity Connect CSV) | Playwright + `setInputFiles` | N/A |

---

## 2. Screenshot Loop (Vision-Driven Navigation)

When the browser is needed, use a **see → think → act** cycle:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  NAVIGATE   │ ──► │  SCREENSHOT │ ──► │   ANALYZE   │
└─────────────┘     └─────────────┘     └─────────────┘
                                                  │
                                                  ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    DONE?    │ ◄── │    ACT      │ ◄── │   DECIDE    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │
       │ Yes                │ No: repeat from SCREENSHOT
       ▼
   Report result
```

### Steps

1. **Navigate** — `page.goto(url)` or click a link to reach the target page.
2. **Screenshot** — Capture the page. Use the image to see layout, buttons, forms.
3. **Analyze** — From the screenshot, identify: what to click, what to type, where the file input is.
4. **Act** — Execute one or more Playwright actions.
5. **Screenshot again** — Confirm the page state changed as expected.
6. **Loop or finish** — If more steps needed, repeat from step 2. Otherwise, report success.

### Why Screenshots

- UI changes; selectors break. Screenshots show the real state.
- Vision models can infer intent (e.g. "Import" button) without brittle CSS paths.
- After each action, a new screenshot verifies the outcome before the next step.

---

## 3. Playwright Snippets

### File upload (generic admin / import UI)

```python
# csv_path = path to your CSV file
page.locator('input[type="file"]').set_input_files(csv_path)
# Or if drop zone is custom:
page.get_by_label(re.compile("drop|upload|import|file", re.I)).set_input_files(csv_path)
# Screenshot to confirm file attached, then click Import/Submit
```

### Click by visible text (fallback when selector fails)

```python
page.get_by_role("button", name=re.compile("import|submit", re.I)).click()
page.get_by_text("Import").click()
page.get_by_label("Import").click()
```

### Wait for navigation

```python
page.wait_for_load_state("networkidle")  # or "domcontentloaded"
```

---

## 4. API Endpoints (Use When Available)

| Service | Endpoint / Script | Auth |
|---------|-------------------|------|
| Make.com | `https://api.make.com/v2/...` | `MAKE_API_TOKEN` |
| ManyChat | `https://api.manychat.com/...` | `MANYCHAT_API_KEY` |
| HubSpot | `https://api.hubapi.com/...` | `HUBSPOT_ACCESS_TOKEN` |

See `AGENT_ACCESS.md` for details.

---

## 5. Failure Escalation

| Failure | Try | Then |
|---------|-----|------|
| Selector not found | Screenshot; try `getByRole`, `getByText`, `getByLabel` | Try different selector 2–3 times |
| 404 on direct URL | Don't guess paths; click from dashboard | Navigate via UI only |
| Timeout | Increase wait; retry once | Report and ask user |
| File upload blocked | Check for overlay; try hidden `input[type="file"]` | Retry with different selector |
| Browser unavailable | Use API or script only | Report limitation |

---

## 6. Context Awareness

Screenshots use significant context. Long browser sessions may trigger compaction sooner. See `.cursor/rules/context-compaction.mdc` for behavior when context limits are reached.

---

## 7. Related Files

- `integrations/AGENT_ACCESS.md` — Data sources and access methods
- `.cursor/rules/browser-workflow.mdc` — Agent rule (summary)
