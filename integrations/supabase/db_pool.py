"""Shared psycopg connection pool for the quote API — fewer handshakes to Supabase pooler."""

from __future__ import annotations

import os
import threading
from typing import Any

from integrations.supabase.config import get_database_url

try:
    from psycopg_pool import ConnectionPool
except ImportError:
    ConnectionPool = None  # type: ignore[misc, assignment]

_pool: Any = None
_lock = threading.Lock()


def get_pool() -> "ConnectionPool":
    """Lazy singleton pool. Tune via SUPABASE_POOL_MIN_SIZE / SUPABASE_POOL_MAX_SIZE."""
    if ConnectionPool is None:
        raise RuntimeError("psycopg-pool required: pip install psycopg-pool")
    global _pool
    if _pool is None:
        with _lock:
            if _pool is None:
                dsn = get_database_url()
                if not dsn:
                    raise RuntimeError(
                        "DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD not set"
                    )
                # Default min_size=0: no connections at startup (avoids deploy-time pooler spikes).
                min_size = max(0, int(os.environ.get("SUPABASE_POOL_MIN_SIZE", "0")))
                max_size = int(os.environ.get("SUPABASE_POOL_MAX_SIZE", "3"))
                if max_size < 1:
                    max_size = 1
                _pool = ConnectionPool(
                    conninfo=dsn,
                    kwargs={
                        "prepare_threshold": 0,
                        "connect_timeout": 15,
                    },
                    min_size=min_size,
                    max_size=max_size,
                    timeout=float(os.environ.get("SUPABASE_POOL_WAIT_TIMEOUT", "30")),
                    max_waiting=int(os.environ.get("SUPABASE_POOL_MAX_WAITING", "20")),
                    name="mvs_quote",
                )
    return _pool
