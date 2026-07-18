#!/bin/bash
set -e

echo "Esperando a que la base de datos inicie..."
# Espera 10 segundos para dar tiempo a MariaDB de inicializar por primera vez
sleep 10

echo "Ejecutando migraciones de base de datos..."
php artisan migrate --force

echo "Iniciando Apache..."
exec "$@"
