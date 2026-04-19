"""Answer questions about the chat session without starting the browser agent."""

from __future__ import annotations

import os
import re
import unicodedata
from typing import Any


def _normalize_for_memory_match(text: str) -> str:
    """Lowercase, strip invisible chars, normalize apostrophes so substring checks match real typing."""
    s = unicodedata.normalize("NFKC", (text or "").strip().lower())
    for ch in (
        "\u2019",
        "\u2018",
        "\u201b",
        "\u2032",
        "\u00b4",
    ):
        s = s.replace(ch, "'")
    for ch in ("\u200b", "\u200c", "\u200d", "\ufeff"):
        s = s.replace(ch, "")
    return s


def _log_has_browser_or_plan_history(conversation_log: list[dict[str, Any]] | None) -> bool:
    if not conversation_log:
        return False
    for t in conversation_log:
        role = (t.get("role") or "").strip()
        c = (t.get("content") or "")
        if role == "agent_step":
            return True
        if role == "assistant" and any(
            x in c for x in ("## Paused", "## Finished", "## Failed", "Plan ready", "## Plan cancelled")
        ):
            return True
    return False


def is_chat_memory_only_question(
    text: str, conversation_log: list[dict[str, Any]] | None = None
) -> bool:
    """
    True when the user only needs a reply from saved chat + step text — not live browser control.
    """
    if (os.getenv("SKIP_CHAT_MEMORY_ROUTE") or "").lower() in ("1", "true", "yes"):
        return False
    low = _normalize_for_memory_match(text)
    if not low:
        return False
    # Accountability: "why did you…", "I didn't ask…" after a run — answer from transcript, don't start browser.
    if conversation_log and _log_has_browser_or_plan_history(conversation_log):
        nav_now = (
            "now open ",
            "now go to ",
            "please open http",
            "navigate to http",
            "go to http://",
            "open http://",
        )
        if not any(n in low for n in nav_now):
            explanation_markers = (
                "why did you",
                "why would you",
                "why do you",
                "i didn't ask",
                "i did not ask",
                "i never asked",
                "you tried to",
                "you attempted",
                "what made you",
                "how could you",
                "you shouldn't have",
                "you should not have",
            )
            if any(m in low for m in explanation_markers):
                return True
    memory_markers = (
        "do you remember",
        "dont you remember",
        "do you recall",
        "can you recall",
        "did you forget",
        "our past conversation",
        "past conversations",
        "past conversation",
        "past chat",
        "summarize the chat",
        "summarize our conversation",
        "recap our",
        "recap of",
        "what did we discuss",
        "what did we talk",
        "what we said",
        "what we talked",
        "look back at the chat",
        "look back in the chat",
        "look back in chat",
        "chat history",
        "conversation history",
        "remember our",
        "you can't see",
        "you cannot see",
        "cant you see",
        "can't access past",
        "cannot access past",
        "access past conversation",
        "access past conversations",
        "no access to past",
        "see our past",
        "see the past chat",
        "earlier in this chat",
        "earlier in the chat",
        "in this conversation",
        "files you created",
        "files you saved",
        "still have access to the file",
        "still have access to files",
        "where did you save",
    )
    if not any(m in low for m in memory_markers):
        # e.g. "Can you recall what we said?" without exact phrases above
        if re.search(
            r"\b(recall|remember)\b.{0,120}\b(chat|conversation|messages?|earlier|before)\b",
            low,
        ) or re.search(
            r"\b(chat|conversation|messages?)\b.{0,80}\b(recall|remember|before|earlier)\b",
            low,
        ):
            pass
        else:
            return False
    browser_markers = (
        "open ",
        "navigate to",
        "go to http",
        "click ",
        "search the site",
        "search the page",
        "load the",
        "refresh the",
        "in the portal",
        "on assurity",
        "open assurity",
        "open the ",
    )
    if any(b in low for b in browser_markers):
        return False
    return True


def _transcript(turns: list[dict[str, Any]]) -> str:
    lines: list[str] = []
    for t in turns[-60:]:
        role = (t.get("role") or "").strip()
        c = (t.get("content") or "").strip()
        if not c:
            continue
        if role == "agent_step":
            lines.append(f"Browser step: {c[:300]}")
        elif role == "user":
            lines.append(f"User: {c}")
        else:
            lines.append(f"Assistant: {c[:4000]}")
    return "\n\n".join(lines)


def chat_memory_reply_sync(user_message: str, conversation_log: list[dict[str, Any]]) -> str:
    """LLM answer from transcript only (no browser)."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _fallback_no_api(conversation_log)

    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    model = os.getenv("CHAT_MEMORY_MODEL") or os.getenv("CLARIFY_MODEL") or os.getenv("PLAN_MODEL") or "gpt-4o-mini"
    transcript = _transcript(conversation_log)
    system = (
        "You answer questions about THIS chat session only. "
        "You receive a transcript: User messages, Assistant messages, and optional Browser step lines "
        "(what the automation did in the browser).\n\n"
        "Answer using only that transcript. Be direct and concise. "
        "Do not tell the user you cannot access past conversations — the transcript IS the accessible record. "
        "Do not suggest opening websites, clicking, or loading pages unless the user explicitly asks to verify "
        "something in the live browser.\n\n"
        "If the user challenges what the automation did (e.g. attempted login when they only asked to open a page), "
        "answer from **Browser step** lines honestly. Acknowledge mistakes: do not defend unauthorized credential "
        "entry or clicking Log In when they only requested navigating to a login **screen**. "
        "Do not tell them to run the browser again unless they clearly ask for a new action.\n\n"
        "If the transcript is incomplete for their question, say what is missing."
    )
    resp = client.chat.completions.create(
        model=model,
        temperature=0.3,
        messages=[
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": f"Transcript of this session:\n\n{transcript}\n\n---\n\nQuestion:\n{user_message}",
            },
        ],
    )
    out = (resp.choices[0].message.content or "").strip()
    return out or "(Empty reply.)"


def _fallback_no_api(conversation_log: list[dict[str, Any]]) -> str:
    """No OpenAI key: echo a tiny excerpt so the route still works."""
    parts: list[str] = []
    for t in conversation_log[-15:]:
        role = (t.get("role") or "").strip()
        c = (t.get("content") or "").strip()
        if c and role in ("user", "assistant"):
            parts.append(f"{role}: {c[:500]}")
    if not parts:
        return "No chat text found in this session yet."
    return "Here is a short excerpt from this session (set OPENAI_API_KEY for a fuller answer):\n\n" + "\n\n".join(
        parts
    )
