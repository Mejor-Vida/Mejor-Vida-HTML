"""
Load Assurity-style rate grids from Supabase for website quote math.
Maps DB rows into the same dict shapes used by export_hero_carousel_quotes.
"""

from __future__ import annotations

import os
import sys
import uuid
from pathlib import Path
from typing import Any

_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_root))

from integrations.supabase.config import get_database_url  # noqa: E402
from integrations.supabase.db_pool import get_pool  # noqa: E402

try:
    import psycopg
except ImportError:
    psycopg = None  # type: ignore


def resolve_active_product_version_id(
    conn: Any,
    carrier_slug: str | None = None,
    product_slug: str | None = None,
    version_code: str | None = None,
) -> uuid.UUID | None:
    carrier_slug = (carrier_slug or os.environ.get("QUOTE_DB_CARRIER_SLUG") or "assurity").strip()
    product_slug = (product_slug or os.environ.get("QUOTE_DB_PRODUCT_SLUG") or "whole_life_protect_plus").strip()
    version_code = (version_code or os.environ.get("QUOTE_DB_VERSION_CODE") or "").strip() or None

    with conn.cursor() as cur:
        if version_code:
            cur.execute(
                """
                SELECT pv.id
                FROM product_versions pv
                JOIN products p ON p.id = pv.product_id
                JOIN carriers c ON c.id = p.carrier_id
                WHERE c.slug = %s AND p.slug = %s AND pv.version_code = %s
                LIMIT 1
                """,
                (carrier_slug, product_slug, version_code),
            )
        else:
            cur.execute(
                """
                SELECT pv.id
                FROM product_versions pv
                JOIN products p ON p.id = pv.product_id
                JOIN carriers c ON c.id = p.carrier_id
                WHERE c.slug = %s AND p.slug = %s AND pv.is_active = true
                ORDER BY pv.effective_from DESC NULLS LAST
                LIMIT 1
                """,
                (carrier_slug, product_slug),
            )
        row = cur.fetchone()
        return row[0] if row else None


def load_grids_for_version(conn: Any, product_version_id: uuid.UUID) -> tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]:
    """
    Returns:
      base: age -> (monthly_male_10k, monthly_female_10k)
      mults: face_amount -> (mult_male, mult_female)
    """
    base: dict[int, tuple[float, float]] = {}
    mults: dict[int, tuple[float, float]] = {}

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT rt.id FROM rate_tables rt
            WHERE rt.product_version_id = %s AND rt.table_kind = 'monthly_10k_base'
            LIMIT 1
            """,
            (str(product_version_id),),
        )
        rt_row = cur.fetchone()
        if not rt_row:
            return {}, {}
        rate_table_id = rt_row[0]
        cur.execute(
            """
            SELECT issue_age, monthly_male_10k::float, monthly_female_10k::float
            FROM rate_rows
            WHERE rate_table_id = %s
            ORDER BY issue_age
            """,
            (str(rate_table_id),),
        )
        for age, m, f in cur.fetchall():
            base[int(age)] = (float(m), float(f))

        cur.execute(
            """
            SELECT face_amount, multiplier_male::float, multiplier_female::float
            FROM coverage_multipliers
            WHERE product_version_id = %s
            ORDER BY face_amount
            """,
            (str(product_version_id),),
        )
        for face, mm, mf in cur.fetchall():
            mults[int(face)] = (float(mm), float(mf))

    return base, mults


def load_quote_grids_from_supabase() -> tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]:
    """Active Assurity (or QUOTE_DB_*) product version — single grid (legacy callers)."""
    if psycopg is None:
        raise RuntimeError("psycopg is required: pip install psycopg[binary]")
    dsn = get_database_url()
    if not dsn:
        raise RuntimeError("DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD not set")
    with get_pool().connection() as conn:
        vid = resolve_active_product_version_id(conn)
        if not vid:
            raise RuntimeError(
                "No active product_version in DB. Run import_from_sheets.py or seed_sample.sql."
            )
        return load_grids_for_version(conn, vid)


# Assurity only — MoO uses moo_living_promise_rates + formula (see quote_engine).
QUOTE_GRID_PRODUCTS: tuple[tuple[str, str, str], ...] = (
    ("assurity", "assurity", "whole_life_protect_plus"),
)

# Mutual of Omaha Living Promise (NE): three product slugs (tobacco routing in quote_engine).
MOO_LP_PRODUCT_SLUGS: tuple[str, ...] = (
    "living_promise_level_nt",
    "living_promise_level_t",
    "living_promise_graded",
)

MooLpRateRow = dict[str, float | int]
MooLpRatesBySlug = dict[str, dict[tuple[int, str], MooLpRateRow]]


def load_moo_lp_rates_from_supabase(conn: Any) -> MooLpRatesBySlug:
    """
    Load base_rate_per_1k rows for all MoO LP products. Keys: product_slug -> (age, gender) -> row.
    """
    out: MooLpRatesBySlug = {}
    with conn.cursor() as cur:
        for slug in MOO_LP_PRODUCT_SLUGS:
            vid = resolve_active_product_version_id(
                conn, carrier_slug="mutual-of-omaha", product_slug=slug
            )
            if not vid:
                continue
            try:
                cur.execute(
                    """
                    SELECT issue_age, gender, base_rate_per_1k::float, policy_fee_annual::float,
                           modal_factor::float, min_face, max_face
                    FROM moo_living_promise_rates
                    WHERE product_version_id = %s::uuid
                    """,
                    (str(vid),),
                )
            except Exception:
                continue
            inner: dict[tuple[int, str], MooLpRateRow] = {}
            for row in cur.fetchall():
                age, gender, br, fee, modal, minf, maxf = row
                inner[(int(age), str(gender))] = {
                    "base_rate_per_1k": float(br),
                    "policy_fee_annual": float(fee),
                    "modal_factor": float(modal),
                    "min_face": int(minf),
                    "max_face": int(maxf),
                }
            if inner:
                out[slug] = inner
    return out


def load_quote_grids_by_carrier_from_supabase() -> dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]]:
    """Assurity-style multiplier grids only."""
    if psycopg is None:
        raise RuntimeError("psycopg is required: pip install psycopg[binary]")
    dsn = get_database_url()
    if not dsn:
        raise RuntimeError("DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD not set")
    out: dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]] = {}
    with get_pool().connection() as conn:
        for grid_key, carrier_slug, product_slug in QUOTE_GRID_PRODUCTS:
            vid = resolve_active_product_version_id(
                conn, carrier_slug=carrier_slug, product_slug=product_slug
            )
            if not vid:
                continue
            base, mults = load_grids_for_version(conn, vid)
            if base and mults:
                out[grid_key] = (base, mults)
    return out


def load_quote_bundle_from_supabase() -> tuple[
    dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]],
    MooLpRatesBySlug,
]:
    """
    Assurity grids + MoO LP base-rate tables. Either may be empty if not imported.
    Raises if both are empty.
    """
    if psycopg is None:
        raise RuntimeError("psycopg is required: pip install psycopg[binary]")
    dsn = get_database_url()
    if not dsn:
        raise RuntimeError("DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD not set")
    with get_pool().connection() as conn:
        grids = {}
        for grid_key, carrier_slug, product_slug in QUOTE_GRID_PRODUCTS:
            vid = resolve_active_product_version_id(
                conn, carrier_slug=carrier_slug, product_slug=product_slug
            )
            if not vid:
                continue
            base, mults = load_grids_for_version(conn, vid)
            if base and mults:
                grids[grid_key] = (base, mults)
        moo = load_moo_lp_rates_from_supabase(conn)
    if not grids and not moo:
        raise RuntimeError(
            "No quote data in DB. Import Assurity (import_from_sheets.py) and/or "
            "MoO LP CSVs (import_moo_lp_csv.py after migration 004)."
        )
    return grids, moo


def quote_backend_label() -> str:
    return "supabase"
