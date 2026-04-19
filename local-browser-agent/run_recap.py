"""Build a short recap of a browser run for the chat (no extra LLM call by default)."""

from __future__ import annotations

import os

from download_paths import browser_agent_files_dir, browser_downloads_dir


def _save_locations_markdown() -> str:
    root = browser_downloads_dir()
    agent_dir = browser_agent_files_dir()
    return (
        "### Where files are on your Mac\n\n"
        f"- **Site downloads** (when the browser saves a file from a webpage): `{root}`\n"
        f"- **Agent write_file** (text/markdown the agent writes): **`{agent_dir}`** — "
        "always inside the **browseruse_agent_data** folder, not the parent folder root.\n\n"
        "*If `Browser-Use Downloads` looks empty, open **browseruse_agent_data** inside it. "
        "Starting a new agent run can clear that subfolder; copy anything you need to keep.*"
    )


def build_run_recap_markdown(task: str, step_lines: list[str], final_text: str, paused: bool) -> str:
    task = (task or "").strip() or "(see chat above)"
    parts: list[str] = ["### Recap", f"- **Goal:** {task}"]

    if step_lines:
        n = len(step_lines)
        parts.append(
            f"- **What happened:** Step-by-step **Thinking / Doing** lines are already in the chat above "
            f"({n} line{'s' if n != 1 else ''}). *This recap does not repeat them so nothing big pops in at once.*"
        )
    else:
        parts.append("- **What happened:** *(no step log — run may have ended very quickly.)*")

    status = "Paused (you can continue in chat)." if paused else "Run completed."
    parts.append(f"- **Status:** {status}")

    ft = (final_text or "").strip()
    if ft:
        parts.append("")
        parts.append("### Result")
        max_r = int(os.getenv("RECAP_RESULT_MAX_CHARS") or "12000")
        if max_r > 200 and len(ft) > max_r:
            parts.append(ft[: max_r - 1] + "…")
            parts.append("")
            parts.append(f"*_(Result truncated for chat; full length was {len(ft):,} characters.)_*")
        else:
            parts.append(ft)

    if not paused:
        parts.append("")
        parts.append(_save_locations_markdown())

    return "\n".join(parts)
