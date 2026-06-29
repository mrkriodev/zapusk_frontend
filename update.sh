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


#echo "Обновляем репозиторий..."
git pull
git fetch --all
git reset --hard origin/main

echo "Останавливаем и удаляем старые контейнеры и образы..."
docker compose down --rmi all

echo "Очищаем директорию сайта..."
rm -rf html/*

echo "Запускаем контейнеры в фоне..."
docker compose up -d

echo "Перемещаем содержимое nginx html..."
#docker compose exec frontend sh -c "mv /usr/share/nginx/html/* /tmp/"
docker compose exec zapusk-frontend sh -c "mv /usr/share/nginx/html/* /tmp/"

echo "Останавливаем контейнер..."
docker compose down --rmi all

#echo "Синхронизируем файлы с nginx..."
#rsync -r --delete html/* ../../nginx/html/

echo "Синхронизируем файлы с nginx (zapusk.io)..."
NGINX_SITE_DIR="$(cd "$(dirname "$0")/../../nginx/html/zapusk.io" && pwd)"
mkdir -p "$NGINX_SITE_DIR"
rsync -r --delete html/ "$NGINX_SITE_DIR/"

echo "Перезапускаем nginx..."
docker exec nginx bash -c "nginx -s reload"

echo "Скрипт выполнен успешно!"
