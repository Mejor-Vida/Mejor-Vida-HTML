"""Ask short clarifying questions in chat before starting the browser agent."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any


@dataclass
class ClarifyResult:
    proceed: bool
    refined_task: str = ""
    questions: list[str] | None = None


def _conversation_text_for_clarifier(turns: list[dict[str, Any]]) -> str:
    """Include recent browser step lines so the model sees what actually ran (not just chat text)."""
    lines: list[str] = []
    for t in turns[-40:]:
        role = (t.get("role") or "").strip()
        content = (t.get("content") or "").strip()
        if not content:
            continue
        if role == "agent_step":
            lines.append(f"Browser step: {content[:220]}")
        elif role == "user":
            lines.append(f"User: {content}")
        else:
            lines.append(f"Assistant: {content[:2000]}")
    return "\n\n".join(lines)


def _maybe_fast_proceed(conversation_log: list[dict[str, Any]]) -> ClarifyResult | None:
    """
    Skip the LLM when the user clearly wants to open a site and log in themselves
    (avoids inappropriate questions about credentials).
    """
    last = ""
    for t in reversed(conversation_log):
        if t.get("role") == "user":
            last = str(t.get("content") or "").strip()
            break
    if not last:
        return None
    low = last.lower()
    hints = (
        "let me log",
        "i'll log",
        "ill log",
        "login myself",
        "log in myself",
        "just open",
        "wait for me to log",
        "then i will tell",
        "then i'll tell",
        "i will tell you what",
        "tell you what to do",
        "after i log",
        "after i login",
    )
    if any(h in low for h in hints):
        return ClarifyResult(proceed=True, refined_task=last, questions=None)
    return None


def _has_prior_browser_steps(turns: list[dict[str, Any]]) -> bool:
    for t in turns[-80:]:
        if (t.get("role") or "").strip() == "agent_step":
            return True
        c = (t.get("content") or "")
        if "## Paused" in c or "Run paused" in c or "## Finished" in c:
            return True
    return False


def _maybe_follow_up_proceed(conversation_log: list[dict[str, Any]]) -> ClarifyResult | None:
    """
    Skip clarification when the user is clearly continuing / asking status / pointing at chat history.
    Otherwise the LLM asks irrelevant questions and the browser never runs.
    """
    last = ""
    for t in reversed(conversation_log):
        if t.get("role") == "user":
            last = str(t.get("content") or "").strip()
            break
    if not last:
        return None
    from conversational_gate import is_greeting_or_idle_only

    if is_greeting_or_idle_only(last, conversation_log):
        return None
    from local_downloads_inventory import is_local_downloads_inventory_request

    if is_local_downloads_inventory_request(last):
        return None
    from chat_memory_reply import is_chat_memory_only_question

    if is_chat_memory_only_question(last, conversation_log):
        return None
    low = last.lower()
    phrases = (
        "what are you doing",
        "what are you working",
        "what did you find",
        "what did you",
        "did you find",
        "what happened",
        "what's going on",
        "whats going on",
        "are you still",
        "still there",
        "look back",
        "look at the chat",
        "chat history",
        "read the chat",
        "previous task",
        "continue with",
        "continue on",
        "carry on",
        "pick up where",
        "resume",
        "status",
        "you need to look",
        "tell me what",
        "summarize",
        "recap",
        "why",
        "what now",
    )
    if any(p in low for p in phrases):
        return ClarifyResult(proceed=True, refined_task=last, questions=None)
    if _has_prior_browser_steps(conversation_log) and len(last) < 600:
        # Short follow-ups after a run with browser history are usually not new tasks
        if any(
            w in low
            for w in (
                "what",
                "where",
                "how",
                "did",
                "find",
                "search",
                "doing",
                "explain",
                "show",
                "underwriting",
                "assurity",
                "portal",
                "still",
                "continue",
                "tell me",
                "look",
                "read",
                "back",
            )
        ):
            return ClarifyResult(proceed=True, refined_task=last, questions=None)
    return None


def clarify_goal_sync(conversation_log: list[dict[str, Any]]) -> ClarifyResult:
    """
    Decide whether to ask clarifying questions or proceed with a refined task string.
    Uses OPENAI_API_KEY and CLARIFY_MODEL (default: same as PLAN_MODEL or gpt-4o-mini).
    """
    last_user = ""
    for t in reversed(conversation_log):
        if t.get("role") == "user":
            last_user = str(t.get("content") or "").strip()
            break

    from chat_memory_reply import is_chat_memory_only_question
    from conversational_gate import is_greeting_or_idle_only

    if last_user and is_chat_memory_only_question(last_user, conversation_log):
        # Do not let the clarifier LLM rewrite this into a browser navigation task.
        return ClarifyResult(proceed=True, refined_task=last_user, questions=None)

    if last_user and is_greeting_or_idle_only(last_user, conversation_log):
        return ClarifyResult(
            proceed=False,
            questions=[
                "What site or task should we work on? Describe the goal in one or two sentences.",
            ],
        )

    fast = _maybe_fast_proceed(conversation_log)
    if fast is not None:
        return fast
    follow = _maybe_follow_up_proceed(conversation_log)
    if follow is not None:
        return follow

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        last = ""
        for t in reversed(conversation_log):
            if t.get("role") == "user":
                last = str(t.get("content") or "").strip()
                break
        return ClarifyResult(proceed=True, refined_task=last, questions=None)

    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    model = os.getenv("CLARIFY_MODEL") or os.getenv("PLAN_MODEL") or "gpt-4o-mini"
    transcript = _conversation_text_for_clarifier(conversation_log)

    system = (
        "You help scope tasks for a browser automation agent (real Chromium). "
        "The user types in chat; the agent controls a real browser window. "
        "The transcript may include lines labeled 'Browser step:' — those are real actions the agent took.\n\n"
        "The user often logs in manually — you must NEVER ask for passwords, MFA codes, or full credentials.\n\n"
        "If the LAST user message is ONLY a greeting or small talk (e.g. hello, hi, thanks) with no task, "
        'return {"proceed": false, "questions": ["What should the browser do? Describe the site or goal."]} '
        "— do NOT infer a continuation from older Browser step lines.\n\n"
        "Otherwise, ALWAYS return proceed:true when:\n"
        "- The user asks about status, progress, what was found, what you are doing, or to read/look at chat history.\n"
        "- The user asks to continue, resume, summarize, or follow up on the same browser session.\n"
        "- There are already Browser step lines in the transcript (the user is continuing, not starting a brand-new task).\n"
        "In those cases refine_task into a single imperative for the browser agent, e.g. "
        "answer the users question using the current page and the steps above; if asked what you found, "
        "list concrete facts from the page or say you did not find it and where you looked.\n\n"
        "Prefer proceeding when the user names a company/site/portal or says they will log in and assign tasks next. "
        "Use web search or well-known public URLs when needed; do not block on 'exact URL' if the target is identifiable.\n\n"
        "If the user only asks where this app saves files, what folder to use, or whether things can be saved to the "
        "Desktop in general (policy / capability, not ‘open site X and save’), return proceed:true — do NOT ask "
        "which website or what content; the chat UI answers with real paths.\n\n"
        "Ask at most 3 short questions only when starting a NEW task with no context and the goal is unsafe or truly ambiguous.\n\n"
        "Reply with JSON only:\n"
        '- If ready: {"proceed": true, "refined_task": "one clear imperative instruction in English"}\n'
        '- If not: {"proceed": false, "questions": ["question1", "question2"]}\n'
        "refined_task must stand alone for the agent."
    )

    resp = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        temperature=0.2,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Conversation so far:\n\n{transcript}"},
        ],
    )
    raw = (resp.choices[0].message.content or "").strip()
    if not raw:
        return _fallback_last_user_task(conversation_log)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return _fallback_last_user_task(conversation_log)

    proceed = bool(data.get("proceed"))
    if proceed:
        refined = (data.get("refined_task") or "").strip()
        if not refined:
            return _fallback_last_user_task(conversation_log)
        last = ""
        for t in reversed(conversation_log):
            if t.get("role") == "user":
                last = str(t.get("content") or "").strip()
                break
        from conversational_gate import is_greeting_or_idle_only

        if last and is_greeting_or_idle_only(last, conversation_log):
            return ClarifyResult(
                proceed=False,
                questions=[
                    "What site or task should we work on? Describe the goal in one or two sentences.",
                ],
            )
        if last and is_chat_memory_only_question(last, conversation_log):
            refined = last
        return ClarifyResult(proceed=True, refined_task=refined, questions=None)

    qs = data.get("questions")
    if isinstance(qs, list):
        questions = [str(q).strip() for q in qs if str(q).strip()][:3]
    else:
        questions = []
    if not questions:
        return _fallback_last_user_task(conversation_log)
    return ClarifyResult(proceed=False, refined_task="", questions=questions)


def _fallback_last_user_task(conversation_log: list[dict[str, Any]]) -> ClarifyResult:
    last = ""
    for t in reversed(conversation_log):
        if t.get("role") == "user":
            last = str(t.get("content") or "").strip()
            break
    return ClarifyResult(proceed=True, refined_task=last, questions=None)
