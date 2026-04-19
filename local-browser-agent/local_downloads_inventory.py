"""List real files on disk under Browser-Use Downloads — no browser agent needed."""

from __future__ import annotations

import os
from pathlib import Path

from chat_memory_reply import _normalize_for_memory_match
from download_paths import browser_agent_files_dir, browser_downloads_dir, browser_user_data_dir

_MAX_ENTRIES = 120


# Substrings that suggest the user wants live browser navigation, not a storage FAQ.
_STORAGE_FAQ_BROWSER_TASK_HINTS: tuple[str, ...] = (
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
    "download from",
    "go to ",
    "visit ",
    "fill out",
    "log in",
    "login",
    "sign in",
)


def is_storage_location_faq_request(text: str) -> bool:
    """
    True when the user asks generically where this app saves files — answer with real paths, no browser/clarify.
    """
    if (os.getenv("SKIP_STORAGE_LOCATION_FAQ") or "").lower() in ("1", "true", "yes"):
        return False
    low = _normalize_for_memory_match(text)
    if not low:
        return False
    if any(h in low for h in _STORAGE_FAQ_BROWSER_TASK_HINTS):
        return False
    # Past-tense / session-specific → chat_memory_reply handles with transcript
    if "where did you save" in low or "where did the agent save" in low:
        return False
    phrases = (
        "where do you save",
        "where you save",
        "where are files saved",
        "where are my files saved",
        "where is information saved",
        "where is data saved",
        "where does information go",
        "where does saved data go",
        "where does the agent save",
        "where does this save",
        "where does this app save",
        "what folder do you save",
        "what folder you save",
        "what path do you use",
        "what directory",
        "how do you save files",
        "how are files saved",
        "where should i look for files",
        "where will you save",
        "where will files go",
    )
    if any(p in low for p in phrases):
        return True
    # Policy / capability: saving to Desktop in general (not "open X and save")
    if "save" in low and "desktop" in low:
        if any(
            w in low
            for w in (
                "where",
                "what folder",
                "anything",
                "ask you",
                "do you",
                "can you",
                "will you",
                "if i ask",
                "when i ask",
            )
        ):
            return True
    return False


def format_storage_location_faq_markdown() -> str:
    """Short, accurate paths for chat (no LLM)."""
    root = browser_downloads_dir()
    agent_data = browser_agent_files_dir()
    profile = browser_user_data_dir()
    return (
        "### Where this app saves data\n\n"
        "Everything goes under **one root** on your Mac. To use a different folder, set the environment variable "
        "**`BROWSER_USE_DOWNLOADS`** to an absolute path and restart Streamlit (same mechanism as other local options "
        "documented in the project README — not something you paste in chat):\n\n"
        f"- **Root (site downloads / exports):** `{root}`\n"
        f"- **Agent `write_file` (text you ask to save):** `{agent_data}`\n"
        f"- **Chromium profile (cookies / logins):** `{profile}`\n\n"
        "If you say “save to the Desktop,” files still land under that root — by default the folder is on your "
        "**Desktop** (`Browser-Use Downloads`). Give a **file name** when you want something specific "
        "(e.g. `notes.md`)."
    )


def is_local_downloads_inventory_request(text: str) -> bool:
    """
    True when the user wants to see what is on disk under the configured download folders.
    """
    if (os.getenv("SKIP_LOCAL_DOWNLOADS_LIST") or "").lower() in ("1", "true", "yes"):
        return False
    low = _normalize_for_memory_match(text)
    if not low:
        return False
    phrases = (
        "check the download folder",
        "check the downloads folder",
        "check my download",
        "list the download",
        "list files in the download",
        "list files in download",
        "what's in the download",
        "what is in the download",
        "what files are in the download",
        "what files are in download",
        "what's in browser-use",
        "what is in browser-use",
        "browser-use downloads",
        "in browser-use downloads",
        "look in the download folder",
        "look in download folder",
        "see what's in",
        "show what's in",
        "inventory of",
        "folder for the files",
        "folder for any files",
    )
    if any(p in low for p in phrases):
        return True
    if "download" in low and "folder" in low and any(
        w in low for w in ("check", "list", "what", "show", "see", "look", "inside")
    ):
        return True
    return False


def _list_one_root(path: Path, title: str) -> str:
    lines: list[str] = [f"### {title}", "", f"Path: `{path}`", ""]
    if not path.exists():
        lines.append("*This path does not exist on disk yet.*")
        return "\n".join(lines)
    try:
        entries = sorted(path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
    except OSError as exc:
        lines.append(f"*Could not read directory: {exc}*")
        return "\n".join(lines)
    if not entries:
        lines.append("*This folder is empty.*")
        return "\n".join(lines)
    shown = 0
    for p in entries:
        if shown >= _MAX_ENTRIES:
            lines.append("")
            lines.append(f"*…and {len(entries) - _MAX_ENTRIES} more (showing first {_MAX_ENTRIES}).*")
            break
        icon = "📁" if p.is_dir() else "📄"
        try:
            st = p.stat()
            sz = f" ({st.st_size:,} bytes)" if p.is_file() else ""
        except OSError:
            sz = ""
        lines.append(f"- {icon} `{p.name}`{sz}")
        shown += 1
    return "\n".join(lines)


def format_downloads_inventory_markdown() -> str:
    """Readable listing for chat (runs in Streamlit on the user's Mac)."""
    root = browser_downloads_dir()
    agent_data = browser_agent_files_dir()
    parts = [
        "Here is what is on **your Mac** right now under the browser-use download locations "
        "(this app read the folders directly — no browser step needed):",
        "",
        _list_one_root(root, "Browser-Use Downloads"),
        "",
        _list_one_root(agent_data, "Agent write_file area (browseruse_agent_data)"),
        "",
        "Normal **site downloads** usually appear in the first folder. **write_file** output from the agent "
        "appears under **browseruse_agent_data**.",
    ]
    return "\n".join(parts)
