"""
Run browser-use Agent in a subprocess with step logging (for Streamlit live updates).
"""

from __future__ import annotations

import asyncio
import os
import sys
import traceback
from multiprocessing import get_context
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

# Streamlit touches this file to request a graceful stop (browser-use polls via should_stop callback)
PAUSE_FILE = _ROOT / ".pause_browser_use"


def _format_step(browser_state: Any, agent_output: Any, step_num: int) -> str:
    url = ""
    try:
        if browser_state is not None:
            u = getattr(browser_state, "url", None)
            if u is not None:
                url = str(u)
    except Exception:
        url = ""
    if len(url) > 100:
        url = "…" + url[-100:]

    snippet = ""
    for attr in ("next_goal", "thinking", "evaluation_previous_goal"):
        if agent_output is not None and hasattr(agent_output, attr):
            val = getattr(agent_output, attr, None)
            if val:
                snippet = str(val).replace("\n", " ")[:400]
                break
    if not snippet and agent_output is not None:
        snippet = repr(agent_output)[:400]

    return f"Step {step_num} | {url or '(no url)'} | {snippet}"


def _async_run(
    task: str,
    plan: str,
    memory_context: str,
    logs: Any,
    result_dict: Any,
    error_dict: Any,
) -> None:
    from dotenv import load_dotenv

    _repo = _ROOT.parent
    load_dotenv(_repo / ".env")
    load_dotenv(_repo / ".env.local")
    load_dotenv(_ROOT / ".env", override=False)
    load_dotenv(_ROOT / ".env.local", override=False)

    from browser_bootstrap import (
        apply_browser_use_event_timeouts,
        chrome_executable_kw,
        clear_stale_chromium_singleton_locks,
        patch_cdp_wait_timeout,
    )

    apply_browser_use_event_timeouts()
    patch_cdp_wait_timeout()

    from browser_use import Agent, Browser

    from agent_system_extras import agent_behavior_addon, agent_critical_preface
    from download_paths import (
        BROWSER_USE_AGENT_DATA_SUBDIR,
        browser_downloads_dir,
        browser_user_data_dir,
    )
    from llm_factory import build_llm

    downloads_dir = browser_downloads_dir()
    downloads_dir.mkdir(parents=True, exist_ok=True)
    profile_dir = browser_user_data_dir()
    profile_dir.mkdir(parents=True, exist_ok=True)
    clear_stale_chromium_singleton_locks(profile_dir)

    PAUSE_FILE.unlink(missing_ok=True)

    llm = build_llm()
    headless = (os.getenv("BROWSER_HEADLESS") or "false").lower() in ("1", "true", "yes")
    # Persistent profile (cookies / logins) + keep window alive until process exits
    keep_alive = (os.getenv("BROWSER_KEEP_ALIVE") or "true").lower() in ("1", "true", "yes")
    browser = Browser(
        headless=headless,
        window_size={"width": 1100, "height": 780},
        downloads_path=str(downloads_dir),
        accept_downloads=True,
        user_data_dir=str(profile_dir),
        keep_alive=keep_alive,
        **chrome_executable_kw(),
    )

    def on_step(browser_state, agent_output, step_num: int) -> None:
        try:
            line = _format_step(browser_state, agent_output, step_num)
            logs.append(line)
        except Exception as exc:  # noqa: BLE001
            logs.append(f"Step {step_num} | (log error: {exc})")

    max_steps = int(os.getenv("MAX_STEPS") or "60")
    extend = None
    if plan and plan.strip():
        extend = (
            "The user reviewed this plan. Use it as guidance and adapt if the page differs:\n"
            + plan.strip()
        )

    agent_files = downloads_dir / BROWSER_USE_AGENT_DATA_SUBDIR
    save_rules = (
        "When you use the write_file tool, files are stored on disk under this directory "
        f"(created automatically): {agent_files}. "
        f"Browser-triggered downloads (Save / Export) go to: {downloads_dir}. "
        "Do not claim you saved a file unless write_file succeeded or a real download completed."
    )
    if extend:
        extend = extend + "\n\n" + save_rules
    else:
        extend = save_rules

    if memory_context and memory_context.strip():
        extend = (
            memory_context.strip()
            + "\n\n---\n\n"
            + extend
        )

    extend = extend + agent_behavior_addon()
    extend = agent_critical_preface() + "\n\n---\n\n" + extend

    async def should_stop() -> bool:
        return PAUSE_FILE.exists()

    agent_kwargs: dict = {
        "task": task,
        "llm": llm,
        "browser": browser,
        "register_new_step_callback": on_step,
        "register_should_stop_callback": should_stop,
        "extend_system_message": extend,
        "available_file_paths": [str(downloads_dir)],
        "file_system_path": str(downloads_dir),
    }
    agent = Agent(**agent_kwargs)

    async def main() -> None:
        history = await agent.run(max_steps=max_steps)
        paused = PAUSE_FILE.exists()
        if paused:
            PAUSE_FILE.unlink(missing_ok=True)
        final = history.final_result()
        result_dict["final"] = final if final is not None else ""
        result_dict["paused"] = paused
        result_dict["done"] = True

    asyncio.run(main())


def run_browser_task(
    task: str,
    plan: str,
    memory_context: str,
    logs: Any,
    result_dict: Any,
    error_dict: Any,
) -> None:
    """Entry point for multiprocessing (must be top-level for spawn)."""
    try:
        _async_run(task, plan, memory_context, logs, result_dict, error_dict)
    except Exception:
        error_dict["error"] = traceback.format_exc()
        result_dict["paused"] = False
        result_dict["done"] = True
    finally:
        PAUSE_FILE.unlink(missing_ok=True)


def start_browser_job(task: str, plan: str, memory_context: str = ""):
    """Start a spawn subprocess that runs the agent. Returns (process, manager, logs, result_dict, error_dict)."""
    ctx = get_context("spawn")
    manager = ctx.Manager()
    logs = manager.list()
    result_dict = manager.dict()
    error_dict = manager.dict()
    result_dict["done"] = False

    proc = ctx.Process(
        target=run_browser_task,
        args=(task, plan, memory_context, logs, result_dict, error_dict),
    )
    proc.start()
    return proc, manager, logs, result_dict, error_dict
