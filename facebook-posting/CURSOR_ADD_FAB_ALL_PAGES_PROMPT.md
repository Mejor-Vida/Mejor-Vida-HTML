# Cursor: Add Floating Assistant FAB to All Public Pages

## Mission
Add the Mejor Vida Assistant floating FAB (bottom-right) to **every public page** on the website so users can access it from anywhere.

## What to Add to Each Page

On every public HTML file, add these **three things** (they're already present on `index.html` and `quote.html` — just copy from there):

### 1. Mount Node
Add this `<div>` before the closing `</body>` tag:
```html
<div id="mvi-assistant-root" data-api-url="/api/website-chat"></div>
```

### 2. Stylesheet
Add this `<link>` in the `<head>` (or inline the styles if preferred):
```html
<style>
  /* Mejor Vida Assistant Floating Widget */
  .mvi-assist-fab {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a365d, #2c5282);
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mvi-assist-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .mvi-assist-fab:active {
    transform: scale(0.95);
  }

  .mvi-assist-panel {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 350px;
    max-height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
    display: flex;
    flex-direction: column;
    z-index: 9998;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mvi-assist-header {
    background: linear-gradient(135deg, #1a365d, #2c5282);
    color: white;
    padding: 16px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mvi-assist-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .mvi-assist-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mvi-assist-lang-toggle {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 8px;
  }

  .mvi-assist-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mvi-assist-message {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .mvi-assist-message.user {
    justify-content: flex-end;
  }

  .mvi-assist-message.assistant {
    justify-content: flex-start;
  }

  .mvi-assist-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .mvi-assist-message.user .mvi-assist-bubble {
    background: #2c5282;
    color: white;
  }

  .mvi-assist-message.assistant .mvi-assist-bubble {
    background: #f0f0f0;
    color: #333;
  }

  .mvi-assist-typing {
    display: flex;
    gap: 4px;
    padding: 10px 14px;
  }

  .mvi-assist-typing span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #999;
    animation: typing 1.4s infinite;
  }

  .mvi-assist-typing span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .mvi-assist-typing span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-10px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mvi-assist-typing span {
      animation: none;
      opacity: 1;
    }
  }

  .mvi-assist-input-area {
    padding: 12px 16px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 8px;
  }

  .mvi-assist-input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    font-family: inherit;
  }

  .mvi-assist-input:focus {
    outline: none;
    border-color: #2c5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }

  .mvi-assist-send {
    background: #2c5282;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
  }

  .mvi-assist-send:hover {
    background: #1a365d;
  }

  .mvi-assist-send:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .mvi-assist-suggested {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mvi-assist-suggested-chip {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 20px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    text-align: center;
    transition: all 0.2s;
  }

  .mvi-assist-suggested-chip:hover {
    background: #2c5282;
    color: white;
    border-color: #2c5282;
  }

  .mvi-assist-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    text-align: center;
    color: #666;
  }

  .mvi-assist-empty h4 {
    margin: 0 0 8px 0;
    color: #333;
  }

  .mvi-assist-empty p {
    margin: 0;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    .mvi-assist-panel {
      width: calc(100vw - 40px);
      max-height: calc(100vh - 120px);
    }
  }

  @media (prefers-color-scheme: dark) {
    .mvi-assist-panel {
      background: #1e1e1e;
    }

    .mvi-assist-messages {
      background: #1e1e1e;
    }

    .mvi-assist-message.assistant .mvi-assist-bubble {
      background: #333;
      color: #e0e0e0;
    }

    .mvi-assist-input {
      background: #2a2a2a;
      color: #e0e0e0;
      border-color: #444;
    }

    .mvi-assist-suggested-chip {
      background: #2a2a2a;
      border-color: #444;
      color: #e0e0e0;
    }
  }
</style>
```

### 3. Script
Add this `<script>` before the closing `</body>` tag:
```html
<script src="js/website-assistant-widget.js" defer></script>
```

## Files to Update

Find and update **all public HTML files** in the repo. This likely includes:

- ✅ `index.html` (already done)
- ✅ `quote.html` (already done)
- [ ] `quote-screen.html`
- [ ] `blog.html` (if exists)
- [ ] `faq.html` (if exists)
- [ ] `about.html` (if exists)
- [ ] `contact.html` (if exists)
- [ ] Any other public pages (not admin, not API docs, just user-facing)

**Don't add to:**
- API endpoint files
- Admin pages
- Documentation pages
- Error pages (404, 500, etc.)

## Implementation Instructions

1. **For each public page:**
   - Locate the closing `</body>` tag
   - Add the mount node `<div id="mvi-assistant-root"...></div>` before it
   - Add the stylesheet (in `<head>` or inline before `</body>`)
   - Add the script reference before `</body>`

2. **Copy-paste method:** Look at `index.html` or `quote.html` for the exact placement, then copy the same block to other pages.

3. **No changes needed to:** `js/website-assistant-widget.js` or any other JS files — it's already complete.

## Verification

After updating all pages:

- [ ] Run `grep -r "mvi-assistant-root" mnt/Mejor-Vida-HTML/` and confirm it appears in every public HTML file
- [ ] Load each updated page in browser (or check for console errors)
- [ ] FAB appears in bottom-right corner on all pages
- [ ] FAB is clickable and opens/closes properly
- [ ] No 404 errors for `js/website-assistant-widget.js`

## Notes

- The styles can be inlined (in `<style>` tags) or in a separate CSS file — either way works
- If the site uses a CSS framework (Tailwind, Bootstrap), you could refactor these to class-based styles later
- The FAB z-index is 9999 and 9998 (panel), so it will float above almost everything
- All functionality is already in `js/website-assistant-widget.js` — this is just mounting it on more pages

Let me know once all pages are updated! 🚀
