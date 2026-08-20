#!/usr/bin/env python3
"""Rebuild educational FE cost charts from Integrity harvests.

Delegates to scripts/rebuild-quote-ranges-from-fe-harvest.py so the cost-page
tables stay in lockstep with the live quoter (including Accendo 86–89).
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
script = ROOT / "scripts/rebuild-quote-ranges-from-fe-harvest.py"
raise SystemExit(subprocess.call([sys.executable, str(script), *sys.argv[1:]]))
