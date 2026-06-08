#!/usr/bin/env python3
"""
Fire the Make.com first-comment webhook with a sample payload so Make can
"Detect new values" on the Webhooks module (structure re-save).

Does NOT publish to Facebook. Use a real post_id only if you want Make to
queue a real comment after the scenario sleep.

  cd facebook-posting
  python3 scripts/test_make_first_comment_webhook.py --dry-run
  python3 scripts/test_make_first_comment_webhook.py --send
  python3 scripts/test_make_first_comment_webhook.py --send --post-id PAGEID_POSTID
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_root))

from scripts.publish_facebook import (  # noqa: E402
    resolve_make_first_comment_webhook_url,
    schedule_first_comment_via_make,
)

SAMPLE_POST_ID = "964179840112349_122136371223248915"
SAMPLE_COMMENT = (
    "¡Gracias por tu interés! [TEST — borrar si aparece en Facebook]\n\n"
    "Payload de prueba desde test_make_first_comment_webhook.py"
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Test Make first-comment webhook payload")
    parser.add_argument(
        "--send",
        action="store_true",
        help="POST to Make (otherwise print payload only)",
    )
    parser.add_argument(
        "--post-id",
        default=SAMPLE_POST_ID,
        help="Facebook post id for id/post_id fields",
    )
    parser.add_argument(
        "--comment",
        default=SAMPLE_COMMENT,
        help="Comment text for message/comment fields",
    )
    args = parser.parse_args()

    url = resolve_make_first_comment_webhook_url()
    payload = {
        "post_id": args.post_id.strip(),
        "id": args.post_id.strip(),
        "comment": args.comment,
        "message": args.comment,
    }

    print("Webhook URL:", url or "(not configured)")
    print("Payload:")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    print()
    print("Make mapping after Detect new values:")
    print("  Post ID  → {{1.id}}  or {{1.post_id}}")
    print("  Message  → {{1.message}}  or {{1.comment}}")

    if not args.send:
        print("\nDry run — add --send to POST to Make.")
        return 0

    if not url:
        print("Error: configure make_first_comment_webhook_url in settings.json", file=sys.stderr)
        return 1

    try:
        result = schedule_first_comment_via_make(
            args.post_id.strip(),
            args.comment,
        )
        print("\nMake response:", result)
        print(
            "\nIn Make: Webhooks module → Redetermine data structure / Detect new values "
            "should now show id, post_id, message, comment."
        )
        return 0
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
