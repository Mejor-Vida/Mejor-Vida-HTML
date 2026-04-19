# Local browser agent (Python + browser-use + Streamlit)

Small local app: describe a browser task in plain English, generate a short plan, run it with a **visible Chromium window**, and see **live step logs** plus a **final result** in the UI.

## Prerequisites

- Python **3.11 or newer** (required by `browser-use`; **macOS’s default `python3` is often 3.9 and will not work**)
- macOS / Linux / Windows with a display (for a visible browser)
- An LLM API key (OpenAI, Browser Use, Anthropic, or Google — see `.env.example`)

Check your version:

```bash
python3 --version
```

If it is below 3.11, install a newer Python (e.g. [python.org](https://www.python.org/downloads/) or `brew install python@3.12`), then use **that** interpreter to create the venv (example uses `python3.12` if installed):

```bash
cd local-browser-agent
python3.12 -m venv .venv
source .venv/bin/activate
python verify_setup.py
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
# Edit .env: at minimum set OPENAI_API_KEY and LLM_PROVIDER=openai (or another provider).
# You can also keep keys only in the repo root `.env.local` (parent of this folder) — the app loads that too.
```

If you already created `.venv` with Python 3.9, delete it and recreate with 3.11+:

```bash
rm -rf .venv
python3.12 -m venv .venv
```

## Run

```bash
streamlit run app.py
```

Open the URL Streamlit prints (usually `http://localhost:8501`).

## How to use

1. Type a **task** (e.g. “Open example.com and return the main heading”).
2. Click **Generate plan** (needs `OPENAI_API_KEY` in `.env`) or write your own plan in the **Plan** box.
3. Click **Run task**. A **browser window** should open on your machine; the UI shows **live steps** and then a **final result**.

**Note:** Flows that need you to be logged in (Facebook, CRMs, etc.) may require you to **sign in manually** in the opened browser the first time. The agent cannot invent your passwords.

## Files

| File | Role |
|------|------|
| `app.py` | Streamlit UI |
| `runner.py` | Runs browser-use in a subprocess; step callbacks append to a shared log |
| `llm_factory.py` | Chooses `ChatOpenAI`, `ChatBrowserUse`, etc. from env |
| `planning.py` | “Generate plan” via OpenAI Chat Completions |
| `download_paths.py` | Resolves save folder (default: `~/Desktop/Browser-Use Downloads`) |
| `session_persistence.py` | Saves/restores chat memory to `.browser_agent_session.json` |
| `.env.example` | Environment template |

Downloads and agent-created files go to **`Desktop/Browser-Use Downloads`** unless you set `BROWSER_USE_DOWNLOADS` in `.env`.

### Chat memory after you quit

- Conversation history, task/plan text, continue box, last result, and continue snapshot are saved to **`local-browser-agent/.browser_agent_session.json`**. They reload when you start Streamlit again.
- Use **Clear conversation memory** to wipe both the file and the current session. The file is gitignored by default.

### Staying logged in & “remembering” context

- **Website state (cookies, logins):** Chromium uses a **persistent profile** at `Desktop/Browser-Use Downloads/chromium_profile` by default (same idea as Playwright `launch_persistent_context(user_data_dir=…)`). You do **not** paste raw Playwright code — `Browser(user_data_dir=…)` handles it.
- **Chat-style memory for the AI:** Prior user/assistant turns in this Streamlit session are **appended** and sent on the next run so the model can build on them. Use **Clear conversation memory** in the sidebar to reset.
- **Browser window closing:** Each **Run task** starts a short-lived worker process; when it finishes, the OS may still close Chromium. The important part for “don’t lose the site session” is the **saved profile folder**, which reloads on the next run.

### Pause and continue

- While a run is active, click **Pause run** in the live log. The agent stops via browser-use’s stop callback; your **Chromium profile** still holds cookies for the next run.
- Add text under **Additional instructions**, then **Continue with new instructions**. The app sends the prior task, last result, and your new text as one combined task so the model can proceed with the new information.

## Troubleshooting

- **`No matching distribution found for browser-use`:** your venv is using Python older than **3.11**. Run `verify_setup.py` after activating `.venv`, or check `ls .venv/lib/` — if you see `python3.9`, recreate the venv with `python3.12 -m venv .venv` (or another 3.11+ binary).
- **No browser window:** ensure `BROWSER_HEADLESS=false` in `.env` (default).
- **Live log not updating:** upgrade Streamlit: `pip install -U 'streamlit>=1.33'`.
- **Import / model errors:** check `LLM_PROVIDER` and the matching API keys in `.env`.
- **Playwright errors:** run `playwright install chromium` again.
