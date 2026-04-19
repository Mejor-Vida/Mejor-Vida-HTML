"""
Long-lived asyncio thread: one Browser instance reused across tasks (same window / session).
"""

from __future__ import annotations

import asyncio
import os
import queue
import sys
import threading
import traceback
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from browser_bootstrap import (  # noqa: E402
    apply_browser_use_event_timeouts,
    chrome_executable_kw,
    clear_stale_chromium_singleton_locks,
    patch_cdp_wait_timeout,
)

apply_browser_use_event_timeouts()
patch_cdp_wait_timeout()

PAUSE_FILE = _ROOT / ".pause_browser_use"


def _format_step(browser_state: Any, agent_output: Any, step_num: int) -> str:
    """Single short line for chat (max ~140 chars)."""
    url = ""
    try:
        if browser_state is not None:
            u = getattr(browser_state, "url", None)
            if u is not None:
                url = str(u)
    except Exception:
        url = ""
    host = ""
    if url and url.startswith("http"):
        try:
            from urllib.parse import urlparse

            host = urlparse(url).netloc or url[:40]
        except Exception:
            host = url[:40]
    if len(url) > 80:
        url = "…" + url[-60:]

    next_goal = ""
    thinking = ""
    if agent_output is not None:
        if hasattr(agent_output, "next_goal"):
            val = getattr(agent_output, "next_goal", None)
            if val:
                next_goal = str(val).replace("\n", " ").strip()
        if not next_goal and hasattr(agent_output, "thinking"):
            val = getattr(agent_output, "thinking", None)
            if val:
                thinking = str(val).replace("\n", " ").strip()
        if not next_goal and not thinking:
            thinking = repr(agent_output)[:100]

    # ACTION = model chose a concrete next move; THINKING = reasoning only / no next_goal yet
    if next_goal:
        kind = "ACTION"
        short = next_goal
    elif thinking:
        kind = "THINKING"
        short = thinking
    elif host:
        kind = "ACTION"
        short = f"on {host}"
    elif url:
        kind = "ACTION"
        short = url
    else:
        kind = "THINKING"
        short = "Working…"

    if len(short) > 110:
        short = short[:107] + "…"
    line = f"{kind}: Step {step_num}: {short}"
    if len(line) > 160:
        line = line[:157] + "…"
    return line


class AgentWorker:
    """Singleton worker: one event-loop thread, one Browser, sequential tasks."""

    _instance: AgentWorker | None = None

    def __init__(self) -> None:
        self._thread: threading.Thread | None = None
        self._loop: asyncio.AbstractEventLoop | None = None
        self._ready = threading.Event()
        self._task_queue: queue.Queue[dict[str, str] | None] = queue.Queue()
        self._result_queue: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=32)

        self._logs: list[str] = []
        self._log_lock = threading.Lock()
        self._running = threading.Event()
        self._browser = None

    @classmethod
    def instance(cls) -> AgentWorker:
        if cls._instance is None:
            cls._instance = AgentWorker()
        return cls._instance

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._ready.clear()
        self._thread = threading.Thread(target=self._thread_main, name="browser-use-worker", daemon=True)
        self._thread.start()
        if not self._ready.wait(timeout=120):
            raise RuntimeError("Agent worker thread failed to start.")

    def _thread_main(self) -> None:
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)
        self._ready.set()
        self._loop.run_until_complete(self._consume_forever())

    async def _consume_forever(self) -> None:
        from dotenv import load_dotenv

        _repo = _ROOT.parent
        load_dotenv(_repo / ".env")
        load_dotenv(_repo / ".env.local")
        load_dotenv(_ROOT / ".env", override=False)
        load_dotenv(_ROOT / ".env.local", override=False)

        loop = asyncio.get_running_loop()
        while True:
            item = await loop.run_in_executor(None, self._task_queue.get)
            if item is None:
                break
            await self._run_one(item)

    async def _run_one(self, item: dict[str, str]) -> None:
        from browser_use import Agent, Browser

        from agent_system_extras import agent_behavior_addon, agent_critical_preface
        from download_paths import (
            BROWSER_USE_AGENT_DATA_SUBDIR,
            browser_downloads_dir,
            browser_user_data_dir,
        )
        from llm_factory import build_llm

        task = item.get("task") or ""
        plan = item.get("plan") or ""
        memory_context = item.get("memory_context") or ""

        PAUSE_FILE.unlink(missing_ok=True)

        downloads_dir = browser_downloads_dir()
        downloads_dir.mkdir(parents=True, exist_ok=True)
        profile_dir = browser_user_data_dir()
        profile_dir.mkdir(parents=True, exist_ok=True)

        llm = build_llm()
        if self._browser is None:
            clear_stale_chromium_singleton_locks(profile_dir)
            headless = (os.getenv("BROWSER_HEADLESS") or "false").lower() in ("1", "true", "yes")
            keep_alive = (os.getenv("BROWSER_KEEP_ALIVE") or "true").lower() in ("1", "true", "yes")
            self._browser = Browser(
                headless=headless,
                window_size={"width": 1100, "height": 780},
                downloads_path=str(downloads_dir),
                accept_downloads=True,
                user_data_dir=str(profile_dir),
                keep_alive=keep_alive,
                **chrome_executable_kw(),
            )

        with self._log_lock:
            self._logs.clear()

        def on_step(browser_state: Any, agent_output: Any, step_num: int) -> None:
            try:
                line = _format_step(browser_state, agent_output, step_num)
                with self._log_lock:
                    self._logs.append(line)
            except Exception as exc:  # noqa: BLE001
                with self._log_lock:
                    self._logs.append(f"Step {step_num} | (log error: {exc})")

        max_steps = int(os.getenv("MAX_STEPS") or "60")
        extend = None
        if plan.strip():
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

        if memory_context.strip():
            extend = memory_context.strip() + "\n\n---\n\n" + extend

        extend = extend + agent_behavior_addon()
        extend = agent_critical_preface() + "\n\n---\n\n" + extend

        async def should_stop() -> bool:
            return PAUSE_FILE.exists()

        agent_kwargs: dict = {
            "task": task,
            "llm": llm,
            "browser": self._browser,
            "register_new_step_callback": on_step,
            "register_should_stop_callback": should_stop,
            "extend_system_message": extend,
            "available_file_paths": [str(downloads_dir)],
            # Without this, browser-use writes to a temp dir under /tmp — not Desktop/Browser-Use Downloads.
            "file_system_path": str(downloads_dir),
        }
        agent = Agent(**agent_kwargs)

        self._running.set()
        try:
            history = await agent.run(max_steps=max_steps)
            paused = PAUSE_FILE.exists()
            if paused:
                PAUSE_FILE.unlink(missing_ok=True)
            final = history.final_result()
            self._result_queue.put(
                {
                    "ok": True,
                    "final": final if final is not None else "",
                    "paused": paused,
                }
            )
        except Exception:
            self._result_queue.put(
                {
                    "ok": False,
                    "error": traceback.format_exc(),
                    "paused": False,
                }
            )
        finally:
            self._running.clear()
            PAUSE_FILE.unlink(missing_ok=True)

    def submit(self, task: str, memory_context: str, plan: str = "") -> None:
        self.start()
        # Clear before enqueue so the UI cannot flush old step lines with cursor=0 before _run_one starts.
        with self._log_lock:
            self._logs.clear()
        self._task_queue.put(
            {
                "task": task,
                "memory_context": memory_context,
                "plan": plan,
            }
        )

    def is_running(self) -> bool:
        return self._running.is_set()

    def get_logs(self) -> list[str]:
        with self._log_lock:
            return list(self._logs)

    def pop_result(self) -> dict[str, Any] | None:
        try:
            return self._result_queue.get_nowait()
        except queue.Empty:
            return None
