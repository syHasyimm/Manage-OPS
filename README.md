# SPMB SD Negeri 001 Kepenuhan

Sistem Pendaftaran Murid Baru (SPMB) berbasis web untuk SD Negeri 001 Kepenuhan, Kecamatan Kepenuhan. Calon wali murid mendaftar online, mengisi formulir 3 langkah, memverifikasi nomor WhatsApp, lalu menerima formulir resmi PDF F4 yang dikirim otomatis via WhatsApp.

## Fitur Utama

- Registrasi akun via No HP/WA + password (tanpa email)
- Verifikasi nomor WhatsApp via OTP 6 digit (Fonnte)
- Form Wizard 3 step dengan auto-save tiap klik Next
- Resume pendaftaran (lanjutkan dari step terakhir)
- Generator PDF formulir F4 otomatis (DomPDF) dengan QR Code & watermark
- Notifikasi WhatsApp otomatis (konfirmasi submit + perubahan status)
- Public status tracker tanpa login
- Panel admin: dashboard statistik, list pendaftar dengan filter, verifikasi/tolak/minta revisi, export Excel, manajemen periode pendaftaran
- Periode pendaftaran (academic year) yang dapat diaktifkan/nonaktifkan
- Rate limiting pada login, OTP, dan public status

## Tech Stack

- Laravel 12, Inertia 2, Sanctum
- React 18, Tailwind CSS 3, shadcn/ui, lucide-react, sonner, recharts
- `barryvdh/laravel-dompdf` (PDF F4)
- `simplesoftwareio/simple-qrcode` (QR Code pada PDF)
- `maatwebsite/excel` (export admin)
- Fonnte (WhatsApp Gateway) via abstraksi `WhatsAppService`

## Setup

```bash
# 1. Clone & install dependency
composer install
npm install

# 2. Konfigurasi environment
cp .env.example .env
php artisan key:generate

# Edit .env, isi minimum:
#   DB_*                 - koneksi database MySQL
#   FONNTE_TOKEN         - token Fonnte (ambil dari dashboard Fonnte)
#   FONNTE_DEVICE        - device ID Fonnte
#   ADMIN_PHONE          - nomor HP admin (08...)
#   ADMIN_PASSWORD       - password admin awal
#   REGISTRATION_*       - tahun ajaran & tanggal buka/tutup periode

# 3. Migrasi & seeder
php artisan migrate --seed
php artisan storage:link

# 4. Build frontend (atau jalankan dev mode)
npm run build       # production
# atau
npm run dev         # dev mode (Vite HMR)

# 5. Jalankan worker (terminal terpisah)
php artisan queue:work --queue=default --tries=1 --timeout=60
```

## Docker

Build image dengan `docker build -t spmb-web .`. Panduan konfigurasi environment,
database, penyimpanan persisten, dan queue worker tersedia di [docs/docker.md](docs/docker.md).

## Akses

- Halaman publik: `http://localhost:8000/`
- Cek Status: `http://localhost:8000/cek-status`
- Dashboard user: `http://localhost:8000/dashboard` (login required)
- Panel admin: `http://localhost:8000/admin/dashboard` (role admin)

Admin dibuat oleh `AdminUserSeeder` berdasarkan `.env` (`ADMIN_PHONE`, `ADMIN_PASSWORD`). Login admin akan otomatis redirect ke `/admin/dashboard`.

## Konfigurasi WhatsApp

Default driver: `fonnte`. Atur di `.env`:

```env
WHATSAPP_DRIVER=fonnte
FONNTE_TOKEN=...
FONNTE_DEVICE=...
FONNTE_BASE_URL=https://api.fonnte.com
```

Untuk development tanpa kirim WA real, ganti driver ke `log` (pesan ditulis ke `storage/logs/laravel.log`):

```env
WHATSAPP_DRIVER=log
```

Panel admin menyediakan **Dashboard SPMB**, **Periode**, **Data Pendaftar**, **Pengaturan KOP**, dan **Kelola FAQ Chatbot**. Menu FAQ di seluler tersedia melalui tab **Akun**.

WhatsApp tetap digunakan untuk OTP dan notifikasi pendaftaran SPMB. Token Fonnte tersimpan di `app_settings` tetap dipertahankan dan digunakan; jika tidak ada, aplikasi memakai `FONNTE_TOKEN` dari `.env`. Pengaturan token melalui panel admin telah dihapus. Pemeliharaan teknis dapat mengganti token menggunakan `AppSetting::set(AppSetting::FONNTE_TOKEN, $token)` atau mengembalikan penggunaan `.env` dengan nilai `null`. Worker mengambil token terbaru pada setiap job. Pilihan driver dan base URL diatur melalui `.env`. Device hanya merupakan referensi dan tidak dikirim sebagai parameter endpoint kirim Fonnte.

Kalender Sekolah, Kontak Guru, Pengaturan WhatsApp, dan Riwayat Pengingat telah dihapus beserta rute, perintah, dan jadwal pengingatnya. `composer dev` menjalankan server, worker antrean `default`, Pail, dan Vite. Setelah pembaruan, mulai ulang proses pengembangan dan worker agar menggunakan kode terbaru. Job kalender yang tersisa di antrean lama tidak akan mengirim pesan karena kelas kompatibilitas `SendCalendarReminder` tidak melakukan tindakan apa pun.

Identitas sekolah, logo sekolah/kabupaten, alamat, dan data kepala sekolah dapat diubah melalui **Admin > Pengaturan KOP** (`/admin/school-settings`). Data ini dipakai pada halaman publik dan PDF pendaftaran. Pengaturan baru berlaku pada PDF yang dibuat setelah perubahan; untuk PDF lama gunakan tombol **Regenerate PDF** di detail pendaftar. Pembaruan melalui pemeliharaan teknis harus diikuti `SchoolSetting::bust()` agar cache diperbarui. Chatbot SPMB tetap tersedia di halaman publik, dan jawabannya dapat dikelola melalui **Admin > Kelola FAQ Chatbot** (`/admin/faqs`). Di seluler, menu FAQ tersedia melalui tab **Akun**.

Modul Buku Induk Siswa, Guru & Tendik, Kartu NISN, Surat Tugas, SPPD, Surat Kelulusan, Arsip Dokumen, Notifikasi Siswa, dan Template Pesan tetap dihapus dari aplikasi. Tabel database, migrasi historis, data kalender/kontak guru/riwayat pengingat, serta berkas unggahan lama dipertahankan.

Sebelum memperbarui instalasi yang memiliki antrean aktif, selesaikan job `SendStudentNotification` yang sudah terjadwal dengan versi lama. Kelas job tersebut tidak tersedia pada versi SPMB ini. Setelah pembaruan, restart worker agar memakai kode terbaru.

## Chatbot SPMB

Chatbot mencocokkan pertanyaan dengan FAQ aktif terlebih dahulu, termasuk kata kunci di dalam kalimat. Pertanyaan yang belum cocok diteruskan ke Groq. Atur `GROQ_API_KEY` dan, jika diperlukan, `GROQ_MODEL` di `.env`; model bawaan adalah `openai/gpt-oss-20b`. Pilih model chat yang tersedia untuk akun Groq Anda. Setelah mengubah konfigurasi pada instalasi yang memakai cache, jalankan `php artisan config:clear`.

FAQ tetap dapat menjawab saat layanan AI tidak tersedia. Kegagalan AI dicatat di log dengan status HTTP, model, dan kode error tanpa menyimpan API key atau isi percakapan. Nomor kontak pada pesan bantuan mengikuti **Pengaturan KOP**.

## Periode Pendaftaran

- Hanya satu periode aktif pada satu waktu.
- Submit ditolak jika periode tidak aktif atau di luar rentang `opens_at` - `closes_at`.
- Admin dapat membuat & mengaktifkan periode dari menu "Periode" di panel admin.

## Status Lifecycle

```
draft → submitted → verified → accepted
                              → rejected
                  → need_revision → (kembali ke draft, user revisi → submit lagi)
```

Setiap perubahan status dispatch `SendStatusUpdateNotification` ke pendaftar via WhatsApp.

## Format Nomor Pendaftaran

`SPMB-{tahun}-{seq:4}` contoh `SPMB-2026-0001`. Sequence per periode dengan locking transaksi (aman terhadap race condition).

## Struktur Direktori Penting

```
app/
├── Http/Controllers/
│   ├── Admin/                  # Controller panel admin
│   ├── Auth/                   # Custom auth (phone + OTP)
│   ├── PublicStatusController  # Cek status publik
│   └── RegistrationController  # Form wizard + submit
├── Http/Middleware/
│   ├── EnsurePhoneVerified
│   └── EnsureUserIsAdmin
├── Jobs/
│   ├── GenerateRegistrationPdf
│   ├── SendRegistrationConfirmation
│   ├── SendStatusUpdateNotification
│   ├── SendWhatsAppMessage
│   └── SendPrintInstructionNotification
├── Services/
│   ├── OtpService
│   ├── RegistrationNumberGenerator
│   ├── RegistrationService
│   └── WhatsApp/               # Interface + Fonnte/Log driver
├── Support/
│   └── RegistrationOptions     # Daftar opsi enum (single source of truth)
└── Exports/
    └── RegistrationsExport     # Export Excel

resources/
├── js/
│   ├── Components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── Wizard/             # Stepper, FormField, StepShell
│   ├── Layouts/
│   │   ├── AppLayout           # User dashboard
│   │   ├── AdminLayout         # Admin
│   │   └── GuestLayout         # Halaman auth
│   └── Pages/
│       ├── Admin/              # Halaman admin
│       ├── Auth/               # Login/Register/OTP/Reset
│       ├── Registration/       # Step1, Step2, Step3, Review, Success
│       ├── Dashboard.jsx
│       ├── PublicStatus.jsx
│       └── Welcome.jsx
└── views/
    └── pdf/registration.blade.php   # Template PDF F4
```

## Rate Limit

- Login: 5/menit per (phone+IP)
- OTP send (register/reset): 1/menit per phone
- OTP verify: 5/menit per phone
- Public status check: 5/menit per IP

## Catatan

- DomPDF tidak men-support semua CSS Tailwind. Template PDF ditulis pakai inline CSS sederhana berbasis tabel.
- Tailwind v3 tetap dipakai (kompatibel penuh dengan shadcn/ui saat ini).
- Validasi NIK / No KK = 16 digit numerik, kode pos = 5 digit numerik.
- Selama development, jalankan `php artisan queue:work` agar job WhatsApp & PDF terproses.
- PDF disimpan di `storage/app/public/registrations/{nomor}.pdf`. Pastikan sudah jalankan `php artisan storage:link`.

## Lisensi

Internal SD Negeri 001 Kepenuhan.
