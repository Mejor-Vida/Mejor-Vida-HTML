"""Short plain-text plan from the same provider key you use for the app (OpenAI API by default)."""

from __future__ import annotations

import os


def generate_plan_sync(task: str) -> str:
    """
    Produce a short numbered plan (3–6 steps). Uses OpenAI Chat Completions API.
    Requires OPENAI_API_KEY (even if the browser agent uses another provider).
    """
    task = (task or "").strip()
    if not task:
        raise ValueError("Task is empty.")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Add it to .env for Generate Plan, "
            "or paste a plan manually in the Plan box."
        )

    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    model = os.getenv("PLAN_MODEL") or "gpt-4o-mini"
    system = (
        "You write concise browser automation plans. Reply with 3–6 numbered steps only, "
        "plain text, under 120 words. No markdown headings. Be specific about navigation and clicks."
    )
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Task:\n{task}"},
        ],
        temperature=0.3,
    )
    text = (resp.choices[0].message.content or "").strip()
    if not text:
        raise RuntimeError("Plan model returned empty text.")
    return text
