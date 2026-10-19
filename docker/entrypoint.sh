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

run_as_app() {
    if [ "$(id -u)" = "0" ]; then
        gosu www-data "$@"
    else
        "$@"
    fi
}

fail() {
    printf '[spmb] ERROR: %s\n' "$1" >&2
    exit 1
}

is_web=false
is_worker=false

if [ "${1:-}" = "apache2-foreground" ]; then
    is_web=true
elif [ "${1:-}" = "php" ] && [ "${2:-}" = "artisan" ] && [ "${3:-}" = "queue:work" ]; then
    is_worker=true
fi

if [ "$is_web" = "true" ] || [ "$is_worker" = "true" ]; then
    [ -n "${APP_KEY:-}" ] || fail 'APP_KEY belum diisi. Atur runtime environment di Coolify; gunakan key lama untuk database lama.'

    # Hapus hanya cache konfigurasi, tanpa menghapus data cache aplikasi.
    run_as_app php artisan config:clear --no-interaction --no-ansi

    # Validasi melalui encrypter Laravel tanpa mencetak key ke log.
    run_as_app php -r '
        require "vendor/autoload.php";
        $app = require "bootstrap/app.php";
        $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        try {
            $app->make("encrypter");
        } catch (Throwable $e) {
            fwrite(STDERR, "[spmb] ERROR: APP_KEY tidak valid. Periksa key runtime di Coolify.\n");
            exit(1);
        }
    '

    if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
        [ -z "${DB_URL:-}" ] || fail 'Untuk SQLite, kosongkan DB_URL dan gunakan DB_DATABASE sebagai path absolut file database.'

        sqlite_database="${DB_DATABASE:-}"
        case "$sqlite_database" in
            /*) ;;
            *) fail 'DB_DATABASE SQLite harus berupa path absolut di dalam persistent storage.' ;;
        esac

        sqlite_directory="$(dirname "$sqlite_database")"

        if [ "$is_web" = "true" ] && [ ! -e "$sqlite_database" ]; then
            printf '[spmb] Menyiapkan file SQLite baru: %s\n' "$sqlite_database"
            run_as_app mkdir -p "$sqlite_directory"
            # touch tidak menimpa isi database yang sudah ada.
            run_as_app touch "$sqlite_database"
        fi

        run_as_app test -f "$sqlite_database" || fail 'File SQLite tidak ditemukan. Siapkan database pada volume sebelum menjalankan worker.'
        run_as_app test -r "$sqlite_database" || fail 'File SQLite tidak dapat dibaca oleh user aplikasi.'
        run_as_app test -w "$sqlite_database" || fail 'File SQLite tidak dapat ditulis oleh user aplikasi.'
        run_as_app test -w "$sqlite_directory" || fail 'Direktori SQLite harus dapat ditulis untuk journal/WAL. Periksa permission volume.'
    fi

    if [ "$is_web" = "true" ]; then
        case "${SPMB_AUTO_MIGRATE:-true}" in
            true|1)
                printf '[spmb] Menjalankan migrasi sebelum Apache dimulai.\n'
                # Lock pada volume yang sama mencegah dua container memigrasi bersamaan.
                run_as_app flock --exclusive --timeout 120 storage/framework/migrate.lock \
                    php artisan migrate --force --no-interaction --no-ansi
                ;;
            false|0) ;;
            *) fail 'SPMB_AUTO_MIGRATE harus bernilai true atau false.' ;;
        esac
    fi
fi

# Artisan/worker berjalan sebagai user yang sama dengan proses PHP Apache.
if [ "${1:-}" = "php" ] && [ "${2:-}" = "artisan" ] && [ "$(id -u)" = "0" ]; then
    exec gosu www-data docker-php-entrypoint "$@"
fi

# Teruskan sinyal stop langsung ke Apache atau queue worker.
exec docker-php-entrypoint "$@"
