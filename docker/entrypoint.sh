#!/bin/sh
set -eu

cd /var/www/html
umask 002

# Siapkan direktori ketika storage menggunakan volume baru.
mkdir -p storage/app/private storage/app/public \
    storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache

if [ "$(id -u)" = "0" ]; then
    chown -R www-data:www-data storage bootstrap/cache
fi

# Teruskan sinyal stop langsung ke Apache atau queue worker.
exec docker-php-entrypoint "$@"
