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

# 5. Jalankan queue worker (untuk job WA & PDF)
php artisan queue:work
```

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
│   └── SendWhatsAppFile
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
