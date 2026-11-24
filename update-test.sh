#!/bin/bash
# Staging deploy → http://test.zapusk.io (HTTPS later, when cert includes test.zapusk.io)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

export BRANCH="${BRANCH:-test}"
export SITE_NAME="${SITE_NAME:-test.zapusk.io}"
# Пока нет валидного TLS на test — API ходит на prod.
# Когда сертификат будет готов: VITE_API_URL=https://test.zapusk.io/api
export VITE_API_URL="${VITE_API_URL:-https://zapusk.io/api}"

exec "$SCRIPT_DIR/update.sh"
