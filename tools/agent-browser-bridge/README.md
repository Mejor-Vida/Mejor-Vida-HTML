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
2. Click the extension icon → turn **Bridge ON** (badge shows `ON`)
3. Tell Cursor the bridge is on

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
- **timeout** → keep the Connext tab focused; don’t sleep the laptop mid-command
- After pulling extension code updates: `chrome://extensions` → Reload on MVI Agent Browser Bridge

## Notes

- Portal PDFs / UW guides are often **financial-professional only**. Store them under `integrations/knowledge/` for Julie/RAG; do not paste restricted manuals onto public marketing pages.
- This bridge is for **local agent assistance**, not remote access.
