#!/bin/bash
set -e  # Останавливаем скрипт при ошибке
set -o pipefail  # Учитываем статус выхода из команд в конвейере

# Функция для обработки ошибок
error_handler() {
    echo "Произошла ошибка в строке $1."
    exit 1
}

# Обработчик ошибок
trap 'error_handler $LINENO' ERR

# Параметры деплоя (prod по умолчанию)
BRANCH="${BRANCH:-main}"
SITE_NAME="${SITE_NAME:-zapusk.io}"
VITE_API_URL="${VITE_API_URL:-https://${SITE_NAME}/api}"
DEPLOY_USER="${DEPLOY_USER:-mrkrio}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Deploy: branch=${BRANCH} site=${SITE_NAME} api=${VITE_API_URL}"

echo "Обновляем репозиторий (origin/${BRANCH})..."
git fetch --all
git checkout "$BRANCH"
git reset --hard "origin/${BRANCH}"

echo "Останавливаем и удаляем старые контейнеры и образы..."
docker compose down --rmi all || true

echo "Очищаем директорию сайта..."
rm -rf html/*

echo "Запускаем контейнеры в фоне..."
export VITE_API_URL
docker compose up -d --build

echo "Перемещаем содержимое nginx html..."
docker compose exec zapusk-frontend sh -c "mv /usr/share/nginx/html/* /tmp/"

echo "Останавливаем контейнер..."
docker compose down --rmi all

echo "Синхронизируем файлы с nginx (${SITE_NAME})..."
NGINX_SITE_DIR="$(cd "$SCRIPT_DIR/../../nginx/html/${SITE_NAME}" && pwd)"
mkdir -p "$NGINX_SITE_DIR"
rsync -r --delete html/ "$NGINX_SITE_DIR/"

# Файлы из контейнера (volume) приходят как root — возвращаем владельца
echo "Выставляем владельца ${DEPLOY_USER}:${DEPLOY_USER}..."
if chown -R "${DEPLOY_USER}:${DEPLOY_USER}" html/ "$NGINX_SITE_DIR" 2>/dev/null; then
  :
elif command -v sudo >/dev/null 2>&1; then
  sudo chown -R "${DEPLOY_USER}:${DEPLOY_USER}" html/ "$NGINX_SITE_DIR"
else
  echo "Warning: could not chown html/ and ${NGINX_SITE_DIR} (need root or sudo)"
fi

echo "Перезапускаем nginx..."
docker exec nginx bash -c "nginx -s reload"

echo "Скрипт выполнен успешно! Deployed ${BRANCH} → ${SITE_NAME}"
