#!/usr/bin/env bash
# Build a .icns from a square PNG (1024+ recommended). Usage: build_icns.sh input.png output.icns
set -euo pipefail
SRC="${1:?usage: build_icns.sh input.png output.icns}"
OUT="${2:?}"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/fbicon.XXXXXX")"
ICONSET="$TMP/icon.iconset"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
mkdir -p "$ICONSET"

sips -z 16 16     "$SRC" --out "$ICONSET/icon_16x16.png" >/dev/null
sips -z 32 32     "$SRC" --out "$ICONSET/icon_16x16@2x.png" >/dev/null
sips -z 32 32     "$SRC" --out "$ICONSET/icon_32x32.png" >/dev/null
sips -z 64 64     "$SRC" --out "$ICONSET/icon_32x32@2x.png" >/dev/null
sips -z 128 128   "$SRC" --out "$ICONSET/icon_128x128.png" >/dev/null
sips -z 256 256   "$SRC" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
sips -z 256 256   "$SRC" --out "$ICONSET/icon_256x256.png" >/dev/null
sips -z 512 512   "$SRC" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
sips -z 512 512   "$SRC" --out "$ICONSET/icon_512x512.png" >/dev/null
sips -z 1024 1024 "$SRC" --out "$ICONSET/icon_512x512@2x.png" >/dev/null

iconutil -c icns "$ICONSET" -o "$OUT"
