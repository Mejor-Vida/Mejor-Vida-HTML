#!/usr/bin/env bash
# Build "Open Facebook Preview.app" and "Stop Facebook Preview.app", copy to Desktop.
# Run from anywhere:  bash /path/to/facebook-posting/mac-launchers/create_launchers.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FB_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
export FB_ROOT

START_ICNS="$SCRIPT_DIR/StartFacebookPreview.icns"
STOP_ICNS="$SCRIPT_DIR/StopFacebookPreview.icns"
START_PNG="$SCRIPT_DIR/fb-preview-start.png"
STOP_PNG="$SCRIPT_DIR/fb-preview-stop.png"

for f in "$START_PNG" "$STOP_PNG"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing icon: $f" >&2
    exit 1
  fi
done

echo "facebook-posting path: $FB_ROOT"

bash "$SCRIPT_DIR/build_icns.sh" "$START_PNG" "$START_ICNS"
bash "$SCRIPT_DIR/build_icns.sh" "$STOP_PNG" "$STOP_ICNS"

START_AS="$SCRIPT_DIR/_Open_Facebook_Preview.applescript"
STOP_AS="$SCRIPT_DIR/_Stop_Facebook_Preview.applescript"
python3 "$SCRIPT_DIR/generate_start_applescript.py" >"$START_AS"
python3 "$SCRIPT_DIR/generate_stop_applescript.py" >"$STOP_AS"

OUT_DIR="${1:-$SCRIPT_DIR}"
mkdir -p "$OUT_DIR"

START_APP="$OUT_DIR/Open Facebook Preview.app"
STOP_APP="$OUT_DIR/Stop Facebook Preview.app"
rm -rf "$START_APP" "$STOP_APP"

osacompile -o "$START_APP" "$START_AS"
osacompile -o "$STOP_APP" "$STOP_AS"

# Replace default applet icon
cp -f "$START_ICNS" "$START_APP/Contents/Resources/applet.icns"
cp -f "$STOP_ICNS" "$STOP_APP/Contents/Resources/applet.icns"

# Ensure Finder uses custom icon
/usr/libexec/PlistBuddy -c "Set :CFBundleIconFile applet" "$START_APP/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Set :CFBundleIconFile applet" "$STOP_APP/Contents/Info.plist" 2>/dev/null || true

touch "$START_APP" "$STOP_APP"

DESKTOP="${HOME}/Desktop"
if [[ -d "$DESKTOP" ]]; then
  cp -R "$START_APP" "$DESKTOP/"
  cp -R "$STOP_APP" "$DESKTOP/"
  echo ""
  echo "Installed to Desktop:"
  echo "  $DESKTOP/Open Facebook Preview.app"
  echo "  $DESKTOP/Stop Facebook Preview.app"
else
  echo "Desktop not found at $DESKTOP — apps left in: $OUT_DIR" >&2
fi

echo ""
echo "Also available in: $OUT_DIR"
echo "Done."
