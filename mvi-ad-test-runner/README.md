# MVI Ad Test Runner

Local web app for **Mejor Vida Insurance** to stage Facebook ad tests: **hook rounds** (same layout, different headlines), then **image/template rounds** that lock the winning hook and vary creative.

## Features

- **Import** Claude Design “standalone bundler” HTML, parse `const HEADLINES = [...]`, copy file into `data/imports/inbox/`.
- **Export** five **1080×1080 PNGs** via Playwright (patches `DISPLAY` to 1080, screenshots each `Ad N ·` artboard card).
- **Projects / rounds / variants** in SQLite (Prisma 5).
- **Meta Marketing API** behind a **dry-run** service layer; real Graph calls are TODO where noted in `src/lib/facebook/metaMarketingService.ts`.
- **Scoring**: primary metric per round + optional weighted score; **auto winner** from stored metrics.
- **Next round from winner** clones setup and branches the round tree.

## Requirements

- Node **18+**
- npm

## Setup

```bash
cd mvi-ad-test-runner
cp .env.example .env.local
# Set DATABASE_URL — default in .env.example is:
# DATABASE_URL="file:./data/mvi.sqlite"
```

Apply migrations, generate Prisma client, install Chromium (one command):

```bash
npm run setup:local
```

Or step by step: `npx prisma migrate dev` then `npm run playwright:install`.

In VS Code / Cursor: **Tasks → Run Task → “MVI Ad Test Runner: dev server”** (or migrate / backfill tasks).

Optional: copy your standalone HTML to `data/sample/Facebook_Ads_standalone.html` and seed:

```bash
npm run db:seed
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Projects** → import HTML → **Create hook test round** → open the round → **Export PNGs** → **Queue Meta dry-run**.

## Data layout

- Database: `data/mvi.sqlite` (gitignored)
- Imports: `data/imports/inbox/` — **full** bundled file (all hooks in one document); this is the archive copy, not “split.”
- Per round: `data/projects/{projectId}/rounds/{roundId}/assets/`
  - `source/original.html` — same full bundle, used for PNG export
  - `split/hook1_*.html` … `hook5_*.html` — **one standalone HTML per hook** (`HEADLINES` reduced to a single row)
  - exported PNGs next to `split/`

Creating a **hook test round** writes the `split/` files automatically. For older rounds, open the round and click **Generate split HTML (5 files)**.

Split HTML re-embeds the template with `<` escaped as `\u003c` inside JSON so `</script>` in the creative markup cannot break the page (same idea as the Claude export). If split files ever show **Unterminated string in JSON**, regenerate with **Generate split HTML** or `npm run split-html:backfill`.

## Environment variables

See `.env.example`. **Never commit secrets.**

- `DATABASE_URL` — SQLite file path
- `MVI_DATA_DIR` — optional override for all `data/` paths
- `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_APP_ID`, etc. — optional; leave unset for dry-run only
- `MVI_ALLOW_LIVE_META` — set to `false` to block live calls even if tokens exist

## Parser notes

The standalone file contains:

1. `script[type="__bundler/manifest"]` — base64 assets  
2. `script[type="__bundler/template"]` — JSON string of the page HTML  
3. Inline Babel with `const HEADLINES = [ ... ]` — **five** rows (`id`, `label`, `text`, `size`, optional `hideSinExamen`)

The parser uses bracket-matching (not brittle regex on the whole file) and `new Function` **only** to evaluate the `HEADLINES` array literal (unquoted keys), matching the Claude export format.

## Meta API (future)

Implement TODOs in `metaMarketingService.ts` using your Marketing API version (e.g. `v22.0`). You will need:

- Ad account ID `act_…`
- App + token with `ads_management` (and related) scopes  
- Respect Meta’s creative specs; this app validates **square** PNGs and warns on non-1080 sizes.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Prisma migrate |
| `npm run db:seed` | Seed sample project if sample HTML exists |
| `npm run playwright:install` | Download Chromium for exports |

## License

Private — Mejor Vida Insurance internal use.
