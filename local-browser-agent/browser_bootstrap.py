"""
Tune browser-use timeouts, CDP wait, and stale Chromium profile locks.

browser-use defaults to 30s for BrowserLaunchEvent / BrowserStartEvent; slow Macs or a
busy profile can exceed that. LocalBrowserWatchdog also hardcodes a 30s CDP poll loop.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

_cdp_patch_done = False


def apply_browser_use_event_timeouts() -> None:
    """Raise bubus handler timeouts unless the user already set them."""
    os.environ.setdefault("TIMEOUT_BrowserLaunchEvent", "120")
    os.environ.setdefault("TIMEOUT_BrowserStartEvent", "120")


def patch_cdp_wait_timeout() -> None:
    """Extend LocalBrowserWatchdog._wait_for_cdp_url using BROWSER_CDP_WAIT_SECONDS (default 90)."""
    global _cdp_patch_done
    if _cdp_patch_done:
        return
    try:
        seconds = float(os.getenv("BROWSER_CDP_WAIT_SECONDS", "90"))
    except ValueError:
        seconds = 90.0

    from browser_use.browser.watchdogs.local_browser_watchdog import LocalBrowserWatchdog

    _orig = LocalBrowserWatchdog._wait_for_cdp_url

    async def _wrapped(port: int, timeout: float = 30) -> str:
        return await _orig(port, max(timeout, seconds))

    LocalBrowserWatchdog._wait_for_cdp_url = staticmethod(_wrapped)
    _cdp_patch_done = True


def _process_using_user_data_dir(profile_dir: Path) -> bool:
    try:
        import psutil
    except ImportError:
        return False
    needle = str(profile_dir.resolve())
    for proc in psutil.process_iter(["cmdline"]):
        try:
            cmd = proc.info.get("cmdline") or []
            if not cmd:
                continue
            joined = " ".join(cmd)
            if "user-data-dir" not in joined:
                continue
            if needle in joined:
                return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False


def clear_stale_chromium_singleton_locks(profile_dir: Path) -> None:
    """
    If Chrome left SingletonLock behind (crash / force-quit) and no process uses this
    profile, remove lock files so the next launch can bind CDP.
    """
    if os.getenv("BROWSER_SKIP_STALE_LOCK_CLEANUP", "").lower() in ("1", "true", "yes"):
        return
    profile_dir = profile_dir.resolve()
    lock = profile_dir / "SingletonLock"
    if not lock.is_file():
        return
    if _process_using_user_data_dir(profile_dir):
        return
    for name in ("SingletonLock", "SingletonSocket", "SingletonCookie"):
        p = profile_dir / name
        if p.exists():
            try:
                p.unlink()
            except OSError:
                pass


def chrome_executable_kw() -> dict[str, Any]:
    """Optional explicit Chrome/Chromium path (helps when discovery picks a broken binary)."""
    exe = (os.getenv("BROWSER_EXECUTABLE") or os.getenv("CHROME_PATH") or "").strip()
    if exe:
        return {"executable_path": exe}
    return {}
