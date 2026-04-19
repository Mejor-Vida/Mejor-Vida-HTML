"""Default folder for browser downloads and agent-written files.

**Single location on your Mac:** set ``BROWSER_USE_DOWNLOADS`` in ``.env.local`` (repo root or
``local-browser-agent/.env.local``) to **one absolute path** on your Desktop (or anywhere). That path becomes
the root for:

- Playwright / Chromium **file downloads** from websites
- browser-use **write_file** output (under a subfolder ``browseruse_agent_data/`` — required by the library)
- Default **Chromium profile** (cookies), at ``<that path>/chromium_profile`` unless you override
  ``BROWSER_USER_DATA_DIR``

No other app folders are used for saves unless you change these env vars.
"""

from __future__ import annotations

import os
from pathlib import Path

# Must match browser_use.filesystem.file_system.DEFAULT_FILE_SYSTEM_PATH
BROWSER_USE_AGENT_DATA_SUBDIR = "browseruse_agent_data"


def browser_downloads_dir() -> Path:
    """
    Folder on your Mac where Playwright saves downloads and where the agent should write files.

    Override with env: BROWSER_USE_DOWNLOADS=/absolute/or/~/path
    """
    override = (os.getenv("BROWSER_USE_DOWNLOADS") or "").strip()
    if override:
        return Path(override).expanduser().resolve()
    return (Path.home() / "Desktop" / "Browser-Use Downloads").resolve()


def browser_agent_files_dir() -> Path:
    """
    Where browser-use stores files created via the agent write_file tool.

    It is always ``browser_downloads_dir() / BROWSER_USE_AGENT_DATA_SUBDIR`` — not the folder root.
    """
    return browser_downloads_dir() / BROWSER_USE_AGENT_DATA_SUBDIR


def browser_user_data_dir() -> Path:
    """
    Persistent Chromium profile (cookies, logins, site storage between runs).

    Same idea as Playwright ``launch_persistent_context(user_data_dir=...)``.
    Override with env: BROWSER_USER_DATA_DIR=/path
    """
    override = (os.getenv("BROWSER_USER_DATA_DIR") or "").strip()
    if override:
        return Path(override).expanduser().resolve()
    return browser_downloads_dir() / "chromium_profile"
