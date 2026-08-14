# MVI Agent Browser Bridge

Toggle-on Chrome extension + localhost relay so Cursor can read and drive **your already-logged-in browser** (Corebridge Connext, carrier portals, etc.).

Security defaults:
- Listens only on `127.0.0.1:9334`
- Shared local token `mvi-local-bridge`
- Extension starts **OFF** — you must flip it ON
- Turn it OFF when finished

## 1. Start the local bridge server

From the repo root:

```bash
npm run bridge:browser
```

Leave that terminal open.

## 2. Install the Chrome extension (once)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked**
4. Choose this folder:

```text
tools/agent-browser-bridge/extension
```

5. Pin **MVI Agent Browser Bridge** in the toolbar

## 3. Use it with Connext (or any portal)

1. Log into Connext as usual in Chrome  
   https://connext.corebridgefinancial.com/life/connext-portal/app/home
2. Click the extension icon → turn **Bridge ON** (badge shows `ON`), **or** use the sticky panel on the page (top-right)
3. Tell Cursor the bridge is on

**Stopping the agent while it works (important):**

| Method | How |
|--------|-----|
| Sticky panel | Blue **MVI Bridge** box stays fixed top-right on the page — click the toggle or red **OFF** |
| Keyboard kill switch | **Alt+Shift+X** = force Bridge OFF immediately (works even if Chrome stole focus from Cursor) |
| Keyboard toggle | **Alt+Shift+B** = toggle ON/OFF |
| Extension popup | Still works, but closes when you click the page — sticky panel does not |

When Bridge is OFF, the agent cannot click or navigate. You can type in Cursor again.

Cursor / you can then run:

```bash
npm run bridge:browser:status
npm run bridge:browser:cmd -- tabs
npm run bridge:browser:cmd -- active
npm run bridge:browser:cmd -- text
npm run bridge:browser:cmd -- links
npm run bridge:browser:cmd -- screenshot /tmp/connext.png
```

## Agent commands

| CLI | What it does |
|-----|----------------|
| `status` | Online + armed? Active tab URL/title |
| `tabs` | List open tabs |
| `active` | Active tab meta |
| `text` | Visible text from the page |
| `html` | HTML snapshot (truncated) |
| `links` | All links on the page |
| `eval '…'` | Run a JS expression in the page |
| `navigate <url>` | Navigate active tab |
| `click <css>` | Click a CSS selector |
| `screenshot [path]` | PNG of visible tab |

## Troubleshooting

- **status says offline** → run `npm run bridge:browser`
- **extension_disarmed** → open the popup and turn Bridge ON
- **timeout** → keep the portal tab focused; don’t sleep the laptop mid-command
- **PDF new tabs steal focus** → fixed in extension **v1.1.0** (sticky control tab + refocus after clicks). Reload the extension after pull.
- **Hard to turn Bridge OFF while agent is clicking** → fixed in extension **v1.2.0**: sticky on-page panel + **Alt+Shift+X** kill switch. Reload the extension after pull.
- After pulling extension code updates: `chrome://extensions` → Reload on MVI Agent Browser Bridge
- Restart the local server after `server.mjs` changes: stop and re-run `npm run bridge:browser`

## Notes

- Portal PDFs / UW guides are often **financial-professional only**. Store them under `integrations/knowledge/` for Julie/RAG; do not paste restricted manuals onto public marketing pages.
- This bridge is for **local agent assistance**, not remote access.
