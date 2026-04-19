#!/usr/bin/env python3
"""Emit AppleScript for the Stop Facebook Preview launcher (stdout)."""
from __future__ import annotations

import sys


def main() -> int:
    bash = (
        "/usr/bin/pkill -f dev_preview.py 2>/dev/null; "
        "pids=$(/usr/sbin/lsof -ti:8765 2>/dev/null); "
        '[ -n "$pids" ] && /bin/kill -15 $pids 2>/dev/null; '
        "exit 0"
    )
    as_esc = bash.replace("\\", "\\\\").replace('"', '\\"')
    script = f"""on run
\tset bashScript to "{as_esc}"
\ttry
\t\tdo shell script "/bin/bash -lc " & quoted form of bashScript
\tend try
\tdisplay notification "Facebook Preview server stopped (port 8765)." with title "Stop Facebook Preview"
end run
"""
    sys.stdout.write(script)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
