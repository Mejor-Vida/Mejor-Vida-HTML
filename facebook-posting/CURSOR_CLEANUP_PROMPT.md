# Cursor Cleanup & Consolidation Prompt

## Mission
Remove the old embedded Julie chatbot widget (`website-chatbot.js` and related code) and make the **new floating Assistant FAB** the single chatbot experience site-wide.

## What to Remove

### 1. Delete Files
- `js/website-chatbot.js` — Old embedded Julie widget
- Any related old widget CSS files (if separate from main `styles/main.css`)
- `lib/chatbot-utils.js` or similar (if exists) — utility functions only used by old widget

### 2. Remove from HTML Files
In **both** `index.html` and `quote.html`:
- Remove: `<div id="chatbot-widget-root"></div>` (the old mount point)
- Remove: `<script src="js/website-chatbot.js"></script>` (old widget script)
- Remove: Any CSS classes like `.chatbot-widget-*` that are only for the old widget
- Keep: Everything related to `.mvi-assist-*` (new floating widget)

### 3. Clean Up CSS
In `styles/main.css` or wherever styles live:
- Remove all CSS rules for `.chatbot-widget-*` (old widget)
- Remove all CSS rules for `#chatbot-widget-root` (old widget container)
- Keep: All `.mvi-assist-*` styles (new widget is good to go)
- Keep: All other site styles

### 4. Clean Up JavaScript
- Remove any event listeners or initialization code that references the old widget
- Remove any utility functions in `lib/` that were **only** used by the old widget
- Keep: `js/website-assistant-widget.js` and all utilities it uses

## What to Keep (Don't Touch)

- ✅ `js/website-assistant-widget.js` — The new floating FAB widget
- ✅ `.mvi-assist-*` CSS classes in `styles/main.css`
- ✅ `<div id="mvi-assistant-root" data-api-url="/api/website-chat"></div>` mount node
- ✅ `<script src="js/website-assistant-widget.js" defer></script>` on both pages
- ✅ All other site CSS and JS unrelated to the old chatbot

## Pages to Update

1. **`index.html`** — Remove old widget mount + script
2. **`quote.html`** — Remove old widget mount + script
3. Any other pages that have the old widget

## Files to Create / Modify

None — just cleanup. The new widget is already complete and ready.

## Testing After Cleanup

- [ ] `index.html` loads without errors (check browser console)
- [ ] Floating FAB appears in bottom-right corner
- [ ] FAB is clickable and opens/closes the chat panel
- [ ] Chat panel has suggested questions, typing indicator, message display
- [ ] No console errors or 404s for missing `website-chatbot.js`
- [ ] `quote.html` loads without errors and shows FAB
- [ ] Mobile-responsive: FAB and panel work on 375px width
- [ ] Dark mode still works if you have `prefers-color-scheme: dark`

## Verification Checklist

After cleanup:
- [ ] No references to `website-chatbot.js` remain in HTML files
- [ ] No references to `#chatbot-widget-root` remain in HTML files
- [ ] No orphaned CSS classes for old widget (search for `.chatbot-widget` in CSS)
- [ ] `website-assistant-widget.js` is the only chatbot JS file active
- [ ] Site works the same, just cleaner and simpler

## Notes

- The new floating FAB widget (`website-assistant-widget.js`) is fully functional and ready
- It will call `/api/website-chat` (Claude builds this at 7pm ET)
- No new code needed, just removal of old code
- This consolidation makes the codebase cleaner and easier to maintain

---

## Summary

**Before:** Old embedded Julie widget + new floating FAB (two chat experiences)
**After:** Only new floating FAB (one clean chat experience site-wide)

Let me know once cleanup is done! 🧹
