"""Ask whether a draft plan needs explicit user approval (system-impact / local harm)."""

from __future__ import annotations

import json
import os
import re
from typing import Any


def _heuristic_requires_approval(task: str, plan_md: str) -> bool:
    """Fast offline signal: disk, downloads, uploads, installs, destructive actions."""
    text = f"{task}\n{plan_md}".lower()
    if any(
        p in text
        for p in (
            "write_file",
            "write file",
            "save to disk",
            "save file",
            "save as",
            "download",
            "export",
            "upload",
            "attach file",
            "install",
            "extension",
            "delete file",
            "remove file",
            "terminal",
            "shell",
            "execute",
            "run command",
            "powershell",
            "chmod",
            "format disk",
            "registry",
        )
    ):
        return True
    if re.search(r"\bsubmit\b", text) and re.search(
        r"\b(form|payment|purchase|checkout|wire|transfer)\b", text
    ):
        return True
    return False


def plan_requires_safety_approval(task: str, plan_md: str) -> bool:
    """
    True when the user should confirm before running — focus on harm to the **computer** and **local data**:
    saving/downloading/uploading files, installs, destructive actions, not mere reading or scrolling pages.
    """
    if (os.getenv("SKIP_PLAN_RISK_GATE") or "").lower() in ("1", "true", "yes"):
        return False
    if (os.getenv("FORCE_PLAN_APPROVAL") or "").lower() in ("1", "true", "yes"):
        return True

    t, p = (task or "").strip(), (plan_md or "").strip()
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        return _heuristic_requires_approval(t, p)

    system = (
        "You gate browser automation before it runs. Focus on risk to the user's COMPUTER and LOCAL FILES — "
        "not whether posting to Facebook or sending email is socially risky.\n\n"
        "Set requires_approval **true** when the task/plan likely involves ANY of:\n"
        "- Saving, writing, exporting, or downloading files to disk\n"
        "- Uploading files from the user's machine\n"
        "- Installing software, browser extensions, or running OS/shell commands\n"
        "- Deleting or modifying local files or system settings\n"
        "- Running or injecting code that could leave the normal read-only browsing case\n\n"
        "Set requires_approval **false** for typical read-only work: open sites, navigate, scroll, read visible "
        "text, summarize on-page content, answer from what is shown **without** saving files or exporting.\n\n"
        "Reply with JSON only: {\"requires_approval\": true or false, \"reason\": \"one short phrase\"}"
    )

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        model = os.getenv("PLAN_RISK_MODEL") or os.getenv("PLAN_APPROVAL_MODEL") or os.getenv("PLAN_MODEL") or "gpt-4o-mini"
        resp = client.chat.completions.create(
            model=model,
            response_format={"type": "json_object"},
            temperature=0.1,
            messages=[
                {"role": "system", "content": system},
                {
                    "role": "user",
                    "content": f"Task:\n{t}\n\nPlan markdown:\n{p[:12000]}",
                },
            ],
        )
        raw = (resp.choices[0].message.content or "").strip()
        data: dict[str, Any] = json.loads(raw) if raw else {}
        return bool(data.get("requires_approval"))
    except Exception:
        return _heuristic_requires_approval(t, p)
