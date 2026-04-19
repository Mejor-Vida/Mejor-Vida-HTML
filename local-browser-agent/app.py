#!/usr/bin/env python3
"""
Local browser agent UI: one chat box (Cowork-style), live logs, one reused browser window.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import timedelta
from pathlib import Path

import streamlit as st

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from dotenv import load_dotenv

_REPO_ROOT = _ROOT.parent
load_dotenv(_REPO_ROOT / ".env")
load_dotenv(_REPO_ROOT / ".env.local")
load_dotenv(_ROOT / ".env", override=False)
load_dotenv(_ROOT / ".env.local", override=False)

from agent_worker import PAUSE_FILE, AgentWorker
from run_recap import build_run_recap_markdown
from session_persistence import clear_session_file, load_session, save_session

# Shown in sidebar when LLM_PROVIDER=openai (names must match OpenAI API model IDs).
_OPENAI_BROWSER_MODEL_PRESETS: tuple[str, ...] = (
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-4.1-mini",
    "gpt-4.1",
    "gpt-4.1-nano",
)


def _save_session_state() -> None:
    save_session(
        {
            "conversation_log": st.session_state.get("conversation_log", []),
            "last_run_snapshot": st.session_state.get("last_run_snapshot"),
            "last_error": st.session_state.get("last_error"),
            "_last_paused": st.session_state.get("_last_paused", False),
            "clarification_pending": st.session_state.get("clarification_pending", False),
            "browser_openai_model": st.session_state.get("browser_openai_model"),
            "plan_approval_pending": st.session_state.get("plan_approval_pending", False),
            "plan_approval_markdown": st.session_state.get("plan_approval_markdown") or "",
            "plan_approval_task": st.session_state.get("plan_approval_task") or "",
            "plan_requires_manual_approval": st.session_state.get("plan_requires_manual_approval", False),
            "_plan_stream_sig": st.session_state.get("_plan_stream_sig") or "",
            "_plan_stream_pos": int(st.session_state.get("_plan_stream_pos") or 0),
        }
    )


def _try_local_downloads_inventory_route(*candidates: str) -> None:
    """List real files under Browser-Use Downloads (Streamlit reads disk; no browser agent)."""
    from local_downloads_inventory import format_downloads_inventory_markdown, is_local_downloads_inventory_request

    for raw in candidates:
        t = (raw or "").strip()
        if not t or not is_local_downloads_inventory_request(t):
            continue
        with st.spinner("Reading your download folders…"):
            body = format_downloads_inventory_markdown()
        st.session_state.conversation_log.append({"role": "assistant", "content": body})
        _save_session_state()
        st.rerun()


def _try_storage_location_faq_route(*candidates: str) -> None:
    """Generic ‘where do you save?’ — real paths from config, no clarify/plan/browser."""
    from local_downloads_inventory import (
        format_storage_location_faq_markdown,
        is_storage_location_faq_request,
    )

    for raw in candidates:
        t = (raw or "").strip()
        if not t or not is_storage_location_faq_request(t):
            continue
        body = format_storage_location_faq_markdown()
        st.session_state.conversation_log.append({"role": "assistant", "content": body})
        _save_session_state()
        st.rerun()


def _try_chat_memory_route(*candidates: str) -> None:
    """If any candidate is a memory-only question, answer from transcript and rerun (no browser)."""
    from chat_memory_reply import chat_memory_reply_sync, is_chat_memory_only_question

    for raw in candidates:
        t = (raw or "").strip()
        if not t or not is_chat_memory_only_question(t, st.session_state.conversation_log):
            continue
        try:
            with st.spinner("Answering from chat history…"):
                reply = chat_memory_reply_sync(t, st.session_state.conversation_log)
        except Exception as exc:  # noqa: BLE001
            reply = f"Could not answer from chat history: {exc}"
        st.session_state.conversation_log.append({"role": "assistant", "content": reply})
        _save_session_state()
        st.rerun()


def _try_mid_session_ack_route(*candidates: str) -> None:
    """Short hello after a run/plan — contextual reply, not ‘no task yet’ and not clarify/plan."""
    from conversational_gate import (
        matches_idle_greeting_shape,
        mid_session_short_ack_reply_markdown,
        session_has_prior_activity,
    )

    for raw in candidates:
        t = (raw or "").strip()
        if not t or not matches_idle_greeting_shape(t):
            continue
        if not session_has_prior_activity(st.session_state.conversation_log):
            continue
        st.session_state.conversation_log.append(
            {"role": "assistant", "content": mid_session_short_ack_reply_markdown()}
        )
        _save_session_state()
        st.rerun()


def _try_greeting_idle_route(*candidates: str) -> None:
    """Greetings / thanks with no task — reply in chat only, do not start the browser agent."""
    from conversational_gate import greeting_idle_reply_markdown, is_greeting_or_idle_only

    for raw in candidates:
        t = (raw or "").strip()
        if not t or not is_greeting_or_idle_only(t, st.session_state.conversation_log):
            continue
        st.session_state.conversation_log.append(
            {"role": "assistant", "content": greeting_idle_reply_markdown()}
        )
        _save_session_state()
        st.rerun()


def _format_agent_step_display(raw: str) -> str:
    """Markdown for one step: Thinking vs Doing; supports legacy JSON lines."""
    raw = (raw or "").strip()
    if raw.startswith("ACTION:"):
        body = raw[7:].strip()
        return f"**Doing:** `{body}`"
    if raw.startswith("THINKING:"):
        body = raw[9:].strip()
        return f"**Thinking:** `{body}`"
    if raw.startswith("{"):
        try:
            d = json.loads(raw)
            short = d.get("next_goal") or d.get("thinking") or d.get("url") or ""
            short = str(short).replace("\n", " ").strip()[:110]
            step = d.get("step", "?")
            label = "**Doing:**" if d.get("next_goal") else "**Thinking:**"
            line = f"{label} `Step {step}: {short}`" if short else f"{label} `Step {step}`"
            return line
        except (json.JSONDecodeError, TypeError):
            pass
    body = raw if len(raw) <= 160 else raw[:157] + "…"
    return f"**Update:** `{body}`"


def _format_clarification_questions(questions: list[str]) -> str:
    qs = [q.strip() for q in questions if q.strip()][:3]
    if not qs:
        return "**Before we use the browser:** what site or action did you have in mind?"
    body = "\n".join(f"{i + 1}. {q}" for i, q in enumerate(qs))
    return f"**Before we use the browser, I need a bit more detail:**\n\n{body}"


def _format_memory_for_agent(turns: list) -> str:
    """Chat turns for the agent, plus a short tail of recent browser steps so follow-ups keep context."""
    if not turns:
        return ""
    lines: list[str] = []
    step_snips: list[str] = []
    for t in turns[-40:]:
        role = (t.get("role") or "").strip()
        content = (t.get("content") or "").strip()
        if not content:
            continue
        if role == "agent_step":
            step_snips.append(content[:180])
            continue
        if len(content) > 6000:
            content = content[:6000] + "…"
        lines.append(f"{role.upper()}: {content}")
    if not lines and not step_snips:
        return ""
    parts: list[str] = []
    if lines:
        parts.append(
            "Conversation history supplied for this run (use this to answer questions about what was said or agreed; "
            "do not claim you cannot see prior messages):\n\n" + "\n\n".join(lines)
        )
    if step_snips:
        tail = "\n".join(f"- {s}" for s in step_snips[-10:])
        parts.append(
            "Recent browser steps supplied for this run (what you already did in the browser this session):\n" + tail
        )
    return "\n\n---\n\n".join(parts)


def _approve_pending_plan_and_run(w: AgentWorker) -> None:
    task = (st.session_state.get("plan_approval_task") or "").strip()
    plan_md = (st.session_state.get("plan_approval_markdown") or "").strip()
    st.session_state.plan_approval_pending = False
    st.session_state.plan_approval_markdown = ""
    st.session_state.plan_approval_task = ""
    st.session_state.plan_requires_manual_approval = False
    _reset_plan_stream_state()
    memory = _format_memory_for_agent(st.session_state.conversation_log)
    st.session_state.awaiting_agent = True
    st.session_state._step_log_cursor = 0
    st.session_state._last_run_step_lines = []
    st.session_state._pending_task = task
    w.submit(task, memory_context=memory, plan=plan_md)
    _save_session_state()


def _cancel_pending_plan() -> None:
    st.session_state.plan_approval_pending = False
    st.session_state.plan_approval_markdown = ""
    st.session_state.plan_approval_task = ""
    st.session_state.plan_requires_manual_approval = False
    _reset_plan_stream_state()
    st.session_state.conversation_log.append(
        {
            "role": "assistant",
            "content": "## Plan cancelled\n\nSend a new message when you're ready to try again.",
        }
    )
    _save_session_state()


def _user_means_approve_plan(text: str) -> bool:
    """Chat shortcut when a draft plan is waiting (avoids discarding the plan on messages like 'approved')."""
    raw = (text or "").strip()
    if not raw or len(raw) > 160:
        return False
    low = raw.lower()
    if any(
        n in low
        for n in (
            "don't approve",
            "do not approve",
            "dont approve",
            "not approved",
            "do not run",
            "don't run",
            "dont run",
        )
    ):
        return False
    exact = (
        "approve",
        "approved",
        "approve.",
        "approved.",
        "approved!",
        "approve!",
        "go ahead",
        "run it",
        "run the plan",
        "start the browser",
        "start browser",
        "looks good",
        "lgtm",
        "confirm",
        "proceed",
        "do it",
        "execute",
        "yes",
        "y",
        "ok",
        "okay",
        "sure",
        "go",
        "run",
        "start",
    )
    sceptic = (
        "approve what",
        "what am i",
        "what are you",
        "haven't said",
        "havent said",
        "didn't say",
        "didnt say",
        "don't know what",
        "dont know what",
        "which plan",
        "not sure what",
        "what plan",
        "explain what",
        "what you're going",
        "what you are going",
    )
    if any(s in low for s in sceptic):
        return False
    if low in exact:
        return True
    return False


def _user_means_cancel_plan(text: str) -> bool:
    raw = (text or "").strip()
    if not raw or len(raw) > 120:
        return False
    low = raw.lower()
    exact = (
        "cancel",
        "cancel.",
        "no",
        "stop",
        "discard",
        "abort",
        "cancel plan",
        "never mind",
        "nevermind",
        "nope",
    )
    if low in exact:
        return True
    if low.startswith("cancel ") and len(low) < 80:
        return True
    return False


def _render_top_plan_approval_bar(w: AgentWorker) -> None:
    """High-visibility controls at the top — users often miss buttons under the streaming preview."""
    with st.container(border=True):
        st.markdown(
            "### Plan waiting for your OK\n\n"
            "**Scroll down** to read the streaming draft. Use the buttons here or in the **sidebar**, or type a **single "
            "word** in chat: `approve` / `yes` / `go` (sentences like *approve what?* are **not** treated as approval — "
            "they discard the plan). **`cancel`** drops the draft."
        )
        c1, c2 = st.columns(2)
        with c1:
            if st.button(
                "Approve & run browser",
                type="primary",
                use_container_width=True,
                key="top_strip_approve_plan",
            ):
                _approve_pending_plan_and_run(w)
                st.rerun()
        with c2:
            if st.button("Cancel plan", use_container_width=True, key="top_strip_cancel_plan"):
                _cancel_pending_plan()
                st.rerun()


def _reset_plan_stream_state() -> None:
    for k in (
        "_plan_stream_sig",
        "_plan_stream_pos",
        "_plan_stream_reveal_complete",
        "_plan_auto_submit_done",
    ):
        st.session_state.pop(k, None)
    st.session_state._plan_stream_sig = ""
    st.session_state._plan_stream_pos = 0


def _need_fragment() -> bool:
    return hasattr(st, "fragment")


st.set_page_config(page_title="Local Browser Agent", layout="wide")

if "storage_hydrated" not in st.session_state:
    st.session_state.storage_hydrated = True
    data = load_session() or {}
    st.session_state.conversation_log = list(data.get("conversation_log") or [])
    lr = data.get("last_run_snapshot")
    st.session_state.last_run_snapshot = lr if lr is not None else None
    le = data.get("last_error")
    st.session_state.last_error = le if le is not None else None
    st.session_state._last_paused = bool(data.get("_last_paused", False))
    st.session_state.clarification_pending = bool(data.get("clarification_pending", False))
    st.session_state.browser_openai_model = (
        data.get("browser_openai_model")
        or os.getenv("OPENAI_MODEL")
        or "gpt-4o-mini"
    )
    st.session_state.plan_approval_pending = bool(data.get("plan_approval_pending", False))
    st.session_state.plan_approval_markdown = str(data.get("plan_approval_markdown") or "")
    st.session_state.plan_approval_task = str(data.get("plan_approval_task") or "")
    st.session_state.plan_requires_manual_approval = bool(data.get("plan_requires_manual_approval", False))
    st.session_state._plan_stream_sig = str(data.get("_plan_stream_sig") or "")
    st.session_state._plan_stream_pos = int(data.get("_plan_stream_pos", 0))

if "plan_approval_pending" not in st.session_state:
    st.session_state.plan_approval_pending = False
if "plan_approval_markdown" not in st.session_state:
    st.session_state.plan_approval_markdown = ""
if "plan_approval_task" not in st.session_state:
    st.session_state.plan_approval_task = ""
if "plan_requires_manual_approval" not in st.session_state:
    st.session_state.plan_requires_manual_approval = False
if "_plan_stream_sig" not in st.session_state:
    st.session_state._plan_stream_sig = ""
if "_plan_stream_pos" not in st.session_state:
    st.session_state._plan_stream_pos = 0

if "awaiting_agent" not in st.session_state:
    st.session_state.awaiting_agent = False
if "_step_log_cursor" not in st.session_state:
    st.session_state._step_log_cursor = 0
if "clarification_pending" not in st.session_state:
    st.session_state.clarification_pending = False
if "_last_run_step_lines" not in st.session_state:
    st.session_state._last_run_step_lines = []
if "_pending_task" not in st.session_state:
    st.session_state._pending_task = ""

worker = AgentWorker.instance()
busy = worker.is_running() or st.session_state.awaiting_agent

with st.sidebar:
    st.subheader("API keys")
    if os.getenv("OPENAI_API_KEY"):
        st.caption("OPENAI_API_KEY: set")
    else:
        st.warning(
            "OPENAI_API_KEY is not set. Add it to the repo root `.env.local` "
            "(or `local-browser-agent/.env`), then restart Streamlit."
        )
    st.caption(f"LLM_PROVIDER: {os.getenv('LLM_PROVIDER') or 'openai'}")
    if (os.getenv("LLM_PROVIDER") or "openai").strip().lower() == "openai":
        st.subheader("Browser agent model")
        st.caption("Mini is cheaper; full gpt-4o can be better on dense or tricky pages.")
        cur = st.session_state.get("browser_openai_model") or os.getenv("OPENAI_MODEL") or "gpt-4o-mini"
        opts = list(_OPENAI_BROWSER_MODEL_PRESETS)
        if cur not in opts:
            opts = [cur] + opts
        st.selectbox(
            "OpenAI model",
            opts,
            index=opts.index(cur),
            key="browser_openai_model",
            help="Applies to the next browser-agent run. Also saved in the session file.",
        )
        os.environ["OPENAI_MODEL"] = str(st.session_state.browser_openai_model)
    if st.button(
        "Clear conversation memory",
        help="Clears saved chat history from disk and this session.",
    ):
        st.session_state.conversation_log = []
        st.session_state.last_run_snapshot = None
        st.session_state.last_error = None
        st.session_state._last_paused = False
        st.session_state.awaiting_agent = False
        st.session_state._step_log_cursor = 0
        st.session_state.clarification_pending = False
        st.session_state._last_run_step_lines = []
        st.session_state._pending_task = ""
        st.session_state.plan_approval_pending = False
        st.session_state.plan_approval_markdown = ""
        st.session_state.plan_approval_task = ""
        st.session_state.plan_requires_manual_approval = False
        _reset_plan_stream_state()
        clear_session_file()
        st.rerun()

    st.subheader("Plan preview")
    if st.session_state.get("plan_approval_pending") and st.session_state.get("plan_requires_manual_approval"):
        st.caption(
            "Risky plans need your OK: use **Approve plan** below, or type **approve** / **yes** / **go ahead** "
            "in the chat (typing anything else still **discards** the draft)."
        )
        if st.button("Approve plan (chat also works: type approve)", type="primary", key="sidebar_approve_plan"):
            _approve_pending_plan_and_run(worker)
            _save_session_state()
            st.rerun()
        if st.button("Cancel plan", key="sidebar_cancel_plan"):
            _cancel_pending_plan()
            _save_session_state()
            st.rerun()
    elif st.session_state.get("plan_approval_pending"):
        st.caption(
            "The plan **streams** above. Low-risk runs start on their own; use `FORCE_PLAN_APPROVAL=true` to always confirm."
        )
    else:
        st.caption(
            "Read-only tasks often **auto-start** after the preview; risky steps ask for **Approve** "
            "(unless `SKIP_PLAN_APPROVAL=true` or `SKIP_PLAN_RISK_GATE=true`)."
        )

st.title("Local browser agent")
st.caption(
    "Clarification (if enabled) → **plan preview** (streams in) → browser run. Steps appear as chat lines; "
    "the same Chromium window stays open for follow-ups. "
    "Ask **where files are saved** anytime — the app answers from your paths (no browser)."
)

if st.session_state.get("plan_approval_pending") and st.session_state.get("plan_requires_manual_approval"):
    _render_top_plan_approval_bar(worker)


def _plan_stream_ms() -> int:
    try:
        return max(100, int(os.getenv("PLAN_STREAM_MS") or "300"))
    except ValueError:
        return 300


def _plan_stream_chunk_chars() -> int:
    try:
        return max(8, int(os.getenv("PLAN_STREAM_CHARS") or "28"))
    except ValueError:
        return 28


def _step_log_poll_ms() -> int:
    """How often to show the next browser step line in chat (one line added per tick)."""
    try:
        return max(120, int(os.getenv("STEP_LOG_POLL_MS") or "420"))
    except ValueError:
        return 420


def _plan_stream_advance_pos(full: str, pos: int, chunk: int) -> int:
    """Grow by `chunk` chars, snapping near a newline so markdown lines don’t tear mid-line."""
    if pos >= len(full):
        return pos
    end = min(len(full), pos + chunk)
    window_end = min(len(full), pos + chunk + 40)
    nl = full.find("\n", pos, window_end)
    if nl != -1 and nl + 1 <= window_end:
        return nl + 1
    return end


def _plan_preview_stream_fragment(*, instant: bool = False) -> None:
    """Gradually reveal plan in one stable panel; nothing is replaced by a duplicate wall of text elsewhere."""
    full = (st.session_state.get("plan_approval_markdown") or "").strip()
    task = (st.session_state.get("plan_approval_task") or "").strip()
    sig = hashlib.sha256(f"{task}\n{full}".encode()).hexdigest()  # noqa: S324
    if st.session_state.get("_plan_stream_sig") != sig:
        st.session_state._plan_stream_sig = sig
        st.session_state._plan_stream_pos = 0
        st.session_state._plan_stream_reveal_complete = False
        st.session_state._plan_auto_submit_done = False

    pos = int(st.session_state.get("_plan_stream_pos") or 0)
    chunk = _plan_stream_chunk_chars()

    with st.container(border=True):
        st.subheader("Plan preview")
        if task:
            st.caption(f"**Task:** {task}")
        st.caption(
            "Text appears a little at a time below and **stays** — nothing is removed. "
            "The chat does not repeat this plan (no second burst of text)."
        )

        if not full:
            st.session_state._plan_stream_reveal_complete = True
            st.markdown("_(Empty plan.)_")
        elif instant:
            st.session_state._plan_stream_pos = len(full)
            st.session_state._plan_stream_reveal_complete = True
            st.markdown(full)
        else:
            nxt = _plan_stream_advance_pos(full, pos, chunk)
            st.session_state._plan_stream_pos = nxt
            st.session_state._plan_stream_reveal_complete = nxt >= len(full)
            st.markdown(full[:nxt])
            if nxt < len(full):
                st.caption("_Still streaming… you can use the chat below._")
            else:
                st.caption("_Full plan is above — it stays here until the run starts or you cancel._")

    need_btn = bool(st.session_state.get("plan_requires_manual_approval"))
    if need_btn:
        st.caption(
            "**Approve** or **Cancel** works **while the plan is still streaming** — you don’t have to wait. "
            "Same for typing **`approve`** / **`cancel`** in chat or **Approve plan** in the sidebar."
        )
        c1, c2 = st.columns(2)
        with c1:
            if st.button(
                "Approve and run browser",
                type="primary",
                use_container_width=True,
                key="plan_main_approve",
            ):
                _approve_pending_plan_and_run(AgentWorker.instance())
                st.rerun()
        with c2:
            if st.button("Cancel plan", use_container_width=True, key="plan_main_cancel"):
                _cancel_pending_plan()
                st.rerun()
    elif st.session_state._plan_stream_reveal_complete:
        if not st.session_state.get("_plan_auto_submit_done"):
            st.session_state._plan_auto_submit_done = True
            st.caption("_Starting the browser…_")
            _approve_pending_plan_and_run(AgentWorker.instance())
            st.rerun()


if st.session_state.get("plan_approval_pending") and _need_fragment():

    @st.fragment(run_every=timedelta(milliseconds=_plan_stream_ms()))
    def _plan_stream() -> None:
        _plan_preview_stream_fragment()

    _plan_stream()

elif st.session_state.get("plan_approval_pending"):
    st.warning(
        "Animated plan preview needs Streamlit **≥ 1.33** (`pip install -U 'streamlit>=1.33'`). "
        "Showing the full plan once; approval rules still apply."
    )
    _plan_preview_stream_fragment(instant=True)

with st.expander("Example requests"):
    st.markdown(
        """
- Where do you save information? (folder paths — no browser run.)
- Go to a site you use for work and summarize the main dashboard (sign in in the browser if needed).
- Open a site and find the latest blog post title and URL.
- Go to Facebook and draft a post (stop at draft if you are not sure about publishing).
        """
    )

for turn in st.session_state.conversation_log:
    role = turn.get("role") or "user"
    content = turn.get("content") or ""
    if role == "agent_step":
        with st.chat_message("assistant", avatar="🖥️"):
            st.markdown(_format_agent_step_display(content))
    else:
        with st.chat_message(role):
            st.markdown(content)

if not _need_fragment():
    st.error(
        "Your Streamlit version is too old for live step updates. "
        "Run: `pip install -U 'streamlit>=1.33'`"
    )

if prompt := st.chat_input(
    "What should the browser do?",
    disabled=busy,
    key="cowork_chat",
):
    text = prompt.strip()
    pending_plan = st.session_state.get("plan_approval_pending")

    if pending_plan and _user_means_approve_plan(text):
        st.session_state.conversation_log.append({"role": "user", "content": text})
        _approve_pending_plan_and_run(worker)
        _save_session_state()
        st.rerun()

    if pending_plan and _user_means_cancel_plan(text):
        st.session_state.conversation_log.append({"role": "user", "content": text})
        _cancel_pending_plan()
        _save_session_state()
        st.rerun()

    if pending_plan:
        st.session_state.plan_approval_pending = False
        st.session_state.plan_approval_markdown = ""
        st.session_state.plan_approval_task = ""
        st.session_state.plan_requires_manual_approval = False
        _reset_plan_stream_state()

    st.session_state.conversation_log.append({"role": "user", "content": text})

    _try_local_downloads_inventory_route(text)
    _try_storage_location_faq_route(text)
    _try_chat_memory_route(text)
    _try_mid_session_ack_route(text)
    _try_greeting_idle_route(text)

    skip_clar = (os.getenv("SKIP_GOAL_CLARIFICATION") or "").lower() in ("1", "true", "yes")
    refined_task = text
    waiting_on_questions = False

    if not skip_clar and (os.getenv("OPENAI_API_KEY") or "").strip():
        try:
            from goal_clarification import clarify_goal_sync

            with st.spinner("Thinking about your request…"):
                cr = clarify_goal_sync(st.session_state.conversation_log)
        except Exception:
            cr = None
        if cr is not None and not cr.proceed and cr.questions:
            st.session_state.conversation_log.append(
                {"role": "assistant", "content": _format_clarification_questions(cr.questions)}
            )
            st.session_state.clarification_pending = True
            _save_session_state()
            waiting_on_questions = True
            st.rerun()
        if cr is not None and cr.proceed:
            refined_task = (cr.refined_task or text).strip() or text
            st.session_state.clarification_pending = False

    if not waiting_on_questions:
        _try_local_downloads_inventory_route(text, refined_task)
        _try_storage_location_faq_route(text, refined_task)
        _try_chat_memory_route(text, refined_task)
        _try_mid_session_ack_route(text, refined_task)
        _try_greeting_idle_route(text, refined_task)

        st.session_state.clarification_pending = False

        skip_plan = (os.getenv("SKIP_PLAN_APPROVAL") or "").lower() in ("1", "true", "yes")
        if not skip_plan:
            try:
                from plan_approval import generate_approval_plan_sync
                from plan_risk import plan_requires_safety_approval

                with st.spinner("Drafting plan for your approval…"):
                    plan_md = generate_approval_plan_sync(refined_task, st.session_state.conversation_log)
            except Exception as exc:  # noqa: BLE001
                plan_md = (
                    f"_(Plan generation failed: {exc})_\n\n### Fallback\n\n"
                    f"Proceed with task:\n\n{refined_task.strip()}"
                )
            plan_md = plan_md.strip()
            need_manual = plan_requires_safety_approval(refined_task, plan_md)
            st.session_state.plan_requires_manual_approval = need_manual
            body = (
                "## Plan ready\n\n"
                "The **Plan preview** above the chat streams the details slowly so you can read while it appears "
                "— you can still type in chat.\n\n"
            )
            if need_manual:
                body += (
                    "**Manual approval required** (saving files / similar). When you’re ready: click "
                    "**Approve and run browser** under the preview (after it finishes streaming), or **Approve plan** "
                    "in the sidebar, or type **`approve`**, **`yes`**, or **`go ahead`** in chat.\n\n"
                    "Type **`cancel`** to drop the plan. **Any other message discards the draft** and starts over.\n\n"
                )
            else:
                body += (
                    "No risky local file/download steps were detected — Chromium should start on its own "
                    "when the preview finishes.\n\n"
                )
                body += "---\n*Sending another message before the run starts **discards** this plan.*"
            st.session_state.conversation_log.append({"role": "assistant", "content": body})
            st.session_state.plan_approval_pending = True
            st.session_state.plan_approval_markdown = plan_md
            st.session_state.plan_approval_task = refined_task.strip()
            _reset_plan_stream_state()
            _save_session_state()
            st.rerun()

        memory = _format_memory_for_agent(st.session_state.conversation_log)
        st.session_state.awaiting_agent = True
        st.session_state._step_log_cursor = 0
        st.session_state._last_run_step_lines = []
        st.session_state._pending_task = refined_task
        _save_session_state()
        worker.submit(refined_task, memory_context=memory, plan="")
        st.rerun()

if _need_fragment():

    @st.fragment(run_every=timedelta(milliseconds=_step_log_poll_ms()))
    def _live() -> None:
        w = AgentWorker.instance()
        logs = w.get_logs()
        cursor = int(st.session_state.get("_step_log_cursor", 0))
        if len(logs) > cursor:
            # One line per tick so chat grows gradually instead of dumping a backlog in one flash.
            acc = list(st.session_state.get("_last_run_step_lines") or [])
            line = logs[cursor]
            st.session_state.conversation_log.append({"role": "agent_step", "content": line})
            acc.append(line)
            st.session_state._last_run_step_lines = acc
            st.session_state._step_log_cursor = cursor + 1
            _save_session_state()
            st.rerun()
            return

        # Collect result before status text — otherwise when the run ends, is_running() is False and we
        # briefly (or stuck) show "Starting…" instead of applying the Finished recap.
        res = w.pop_result()
        if res is not None:
            _apply_agent_result(res)
            return

        if st.session_state.awaiting_agent:
            step_lines = list(st.session_state.get("_last_run_step_lines") or [])
            has_steps = bool(step_lines)
            if w.is_running():
                if not logs and not has_steps:
                    st.info("**Working…** Connecting to the browser and preparing the first step.")
                else:
                    st.caption("**Running in the browser** — Thinking / Doing lines appear in the chat above.")
            else:
                if has_steps or logs:
                    st.info("**Finishing…** Run completed or stopped — building your recap below.")
                    st.caption("This usually takes one refresh. If it stays here, send any short message to nudge the UI.")
                else:
                    st.info("**Starting…** Loading the browser agent (this can take a few seconds).")
                    st.caption("**Pause** appears here as soon as the first agent step starts (a few seconds).")

            if w.is_running() and st.button(
                "Pause run",
                key="pause_run",
                help="Ask the agent to stop; then send another chat message to continue.",
            ):
                PAUSE_FILE.parent.mkdir(parents=True, exist_ok=True)
                PAUSE_FILE.touch()
                st.info("Pause requested — stopping soon.")

        return

    def _apply_agent_result(res: dict) -> None:
        """Append Finished/Paused/Failed recap and clear awaiting state."""
        st.session_state.awaiting_agent = False
        if res.get("ok"):
            content = str(res.get("final") or "")
            paused = bool(res.get("paused"))
            st.session_state._last_paused = paused
            st.session_state.last_error = None
            task_label = (st.session_state.get("_pending_task") or "").strip()
            steps = list(st.session_state.get("_last_run_step_lines") or [])
            recap = build_run_recap_markdown(task_label, steps, content, paused)
            header = "## Finished\n\n" if not paused else "## Paused\n\n"
            tail = (
                "\n\n---\n*Send your next message in the chat to continue in the same browser.*"
                if paused
                else ""
            )
            st.session_state.conversation_log.append(
                {"role": "assistant", "content": f"{header}{recap}{tail}"}
            )
            last_user = ""
            for t in reversed(st.session_state.conversation_log):
                if t.get("role") == "user":
                    last_user = str(t.get("content") or "")
                    break
            st.session_state.last_run_snapshot = {
                "task": last_user,
                "result": str(res.get("final") or ""),
                "paused": paused,
            }
        else:
            err = str(res.get("error") or "Unknown error")
            st.session_state.last_error = err
            st.session_state.conversation_log.append(
                {
                    "role": "assistant",
                    "content": f"## Failed\n\nThe browser run ended with an error.\n\n```\n{err}\n```",
                }
            )
        _save_session_state()
        st.rerun()

    _live()

_save_session_state()
