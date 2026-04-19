"""Detect greetings / idle chat so we do not start the browser agent."""

from __future__ import annotations

import os
import re
from typing import Any

from chat_memory_reply import _normalize_for_memory_match


def session_has_prior_activity(conversation_log: list[dict[str, Any]]) -> bool:
    """True once this chat is more than a cold start (follow-ups should not get the generic 'no task yet' reply)."""
    user_count = sum(1 for t in conversation_log if (t.get("role") or "").strip() == "user")
    if user_count >= 2:
        return True
    for t in conversation_log:
        role = (t.get("role") or "").strip()
        c = (t.get("content") or "")
        if role == "agent_step":
            return True
        if role == "assistant" and any(
            x in c for x in ("## Paused", "## Finished", "## Failed", "## Plan cancelled", "Plan ready")
        ):
            return True
    return False


def matches_idle_greeting_shape(text: str) -> bool:
    """True if the text looks like a short greeting — before session-context checks."""
    if (os.getenv("SKIP_GREETING_GATE") or "").lower() in ("1", "true", "yes"):
        return False
    low = _normalize_for_memory_match(text)
    if not low:
        return False
    hints = (
        "http://",
        "https://",
        "www.",
        ".com/",
        ".org/",
        "open ",
        "navigate",
        "go to ",
        "search for",
        "search the",
        "look up",
        "click ",
        "browser",
        "portal",
        "assurity",
        "underwriting",
        "whole life",
        "google sheet",
        "facebook",
        "fill out",
        "fill the",
        "log in",
        "login",
        "sign in",
        "download",
        "upload",
        "url",
    )
    if any(h in low for h in hints):
        return False
    if len(low) > 140:
        return False
    patterns = (
        r"^\s*(hi|hello|hey|hola|yo)\b[\s!.,?]*$",
        r"^\s*(hi|hello|hey|hola)\b[\s,]+(there|team|friend|everyone|all)\b[\s!.,?]*$",
        r"^\s*(good\s+(morning|afternoon|evening)|greetings)\b[\s!.,?]*$",
        r"^\s*(thanks|thank\s+you|thx|ty)\b[\s!.,?]*$",
        r"^\s*(ok|okay|k)\b[\s!.,?]*$",
        r"^\s*(bye|goodbye)\b[\s!.,?]*$",
        r"^\s*(sup|what'?s\s+up)\b[\s!.,?]*$",
    )
    return any(re.match(p, low, re.I) for p in patterns)


def is_greeting_or_idle_only(text: str, conversation_log: list[dict[str, Any]] | None = None) -> bool:
    """
    True when the message is only a greeting or short acknowledgment — no browser task yet.
    If the session already has runs/plans/messages, short hellos are **not** treated as idle-only.
    """
    if not matches_idle_greeting_shape(text):
        return False
    if conversation_log and session_has_prior_activity(conversation_log):
        return False
    return True


def mid_session_short_ack_reply_markdown() -> str:
    """After a plan or browser run, a bare “hello?” should not sound like a cold start."""
    return (
        "Hi — I’m still in this session with you.\n\n"
        "Say **what to do next** in the browser, ask **what happened** in a previous step, or type **where files are saved** if you only need paths. "
        "I won’t treat this as a brand-new empty chat."
    )


def greeting_idle_reply_markdown() -> str:
    return (
        "Hi — I didn’t start the browser because there’s no specific task yet.\n\n"
        "**Tell me what you want to accomplish** (e.g. open a site, find a document, fill a form). "
        "I’ll suggest a short plan in chat; once you confirm or refine it, we can run the automation.\n\n"
        "If you’re continuing something we already started, say what to do next in plain language."
    )
