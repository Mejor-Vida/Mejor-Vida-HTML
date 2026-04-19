"""Generate a markdown execution plan for user approval before the browser agent runs."""

from __future__ import annotations

import os
from typing import Any


def _transcript_for_planner(turns: list[dict[str, Any]]) -> str:
    lines: list[str] = []
    for t in turns[-35:]:
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


def generate_approval_plan_sync(refined_task: str, conversation_log: list[dict[str, Any]]) -> str:
    """
    Return markdown: goal read-back, numbered browser steps, save location reminder, open questions.
    Uses OpenAI; caller must have OPENAI_API_KEY or handle empty key.
    """
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        return _fallback_plan_markdown(refined_task)

    from openai import OpenAI

    transcript = _transcript_for_planner(conversation_log)
    model = os.getenv("PLAN_APPROVAL_MODEL") or os.getenv("PLAN_MODEL") or os.getenv("CLARIFY_MODEL") or "gpt-4o-mini"

    system = (
        "You draft execution plans for a real browser automation agent (Chromium). The user must approve "
        "before any browser actions run.\n\n"
        "**Authentication (critical):**\n"
        "- Phrases like **open the login page**, **show the sign-in page**, **go to the login URL** mean: "
        "**navigate, wait for the page to load, stop.** The plan must **not** include entering credentials, clicking "
        "**Log In** / **Sign in**, or submitting a login form unless the user **explicitly** asked to log in, sign "
        "in, authenticate, or enter their credentials.\n"
        "- If the transcript is the user asking **why** the agent did something or say they **did not ask** for "
        "login/actions, the plan should be **answer from the chat + browser steps** (or current page only), "
        "**apologize** if appropriate, and **no** new login attempts — not \"open portal and try again\".\n"
        "- If the user wants the **login page opened so they can sign in**, the plan is: **direct navigation** to the "
        "official login URL, brief load check, **stop** with form visible — **not** many refresh/wait loops and **not** "
        "claiming the site is down without evidence on the page.\n\n"
        "Output ONLY markdown (no JSON). Include:\n"
        "1. **What I understood** — one short paragraph restating the user's goal in your own words.\n"
        "2. **Plan** — numbered concrete steps (navigate only when needed, open menus/tabs, extract/save). "
        "Only include credential entry or clicking Log In if the user explicitly requested authentication. "
        "Mention write_file for text saves under the agent download folder when relevant.\n"
        "3. **Out of scope / assumptions** — bullet list of anything unclear or you must assume.\n"
        "4. **Risks** — e.g. portals, CAPTCHA, PDF-only docs.\n\n"
        "**Extraction depth:** If the user wants **all / full / comprehensive** underwriting (or to save a **txt** "
        "of guidelines), the plan must **not** treat one quick page skim as enough. Include steps to **locate the "
        "real underwriting guide** (tabs, PDFs, agent resources), **open major sections**, **scroll long pages**, "
        "and **extract in chunks** until the user’s checklist is covered — or explicitly note what could not be reached. "
        "Warn that a one-line summary is insufficient for that request.\n\n"
        "Be specific to carriers/sites named in the task. Do not invent URLs; say 'open official site' or "
        "'use current page' if unknown. Keep under 900 words."
    )

    user_msg = (
        f"Refined task for the browser agent:\n{refined_task.strip()}\n\n"
        f"Recent conversation:\n\n{transcript or '(no prior context)'}"
    )

    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        temperature=0.25,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_msg},
        ],
    )
    text = (resp.choices[0].message.content or "").strip()
    return text or _fallback_plan_markdown(refined_task)


def _fallback_plan_markdown(refined_task: str) -> str:
    return (
        "### What I understood\n\n"
        f"{refined_task.strip()}\n\n"
        "### Plan\n\n"
        "1. Open the browser and work through the task above step by step.\n"
        "2. Save any extracted text with write_file under the configured downloads area.\n\n"
        "_A detailed plan could not be generated (no API key or empty model response)._"
    )
