#!/bin/bash
# Double-click on macOS to start Streamlit (opens Terminal).

set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
# Same folder as this script (works when the file lives inside local-browser-agent)
if [[ -f "$HERE/.venv/bin/activate" ]]; then
  cd "$HERE"
else
  # Desktop copy / shortcut: jump to the project by path
  AGENT_DIR="$HOME/Desktop/mejor-vida-html /Mejor-Vida-HTML/local-browser-agent"
  if [[ -f "$AGENT_DIR/.venv/bin/activate" ]]; then
    cd "$AGENT_DIR"
  else
    osascript -e 'display dialog "Could not find local-browser-agent with a .venv. Open the project in Terminal and create the venv (see README)." buttons {"OK"} default button "OK"'
    exit 1
  fi
fi

(sleep 3 && open "http://localhost:8501") &

source ".venv/bin/activate"
exec streamlit run app.py
