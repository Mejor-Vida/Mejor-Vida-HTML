#!/usr/bin/env python3
"""
enrich_trades.py — Enrich Schwab brokerage CSV with hold metrics and earnings overlap.

Requires: pip install pandas yfinance

Input CSV columns (names normalized, case-insensitive):
  Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount

Default output: **one row per symbol** with Symbol plus:
  Hold_Start, Hold_End, Hold_Days, Avg_Buy_Price, Avg_Sell_Price,
  PnL, Pct_Return, Position_Status, Earnings_During_Hold,
  Earnings_Date_During_Hold

Use --per-transaction to attach enrichment to every original CSV row (legacy).
"""

from __future__ import annotations

import argparse
import contextlib
import io
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeout
from typing import Any

import pandas as pd

PROGRESS_EVERY = 10
SAVE_EVERY = 25
SYMBOL_FETCH_TIMEOUT_SEC = 10.0
# Pause between Yahoo Finance calls to reduce rate-limit errors (HTTP 429).
RATE_LIMIT_PAUSE_SEC = 0.35

try:
    import yfinance as yf
except ImportError:
    print("Install yfinance: pip install yfinance", file=sys.stderr)
    raise

# Flexible column lookup (Schwab exports may vary slightly)
COL_ALIASES = {
    "date": ["date"],
    "action": ["action"],
    "symbol": ["symbol"],
    "description": ["description"],
    "quantity": ["quantity", "qty"],
    "price": ["price"],
    "fees": ["fees & comm", "fees & commissions", "fees", "commission"],
    "amount": ["amount"],
}


def _norm_col(s: str) -> str:
    return re.sub(r"\s+", " ", str(s).strip().lower())


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    mapping = {}
    lowered = {_norm_col(c): c for c in df.columns}
    for key, aliases in COL_ALIASES.items():
        for a in aliases:
            na = _norm_col(a)
            if na in lowered:
                mapping[key] = lowered[na]
                break
        if key not in mapping:
            raise ValueError(f"Missing required column matching {key}: {aliases}")
    out = df.rename(
        columns={
            mapping["date"]: "Date",
            mapping["action"]: "Action",
            mapping["symbol"]: "Symbol",
            mapping["description"]: "Description",
            mapping["quantity"]: "Quantity",
            mapping["price"]: "Price",
            mapping["fees"]: "Fees_Comm",
            mapping["amount"]: "Amount",
        }
    )
    return out


def _is_buy(action: str) -> bool:
    a = str(action).strip().lower()
    return "buy" in a and "sell" not in a


def _is_sell(action: str) -> bool:
    a = str(action).strip().lower()
    return "sell" in a


def _parse_dates(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce", utc=False)


def _safe_float(x: Any) -> float:
    try:
        if pd.isna(x):
            return float("nan")
        return float(x)
    except (TypeError, ValueError):
        return float("nan")


def _dates_from_earnings_df(ed: Any) -> list[pd.Timestamp]:
    """Extract normalized dates from get_earnings_dates / earnings_dates DataFrame."""
    dates: list[pd.Timestamp] = []
    if ed is None:
        return dates
    try:
        if hasattr(ed, "empty") and ed.empty:
            return dates
        if len(ed) == 0:
            return dates
    except Exception:
        return dates
    try:
        for ts in ed.index:
            t = pd.Timestamp(ts)
            if t.tzinfo is not None:
                t = t.tz_convert("UTC").tz_localize(None)
            dates.append(t.normalize())
    except Exception:
        pass
    return dates


def fetch_earnings_dates(symbol: str) -> list[pd.Timestamp]:
    """Return sorted unique earnings dates. Fallback order: earnings_dates → get_earnings_dates → calendar."""
    sym = str(symbol).strip().upper()
    if not sym:
        return []
    dates: list[pd.Timestamp] = []
    try:
        t = yf.Ticker(sym)

        # 1) ticker.earnings_dates (property or DataFrame)
        try:
            ed1 = getattr(t, "earnings_dates", None)
            if callable(ed1):
                try:
                    ed1 = ed1()
                except Exception:
                    ed1 = None
            dates.extend(_dates_from_earnings_df(ed1))
        except Exception:
            pass

        # 2) get_earnings_dates(limit=40)
        if not dates:
            try:
                ed2 = t.get_earnings_dates(limit=40)
                dates.extend(_dates_from_earnings_df(ed2))
            except Exception:
                pass

        # 3) calendar (yfinance may return DataFrame or dict with 'Earnings Date')
        if not dates:
            try:
                cal = getattr(t, "calendar", None)
                if isinstance(cal, dict):
                    raw = cal.get("Earnings Date")
                    if raw is not None:
                        if isinstance(raw, (list, tuple)):
                            for item in raw:
                                if item is not None and not pd.isna(item):
                                    dates.append(pd.Timestamp(item).normalize())
                        else:
                            dates.append(pd.Timestamp(raw).normalize())
                elif cal is not None and isinstance(cal, pd.DataFrame) and not cal.empty:
                    for col in cal.columns:
                        if "earn" in str(col).lower():
                            raw = cal[col].iloc[0] if len(cal.index) else None
                            if raw is not None and not pd.isna(raw):
                                dates.append(pd.Timestamp(raw).normalize())
            except Exception:
                pass

        seen = set()
        out: list[pd.Timestamp] = []
        for d in sorted(dates):
            key = d.normalize()
            if key not in seen:
                seen.add(key)
                out.append(key)
        return out
    except Exception:
        return []


def fetch_earnings_dates_quiet(symbol: str) -> list[pd.Timestamp]:
    """Same as fetch_earnings_dates but suppresses yfinance noise on stderr (keep stdout)."""
    err_buf = io.StringIO()
    with contextlib.redirect_stderr(err_buf):
        return fetch_earnings_dates(symbol)


def earnings_in_range(
    earnings: list[pd.Timestamp],
    start: pd.Timestamp | pd.NaTType,
    end: pd.Timestamp | pd.NaTType,
) -> tuple[str, str]:
    """Return ('Yes'|'No', comma-separated ISO dates or empty)."""
    if pd.isna(start) or not earnings:
        return "No", ""
    start_n = pd.Timestamp(start).normalize()
    end_n = pd.Timestamp(end).normalize() if not pd.isna(end) else pd.Timestamp.today().normalize()
    if end_n < start_n:
        start_n, end_n = end_n, start_n
    hits = [e for e in earnings if start_n <= e <= end_n]
    if not hits:
        return "No", ""
    iso = ",".join(d.strftime("%Y-%m-%d") for d in sorted(set(hits)))
    return "Yes", iso


def compute_symbol_metrics(
    sym_df: pd.DataFrame,
    earnings_by_symbol: dict[str, list[pd.Timestamp]],
) -> dict[str, Any]:
    """Aggregate metrics for one symbol's trade rows (already filtered)."""
    sym_df = sym_df.sort_values("Date").copy()
    sym_df["Qty_num"] = sym_df["Quantity"].apply(_safe_float)
    sym_df["Price_num"] = sym_df["Price"].apply(_safe_float)
    sym_df["Amount_num"] = sym_df["Amount"].apply(_safe_float)

    buys = sym_df[sym_df["Action"].map(_is_buy)]
    sells = sym_df[sym_df["Action"].map(_is_sell)]

    buy_qty = buys["Qty_num"].sum()
    sell_qty = sells["Qty_num"].sum()
    net_qty = buy_qty - sell_qty

    # Weighted averages (Schwab Quantity usually positive for both; Action indicates side)
    avg_buy = float("nan")
    if buy_qty > 0 and len(buys):
        avg_buy = float((buys["Qty_num"] * buys["Price_num"]).sum() / buy_qty)

    avg_sell = float("nan")
    if sell_qty > 0 and len(sells):
        avg_sell = float((sells["Qty_num"] * sells["Price_num"]).sum() / sell_qty)

    hold_start = buys["Date"].min() if len(buys) else pd.NaT
    hold_end_sells = sells["Date"].max() if len(sells) else pd.NaT

    # Position status
    if pd.isna(net_qty) or abs(net_qty) < 1e-9:
        status = "Closed"
        hold_end = hold_end_sells if not pd.isna(hold_end_sells) else pd.NaT
    else:
        status = "Open"
        hold_end = hold_end_sells if not pd.isna(hold_end_sells) else pd.NaT

    # Hold days
    hold_days = pd.NA
    if not pd.isna(hold_start):
        end_for_days = hold_end if not pd.isna(hold_end) else pd.Timestamp.today().normalize()
        if status == "Open" and pd.isna(hold_end):
            end_for_days = pd.Timestamp.today().normalize()
        hold_days = max(0, (end_for_days.normalize() - hold_start.normalize()).days)

    # PnL: sum Amount on rows we treated as equity trades (Schwab: buys negative, sells positive)
    trade_rows = sym_df[sym_df["Action"].map(lambda a: _is_buy(a) or _is_sell(a))]
    pnl = float(trade_rows["Amount_num"].sum()) if len(trade_rows) else float("nan")

    buy_amount_sum = float(trade_rows[trade_rows["Action"].map(_is_buy)]["Amount_num"].sum())
    pct_return = float("nan")
    if buy_amount_sum != 0 and not pd.isna(pnl):
        # Schwab: buy Amount is typically negative; scale % vs absolute dollars in
        pct_return = float(pnl / abs(buy_amount_sum) * 100.0)

    sym = str(sym_df["Symbol"].iloc[0]).strip().upper()
    earnings = earnings_by_symbol.get(sym, [])

    # Earnings window: closed uses hold_start..hold_end; open uses hold_start..today
    if status == "Closed" and not pd.isna(hold_start) and not pd.isna(hold_end):
        er_start, er_end = hold_start, hold_end
    elif not pd.isna(hold_start):
        er_start = hold_start
        er_end = hold_end if not pd.isna(hold_end) else pd.Timestamp.today().normalize()
    else:
        er_start, er_end = pd.NaT, pd.NaT

    earn_yn, earn_dates = earnings_in_range(earnings, er_start, er_end)

    return {
        "Hold_Start": hold_start,
        "Hold_End": hold_end if not pd.isna(hold_end) else "",
        "Hold_Days": hold_days,
        "Avg_Buy_Price": avg_buy if buy_qty > 0 else "",
        "Avg_Sell_Price": avg_sell if sell_qty > 0 else "",
        "PnL": pnl if not pd.isna(pnl) else "",
        "Pct_Return": pct_return if not pd.isna(pct_return) else "",
        "Position_Status": status,
        "Earnings_During_Hold": earn_yn,
        "Earnings_Date_During_Hold": earn_dates,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich Schwab CSV with hold + earnings data.")
    parser.add_argument("input_csv", help="Path to Schwab brokerage CSV")
    parser.add_argument(
        "-o",
        "--output",
        default="trades_enriched.csv",
        help="Output CSV path (default: trades_enriched.csv)",
    )
    parser.add_argument(
        "--per-transaction",
        action="store_true",
        help="Attach enrichment to every input row (legacy). Default: one row per symbol.",
    )
    parser.add_argument(
        "--symbol-timeout",
        type=float,
        default=SYMBOL_FETCH_TIMEOUT_SEC,
        help=f"Seconds to wait for yfinance per symbol (default: {SYMBOL_FETCH_TIMEOUT_SEC}).",
    )
    args = parser.parse_args()

    df_raw = pd.read_csv(args.input_csv)
    df = normalize_columns(df_raw.copy())

    df["Date"] = _parse_dates(df["Date"])
    bad_dates = df["Date"].isna()
    if bad_dates.any():
        print(f"Warning: {bad_dates.sum()} row(s) with unparseable Date — dropped.", file=sys.stderr)
        df = df[~bad_dates].copy()

    df["Symbol"] = df["Symbol"].astype(str).str.strip().str.upper()

    # Optional: restrict to rows that look like equity Buy/Sell (skip dividends, etc.)
    equity_mask = df["Action"].map(lambda a: _is_buy(a) or _is_sell(a))
    df_equity = df[equity_mask].copy()

    symbols = sorted(df_equity["Symbol"].dropna().unique())
    total_syms = len(symbols)

    EMPTY_METRICS = {
        "Hold_Start": "",
        "Hold_End": "",
        "Hold_Days": "",
        "Avg_Buy_Price": "",
        "Avg_Sell_Price": "",
        "PnL": "",
        "Pct_Return": "",
        "Position_Status": "",
        "Earnings_During_Hold": "No",
        "Earnings_Date_During_Hold": "",
    }

    enrich_cols = [
        "Hold_Start",
        "Hold_End",
        "Hold_Days",
        "Avg_Buy_Price",
        "Avg_Sell_Price",
        "PnL",
        "Pct_Return",
        "Position_Status",
        "Earnings_During_Hold",
        "Earnings_Date_During_Hold",
    ]

    def fmt_cell(val: Any) -> str:
        if val is pd.NA:
            return ""
        try:
            if pd.isna(val):
                return ""
        except (TypeError, ValueError):
            pass
        if isinstance(val, pd.Timestamp):
            return "" if pd.isna(val) else val.strftime("%Y-%m-%d")
        if isinstance(val, (int, float)) and not isinstance(val, bool):
            return str(val)
        return str(val) if val is not None else ""

    earnings_by_symbol: dict[str, list[pd.Timestamp]] = {}
    metrics_by_symbol: dict[str, dict[str, Any]] = {}
    symbol_rows_done: list[dict[str, Any]] = []

    timeout_sec = float(args.symbol_timeout)

    if total_syms == 0:
        pd.DataFrame(columns=["Symbol", *enrich_cols]).to_csv(args.output, index=False)
        print()
        print(f"✓ Done! Wrote 0 rows to {args.output}")
        print("  - Symbols with earnings data: 0")
        print("  - Symbols with no earnings data: 0")
        print("  - Earnings-exposed trades: 0")
        return

    with ThreadPoolExecutor(max_workers=1) as executor:
        for idx, sym in enumerate(symbols, start=1):
            if idx == 1 or idx % PROGRESS_EVERY == 0:
                print(f"[{idx}/{total_syms}] Processing {sym}...", flush=True)

            fut = executor.submit(fetch_earnings_dates_quiet, sym)
            try:
                earnings_by_symbol[sym] = fut.result(timeout=timeout_sec)
            except FutureTimeout:
                earnings_by_symbol[sym] = []
            except Exception:
                earnings_by_symbol[sym] = []

            sdf = df_equity[df_equity["Symbol"] == sym]
            try:
                metrics_by_symbol[sym] = compute_symbol_metrics(sdf, earnings_by_symbol)
            except Exception as e:
                print(f"Warning: metrics failed for {sym}: {e}", file=sys.stderr)
                metrics_by_symbol[sym] = dict(EMPTY_METRICS)

            if not args.per_transaction:
                row_out = {"Symbol": sym}
                for c in enrich_cols:
                    row_out[c] = fmt_cell(metrics_by_symbol[sym].get(c, ""))
                symbol_rows_done.append(row_out)

                if idx % SAVE_EVERY == 0 or idx == total_syms:
                    pd.DataFrame(symbol_rows_done).to_csv(args.output, index=False)

            time.sleep(RATE_LIMIT_PAUSE_SEC)

    # Symbols present in file but without Buy/Sell rows (for per-transaction merge only)
    all_syms = sorted(df["Symbol"].dropna().astype(str).str.strip().str.upper().unique())
    for sym in all_syms:
        if sym not in metrics_by_symbol:
            metrics_by_symbol[sym] = dict(EMPTY_METRICS)

    meta_rows = []
    for sym, m in metrics_by_symbol.items():
        row = {"_sym_key": sym}
        for c in enrich_cols:
            row[c] = fmt_cell(m.get(c, ""))
        meta_rows.append(row)

    meta_df = pd.DataFrame(meta_rows)

    if args.per_transaction:
        base = df_raw.copy()
        norm = normalize_columns(base.copy())
        base["_sym_key"] = norm["Symbol"].astype(str).str.strip().str.upper()
        out = base.merge(meta_df, on="_sym_key", how="left").drop(columns=["_sym_key"])
        out.to_csv(args.output, index=False)
    else:
        out = pd.DataFrame(symbol_rows_done)
        out.to_csv(args.output, index=False)

    earn_ok = sum(1 for s in symbols if len(earnings_by_symbol.get(s, [])) > 0)
    earn_fail = len(symbols) - earn_ok
    earnings_exposed = sum(
        1
        for s in symbols
        if str(metrics_by_symbol.get(s, {}).get("Earnings_During_Hold", "")).strip() == "Yes"
    )

    print()
    print(f"✓ Done! Wrote {len(out)} rows to {args.output}")
    print(f"  - Symbols with earnings data: {earn_ok}")
    print(f"  - Symbols with no earnings data: {earn_fail}")
    print(f"  - Earnings-exposed trades: {earnings_exposed}")


if __name__ == "__main__":
    main()
