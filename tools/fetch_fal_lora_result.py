#!/usr/bin/env python3
"""
Fetch the result of a completed fal.ai FLUX LoRA training job.

If a training job already ran (e.g. before your balance went negative), this script
lists your recent flux-lora-general-training requests and downloads the LoRA file
from the most recent successful one.

Requires: FAL_KEY environment variable
Usage:
  python fetch_fal_lora_result.py
  python fetch_fal_lora_result.py --request-id <uuid>
"""
from __future__ import annotations

import argparse
import os
import sys
import urllib.request
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch completed fal.ai LoRA training result")
    parser.add_argument(
        "--request-id",
        default=None,
        help="Specific request ID to fetch. If omitted, uses most recent successful job.",
    )
    parser.add_argument(
        "--output",
        default="julie_mv_lora.safetensors",
        help="Output filename for downloaded LoRA weights",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Look back this many days for completed jobs (default: 7)",
    )
    parser.add_argument(
        "--endpoint",
        default="fal-ai/flux-lora-fast-training",
        help="Endpoint to search (default: flux-lora-fast-training; use flux-lora-general-training for old jobs)",
    )
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY environment variable is not set.", file=sys.stderr)
        return 1

    try:
        import httpx
    except ImportError:
        print("ERROR: httpx is required. Install with: pip install httpx", file=sys.stderr)
        return 1

    from datetime import datetime, timedelta

    endpoint = args.endpoint
    base_url = "https://api.fal.ai/v1"
    key = os.environ["FAL_KEY"]
    headers = {"Authorization": f"Key {key}"}

    if args.request_id:
        # Fetch specific request via fal_client if available
        try:
            import fal_client

            result = fal_client.result(args.endpoint, args.request_id)
            lora_file = result.get("diffusers_lora_file")
        except Exception as e:
            print(f"ERROR: Could not fetch request {args.request_id}: {e}", file=sys.stderr)
            return 1
    else:
        # List recent requests
        start = (datetime.utcnow() - timedelta(days=args.days)).strftime("%Y-%m-%d")
        url = f"{base_url}/models/requests/by-endpoint?endpoint_id={endpoint}&status=success&start={start}&expand=payloads&limit=10"

        resp = httpx.get(url, headers=headers, timeout=30)
        if resp.status_code != 200:
            print(f"ERROR: API returned {resp.status_code}", file=sys.stderr)
            print(resp.text[:500], file=sys.stderr)
            if resp.status_code == 403:
                print("\nYour account may be locked (negative balance). Top up at fal.ai/dashboard/billing", file=sys.stderr)
            return 1

        data = resp.json()
        items = data.get("items", [])
        if not items:
            print(f"No completed {endpoint} jobs found in the last {args.days} days.")
            print("If a job ran, try increasing --days or use --request-id with the job ID from fal.ai dashboard.")
            return 1

        # Use most recent (first in list, sorted by ended_at desc)
        item = items[0]
        req_id = item.get("request_id")
        json_output = item.get("json_output") or {}
        lora_file = json_output.get("diffusers_lora_file")

        print(f"Found completed job: {req_id}")
        print(f"  Ended at: {item.get('ended_at', 'N/A')}")

    if not lora_file:
        print("ERROR: No diffusers_lora_file in result.", file=sys.stderr)
        return 1

    url = lora_file.get("url") if isinstance(lora_file, dict) else getattr(lora_file, "url", None)
    if not url:
        print("ERROR: No URL in diffusers_lora_file.", file=sys.stderr)
        return 1

    print(f"\nDownloading LoRA weights...")
    output_path = Path(args.output)
    urllib.request.urlretrieve(url, output_path)
    print(f"Saved to: {output_path.resolve()}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
