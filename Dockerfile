# syntax=docker/dockerfile:1

FROM php:8.4-apache-bookworm AS php-base

WORKDIR /var/www/html

# GD untuk PDF/QR, ZIP untuk Excel, dan PCNTL untuk queue worker.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gosu \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libsqlite3-dev \
        libzip-dev \
        util-linux \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath exif gd intl mbstring opcache pcntl pdo_mysql pdo_sqlite zip \
    && a2enmod rewrite \
    && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && rm -rf /var/lib/apt/lists/*

COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/99-spmb.ini

FROM php-base AS vendor

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress \
    --no-scripts --no-autoloader

COPY . .

# Package discovery tidak memerlukan database atau kredensial saat build.
RUN mkdir -p bootstrap/cache storage/framework/cache/data \
        storage/framework/sessions storage/framework/views storage/logs \
    && composer dump-autoload --no-dev --classmap-authoritative --no-scripts \
    && DB_CONNECTION=sqlite DB_DATABASE=:memory: CACHE_STORE=array \
        php artisan package:discover --ansi --no-interaction

FROM node:22-bookworm-slim AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Tailwind memindai template Laravel; alias Ziggy juga berasal dari vendor.
COPY --from=vendor /var/www/html/vendor ./vendor

ARG VITE_APP_NAME="SPMB SD Negeri 001 Kepenuhan"
ENV VITE_APP_NAME=${VITE_APP_NAME}

RUN npm run build

FROM php-base AS production

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/storage/app/database.sqlite \
    SPMB_AUTO_MIGRATE=true \
    TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16

COPY --from=vendor /var/www/html ./
COPY --from=assets /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/spmb-entrypoint

# Normalisasi CRLF agar entrypoint tetap berjalan dari checkout Windows.
RUN sed -i 's/\r$//' /usr/local/bin/spmb-entrypoint \
    && chmod +x /usr/local/bin/spmb-entrypoint \
    && mkdir -p storage/app/private storage/app/public \
        storage/framework/cache/data storage/framework/sessions \
        storage/framework/views storage/logs bootstrap/cache \
    && ln -s /var/www/html/storage/app/public public/storage \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD php -r 'exit(@file_get_contents("http://127.0.0.1/up") === false ? 1 : 0);'

ENTRYPOINT ["spmb-entrypoint"]
CMD ["apache2-foreground"]
