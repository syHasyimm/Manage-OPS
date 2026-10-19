# Menjalankan SPMB dengan Docker

## Container lokal yang sudah disiapkan

Container `spmb-app` melayani <http://localhost:8000> dan `spmb-worker`
menjalankan antrean `default`. Keduanya dikelola melalui `compose.yaml`:

```powershell
docker compose up -d
docker compose ps
docker compose logs --tail 50 app
docker compose logs --tail 50 worker
docker compose stop
```

Konfigurasi berada di `.env.docker`. Untuk instalasi lokal ini, database SQLite
dan isi `storage/app` serta `storage/logs` disalin dari proyek ke volume
`spmb-storage`. Salinan database berada di
`/var/www/html/storage/app/database.sqlite`. Data container dan data pada folder
proyek selanjutnya berkembang secara terpisah. APP_KEY tetap menggunakan key
instalasi asal; WhatsApp memakai mode `log` untuk pengujian lokal.

Volume tersebut bersifat eksternal sehingga tetap tersedia setelah
`docker compose down`. Pada komputer baru, buat volume dengan
`docker volume create spmb-storage`, siapkan `.env.docker`, dan isi database serta
unggahan sebelum menjalankan container. Untuk database SQLite baru, buat file
database di path tersebut, lalu jalankan migrasi dan seeder sesuai kebutuhan.

Setelah mengubah environment, jalankan `docker compose up -d --force-recreate`.
Setelah mengubah kode, jalankan `docker compose up -d --build --force-recreate`.

## Build dan penyiapan manual

Image memakai PHP 8.4 + Apache, dependensi Composer tanpa paket development,
dan aset React/Vite yang sudah dibangun. Node dan Composer hanya digunakan
di tahap build. Apache melayani direktori `public` pada port 80. MySQL
dijalankan secara terpisah dan harus dapat diakses dari container.

## 1. Build image

Jalankan dari root proyek dengan Docker Desktop/Engine aktif:

```powershell
docker build -t spmb-web .
```

Nama aplikasi di judul browser ditentukan saat build. Untuk menggantinya:

```powershell
docker build --build-arg VITE_APP_NAME="SPMB Sekolah Saya" -t spmb-web .
```

## 2. Konfigurasi environment

Buat file khusus container agar konfigurasi lokal tetap terpisah:

```powershell
Copy-Item .env.example .env.docker
```

Edit `.env.docker`, minimal:

```dotenv
APP_NAME=SPMB SD Negeri 001 Kepenuhan
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000
APP_KEY=base64:ISI_DENGAN_KEY_APLIKASI

LOG_CHANNEL=stderr

DB_CONNECTION=mysql
DB_HOST=host.docker.internal
DB_PORT=3306
DB_DATABASE=spmb
DB_USERNAME=spmb
DB_PASSWORD=ISI_PASSWORD_DATABASE

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

WHATSAPP_DRIVER=log
```

Format `docker run --env-file` memakai nilai literal. Hapus tanda kutip pada
nilai yang disalin dari `.env.example`, termasuk nama aplikasi dan tanggal
pendaftaran. Ganti referensi `${APP_NAME}` dengan teks langsung, misalnya
`MAIL_FROM_NAME=SPMB SD Negeri 001 Kepenuhan`.

`host.docker.internal` mengarah ke host pada Docker Desktop. Jika MySQL berada
di container lain, gunakan nama service/container pada jaringan Docker yang sama
dan tambahkan `--network NAMA_JARINGAN` pada setiap perintah `docker run`.
Pada Docker Engine Linux dengan MySQL di host, tambahkan
`--add-host=host.docker.internal:host-gateway` pada setiap `docker run`.
Pastikan database sudah dibuat dan MySQL mengizinkan koneksi dari container.

Untuk instalasi yang memakai database lama, gunakan **APP_KEY yang sama** dengan
instalasi tersebut agar token Fonnte terenkripsi tetap bisa dibaca. Untuk instalasi
baru saja, buat key dengan perintah berikut lalu salin hasilnya ke `.env.docker`:

```powershell
docker run --rm spmb-web php artisan key:generate --show --no-ansi
```

Isi juga `ADMIN_PHONE` dan `ADMIN_PASSWORD` sebelum seeding pertama. Selama uji
coba, gunakan `WHATSAPP_DRIVER=log`. Untuk pengiriman WhatsApp sungguhan, atur
`WHATSAPP_DRIVER=fonnte` dan `FONNTE_TOKEN` atau gunakan token yang sudah tersimpan
di database. Isi `GROQ_API_KEY` jika chatbot AI diperlukan.

`.env.docker`, data lokal, dan unggahan tidak disertakan dalam image. File
`.env.docker` juga diabaikan Git.

## 3. Inisialisasi database

Jalankan migrasi secara eksplisit; container tidak menjalankannya otomatis:

```powershell
docker run --rm --env-file .env.docker -v spmb-storage:/var/www/html/storage spmb-web php artisan migrate --force
```

Untuk instalasi baru, jalankan seeder sekali setelah migrasi:

```powershell
docker run --rm --env-file .env.docker -v spmb-storage:/var/www/html/storage spmb-web php artisan db:seed --force
```

## 4. Jalankan web dan queue worker

```powershell
docker run -d --name spmb-app --restart unless-stopped --env-file .env.docker -p 8000:80 -v spmb-storage:/var/www/html/storage spmb-web
docker run -d --name spmb-worker --restart unless-stopped --stop-timeout 90 --no-healthcheck --env-file .env.docker -v spmb-storage:/var/www/html/storage spmb-web php artisan queue:work --queue=default --sleep=3 --tries=1 --timeout=60 --max-time=3600
```

Buka <http://localhost:8000>. Worker diperlukan untuk pembuatan PDF dan notifikasi
pendaftaran. Web dan worker harus memakai image, environment, dan volume storage
yang sama. `--tries=1` mengikuti perintah worker pada dokumentasi proyek.

Volume `spmb-storage` menyimpan unggahan, PDF, cache file, dan log secara persisten.
Symlink `public/storage` sudah tersedia di image. Untuk instalasi lama, salin
isi `storage` lama ke volume ini sebelum menjalankan aplikasi; image tidak
menyalin unggahan dari komputer saat build.

```powershell
docker logs -f spmb-app
docker logs -f spmb-worker
docker inspect --format '{{.State.Health.Status}}' spmb-app
```

Health check web memakai endpoint Laravel `/up`. Setelah mengubah kode atau
variabel `VITE_*`, build ulang image lalu buat ulang container web dan worker.
Setelah mengubah `.env.docker`, buat ulang kedua container agar environment baru
digunakan. Jangan memasang seluruh folder proyek ke `/var/www/html` pada image
ini karena akan menimpa vendor dan aset hasil build.

Referensi: [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/),
[image resmi PHP](https://hub.docker.com/_/php), dan
[deployment Laravel 12](https://laravel.com/docs/12.x/deployment).
