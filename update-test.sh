#!/bin/bash
# Staging deploy → https://test.zapusk.io
# (использовать позже, когда будет ветка test / DNS / nginx)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

export BRANCH="${BRANCH:-test}"
export SITE_NAME="${SITE_NAME:-test.zapusk.io}"
export VITE_API_URL="${VITE_API_URL:-https://test.zapusk.io/api}"

exec "$SCRIPT_DIR/update.sh"
