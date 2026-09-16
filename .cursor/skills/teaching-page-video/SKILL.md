---
name: teaching-page-video
description: Break a Mejor Vida teaching page into a page breakdown, then an English talking-head script (approval draft), then a Spanish usted script Julie records herself. Use when making YouTube page videos, writing a page-to-script brief, or turning a website page into an instructor script. Do not start with the homepage. Do not film, cut, or upload until the Spanish script is approved. Julie records in Voice Prompter; the Staff CRM YouTube tab holds the script, upload, and cut review.
---

# Teaching-page video (page → script → Julie records)

One unique Spanish lesson per **teaching page**. Julie records herself on camera. Not HeyGen. Not Jhenny. Method: [page-to-script.md](page-to-script.md). First-draft voice: [building-style.md](building-style.md). Locked close stays in [AVATAR-JULIE-ASSISTANT.md](../../../AVATAR-JULIE-ASSISTANT.md).

Staff workspace: CRM **YouTube** tab (below To-Do). Pages list in nav order (Recursos funerarios → Seguro de vida y gastos finales → Guía de seguro de gastos finales).

## Do not run a page until named

Do not pick a URL. Do not write a homepage brief. Wait until the user names a teaching page.

Skip unless the user explicitly asks: `index.html`, ad landings, privacy/terms/SMS, thank-you, site search, weekly news digests, `sources/` mirrors, staff tools.

## Order (do not merge)

1. Read [building-style.md](building-style.md) and the locked close in the avatar file.
2. **Breakdown** from the live page + HTML. Not a script.
3. Stop. User approves or marks up the breakdown.
4. **English script** from the approved breakdown only: a standalone YouTube lesson (facts from the page, never “this page”). Write it clear the first time (class then examples, jobs before labels, full contrasts, no telegram cuts). Stop for approval.
5. Stop. Revise English until the user says it is good.
6. **Spanish usted** for Julie on camera (Mejor Vida Seguros, mejorvidaseguros.com, opening “Hola. Soy Julie de Mejor Vida Seguros.”, locked close). Stop for approval.
7. Copy the spoken Spanish into **Voice Prompter** (mic scrolls the words; commands go stop / go start / go back, or mouse/keyboard). Julie records herself.
8. Upload the take in the CRM YouTube tab. Large iPhone 4K files are shrunk in the browser to a small holding copy in `youtube-recordings` (not long-term storage). Compare transcript to the finalized script, propose cuts for retakes, present to Julie/Justin.
9. After they approve the cut: optional office background, then upload to the agency YouTube channel and embed on the matching teaching page with `.lic-lesson-video` / `mvi-lesson-yt` (same player as the earlier HeyGen lessons). `youtube-upload-video.js` then deletes the holding files.

Do not film, cut, or spend YouTube/upload steps until the current stage is accepted.

After a video is public on YouTube, Google ranking setup is `data/youtube-videos.json` + `npm run youtube:seo` (chapters, Spanish captions, Education category, educational playlist) and VideoObject + video tags in `sitemap.xml` on the matching teaching page. Do not skip captions or the playlist.

## Runtime

Typical teaching video **90–180 seconds**. After Julie likes the wording, cut extra **topics** if runtime is still long (~3–4 minutes, not 7).

Calm Spanish: about **130 spoken words per minute**.

## Output

Write the breakdown and the English script as markdown the user can edit. Spanish file only after English is accepted. Follow the templates in [page-to-script.md](page-to-script.md). The CRM YouTube tab can also draft and save these without putting them in git first.
