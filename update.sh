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
# Владелец файлов: явный DEPLOY_USER, иначе кто запустил скрипт (напр. SSH_USERNAME из Actions)
DEPLOY_USER="${DEPLOY_USER:-$(id -un)}"

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

echo "Копируем статику из контейнера от пользователя $(id -un)..."
# tar на хосте создаёт файлы от текущего SSH-пользователя (не root из контейнера)
mkdir -p html
rm -rf html/*
docker compose exec -T zapusk-frontend \
  tar -C /usr/share/nginx/html -cf - . | tar -C html -xf -

echo "Останавливаем контейнер..."
docker compose down --rmi all

echo "Синхронизируем файлы с nginx (${SITE_NAME})..."
NGINX_SITE_DIR="$(cd "$SCRIPT_DIR/../../nginx/html/${SITE_NAME}" && pwd)"
mkdir -p "$NGINX_SITE_DIR"
rsync -r --delete html/ "$NGINX_SITE_DIR/"

# Best-effort: не падаем, если нет прав / нет passwordless sudo (CI без TTY)
echo "Выставляем владельца ${DEPLOY_USER}:${DEPLOY_USER} (best-effort)..."
if chown -R "${DEPLOY_USER}:${DEPLOY_USER}" html/ "$NGINX_SITE_DIR" 2>/dev/null; then
  echo "chown ok"
elif command -v sudo >/dev/null 2>&1 && sudo -n chown -R "${DEPLOY_USER}:${DEPLOY_USER}" html/ "$NGINX_SITE_DIR" 2>/dev/null; then
  echo "chown ok (sudo -n)"
else
  echo "Warning: chown skipped — files stay owned by $(id -un) (достаточно для nginx)"
fi

echo "Перезапускаем nginx..."
docker exec nginx bash -c "nginx -s reload"

echo "Скрипт выполнен успешно! Deployed ${BRANCH} → ${SITE_NAME}"
