# Menjalankan SPMB dengan Docker

## Coolify dengan Dockerfile dan SQLite

Gunakan Build Pack **Dockerfile**, Base Directory `/`, Dockerfile Location
`/Dockerfile`, dan **Ports Exposes `80`**. Image sudah berisi dependensi PHP,
ekstensi SQLite, serta hasil build React/Vite; tidak perlu custom Build Command
atau Start Command untuk aplikasi web.

Di **Environment Variables**, isi sebagai runtime environment:

```dotenv
APP_NAME=SPMB SD Negeri 001 Kepenuhan
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-sekolah-anda
APP_KEY=base64:KEY_APLIKASI_ANDA
LOG_CHANNEL=stderr

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/storage/app/database.sqlite
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
SPMB_AUTO_MIGRATE=true

WHATSAPP_DRIVER=log
```

Ganti `APP_URL` dengan domain sebenarnya. `APP_KEY` harus diisi melalui Coolify;
image tidak membuat, menyimpan, atau mengganti key otomatis. Jika memakai database
lama, pertahankan key instalasi lama agar kredensial terenkripsi tetap terbaca.
Untuk instalasi baru, buat key satu kali dengan perintah pada bagian konfigurasi
environment di bawah. Kosongkan `DB_URL` ketika memakai SQLite; `DB_HOST`,
`DB_PORT`, `DB_USERNAME`, dan `DB_PASSWORD` tidak dibutuhkan untuk SQLite.
Selama uji coba, gunakan driver WhatsApp `log`. Gunakan `fonnte` dan kredensial
asli hanya ketika pengiriman WhatsApp memang akan diaktifkan.

Di **Persistent Storage**, tambahkan **Volume Mount** dengan Destination Path
`/var/www/html/storage`, kemudian simpan dan redeploy. Gunakan kembali volume
yang sama pada deployment berikutnya. Dockerfile tidak dapat menetapkan volume
bernama di Coolify; mount harus dikonfigurasi di resource tersebut. Jangan mount
seluruh `/var/www/html`, karena akan menutupi vendor dan aset hasil build.

File `.env`, database SQLite lokal, dan unggahan tidak disertakan dalam image.
Untuk memindahkan instalasi lama, cadangkan dan salin database serta unggahan ke
volume sebelum startup pertama. Mount baru tidak otomatis memindahkan database
yang berada di lokasi lain. Gunakan path SQLite di atas untuk database hasil
pemindahan tersebut. Jika memakai path lain, arahkan `DB_DATABASE` ke file pada
mount yang sesuai dan pastikan file serta direktori induknya dapat ditulis oleh
`www-data`. Direktori induk harus dapat ditulis untuk journal/WAL SQLite.

Image mempercayai header proxy dari jaringan privat Docker (`10.0.0.0/8`,
`172.16.0.0/12`, `192.168.0.0/16`) agar Laravel menghasilkan URL HTTPS saat TLS
ditangani proxy Coolify. Untuk membatasi ke IP/subnet proxy tertentu, isi
`TRUSTED_PROXIES` di runtime environment dengan IP/CIDR yang dipisahkan koma.
Sesuaikan jika jaringan proxy memakai subnet lain. Nilai kosong menonaktifkan
kepercayaan proxy, jadi jangan menimpa default image dengan nilai kosong ketika
memakai proxy Coolify. Di luar image Docker, proxy tidak dipercaya secara default.

Saat web container dimulai, entrypoint:

1. Menyiapkan direktori storage dan permission untuk `www-data`.
2. Memastikan `APP_KEY` terisi dan valid, serta membersihkan cache konfigurasi lama.
3. Membuat file SQLite hanya jika file pada path tersebut belum ada; database
   yang sudah ada digunakan kembali.
4. Menjalankan `php artisan migrate --force --no-interaction` dengan lock pada
   volume sebelum Apache dimulai. Startup berhenti jika penyiapan/migrasi gagal,
   dan penyebabnya muncul di **Logs** Coolify.

Migrasi tidak menjalankan `migrate:fresh` atau seeder otomatis. Untuk instalasi
baru, isi `ADMIN_PHONE` dan `ADMIN_PASSWORD`, lalu jalankan **sekali** melalui
Terminal aplikasi:

```sh
php artisan db:seed --force
```

Seeder juga menyiapkan periode, identitas sekolah, dan FAQ. Jangan menjadwalkan
seeder pada setiap restart karena dapat mengubah akun admin dan data awal.
Jika migrasi dikelola secara manual, set `SPMB_AUTO_MIGRATE=false`, siapkan
database terlebih dahulu, lalu jalankan migrasi melalui Terminal. Pastikan tabel
session/cache sudah tersedia sebelum melayani pengguna.

Untuk queue worker, jalankan container terpisah dengan image, environment, dan
volume yang sama. Worker tidak memerlukan domain; nonaktifkan health check HTTP
dan gunakan perintah berikut sebagai pengganti command Apache:

```sh
php artisan queue:work --queue=default --sleep=3 --tries=1 --timeout=60 --max-time=3600
```

Jalankan web terlebih dahulu hingga sehat. Worker tidak membuat database atau
menjalankan migrasi; Artisan/worker berjalan sebagai `www-data`. Tanpa worker,
pembuatan PDF dan notifikasi yang diantrekan tidak diproses.

Jika domain masih gagal, buka **Logs** aplikasi, refresh domain, dan cari pesan
`[spmb] ERROR` atau exception Laravel terbaru. Pemeriksaan dari Terminal:

```sh
ls -lah /var/www/html/storage/app/database.sqlite
php artisan migrate:status
```

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
unggahan lama sebelum menjalankan container. Untuk instalasi SQLite baru,
entrypoint menyiapkan file dan migrasi; jalankan seeder sekali sesuai kebutuhan.

Setelah mengubah environment, jalankan `docker compose up -d --force-recreate`.
Setelah mengubah kode, jalankan `docker compose up -d --build --force-recreate`.

## Build dan penyiapan manual

Image memakai PHP 8.4 + Apache, dependensi Composer tanpa paket development,
dan aset React/Vite yang sudah dibangun. Node dan Composer hanya digunakan
di tahap build. Apache melayani direktori `public` pada port 80. Default image
memakai SQLite pada `/var/www/html/storage/app/database.sqlite`. MySQL tetap
didukung dengan mengisi seluruh konfigurasi koneksinya dan menjalankannya
secara terpisah agar dapat diakses dari container.

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

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/storage/app/database.sqlite

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

WHATSAPP_DRIVER=log
```

Jika menggunakan MySQL, ganti `DB_CONNECTION` menjadi `mysql`, isi `DB_DATABASE`
dengan nama database (bukan path file), serta isi `DB_HOST`, `DB_PORT`,
`DB_USERNAME`, dan `DB_PASSWORD`.

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

Web container menjalankan migrasi otomatis sebelum Apache dimulai. Untuk
menjalankan migrasi secara eksplisit sebelum startup web, gunakan:

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
