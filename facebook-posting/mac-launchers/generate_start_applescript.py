#!/usr/bin/env python3
"""Emit AppleScript for the Open Facebook Preview launcher (stdout)."""
from __future__ import annotations

import os
import sys


def escape_applescript_string(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def main() -> int:
    fb_root = os.environ.get("FB_ROOT", "").strip()
    if not fb_root:
        print("Set FB_ROOT to absolute path of facebook-posting/", file=sys.stderr)
        return 1
    q = escape_applescript_string(fb_root)
    script = f'''on run
\tset repoPath to "{q}"
\ttell application "Terminal"
\t\tactivate
\t\tdo script "cd " & quoted form of repoPath & " && ( sleep 1; for i in $(seq 1 50); do /usr/bin/curl -sf -o /dev/null http://127.0.0.1:8765/post-preview.html && break; sleep 0.5; done; /usr/bin/open http://127.0.0.1:8765/post-preview.html ) & python3 dev_preview.py"
\tend tell
end run
'''
    sys.stdout.write(script)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
