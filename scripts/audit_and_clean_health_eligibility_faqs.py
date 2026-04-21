#!/usr/bin/env python3
"""Find and delete faqs rows that pair health-condition questions with eligibility-ish answers.

Audit: answer mentions coverage/qualify/eligible/likely (etc.) AND question mentions common conditions.
Then DELETE those rows. Requires DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_root))

from integrations.supabase.config import get_database_url  # noqa: E402

try:
    import psycopg
except ImportError:
    print("Install: pip install -r integrations/supabase/requirements.txt")
    raise SystemExit(1)


def _load_env() -> None:
    env_path = _root / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def main() -> int:
    _load_env()
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD", file=sys.stderr)
        return 1

    where = """
    (
      answer ~* 'coverage|qualif|eligible|likely|probable|obtener cobertura|puedes obtener|you can get|get coverage'
    )
    AND (
      question ~* 'diabetes|cancer|cáncer|heart attack|blood pressure|hypertension|copd|hiv|alzheimer|oxygen|nursing home|stroke|dialysis|medicamento|presión|presion|tengo (diabetes|cáncer|cancer)|condición médica|health condition'
    )
    """

    select_sql = f"SELECT id, question, answer FROM faqs WHERE {where} ORDER BY id;"

    with psycopg.connect(dsn, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute(select_sql)
            rows = cur.fetchall()
            print(f"audit: matched {len(rows)} FAQ row(s)")
            for rid, q, a in rows:
                qs = (q or "")[:120].replace("\n", " ")
                ans = (a or "")[:160].replace("\n", " ")
                print(f"  id={rid}\n    Q: {qs}\n    A: {ans}…")

            if not rows:
                conn.commit()
                print("delete: nothing to remove")
                return 0

            del_sql = f"DELETE FROM faqs WHERE {where} RETURNING id;"
            cur.execute(del_sql)
            deleted = cur.fetchall()
            conn.commit()
            print(f"delete: removed {len(deleted)} row(s) ids={[r[0] for r in deleted]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
