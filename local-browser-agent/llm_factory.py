"""Build the browser-use LLM from environment (no UI logic)."""

from __future__ import annotations

import os


def build_llm():
    """Return a browser-use chat model. See .env.example for providers."""
    provider = (os.getenv("LLM_PROVIDER") or "openai").strip().lower()

    if provider == "browser_use":
        from browser_use import ChatBrowserUse

        model = os.getenv("BROWSER_USE_MODEL") or "bu-latest"
        return ChatBrowserUse(model=model)

    if provider == "anthropic":
        from browser_use import ChatAnthropic

        model = os.getenv("ANTHROPIC_MODEL") or "claude-sonnet-4-0"
        return ChatAnthropic(model=model)

    if provider == "google":
        from browser_use import ChatGoogle

        model = os.getenv("GOOGLE_MODEL") or "gemini-flash-latest"
        return ChatGoogle(model=model)

    from browser_use import ChatOpenAI

    model = os.getenv("OPENAI_MODEL") or "gpt-4o"
    return ChatOpenAI(model=model)
