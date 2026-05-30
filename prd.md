# PRD - SPMB SD Negeri 001 Kepenuhan

Sistem Pendaftaran Murid Baru (SPMB) berbasis web untuk SD Negeri 001 Kepenuhan, Kecamatan Kepenuhan. Aplikasi memungkinkan calon wali murid mendaftar secara online, mengisi formulir bertahap, memverifikasi nomor WhatsApp, lalu menerima formulir pendaftaran resmi dalam format PDF yang dikirim otomatis via WhatsApp.

## 1. Tech Stack

- **Backend**: Laravel 12, Laravel Breeze, Sanctum, Inertia.js Adapter
- **Frontend**: React 18 + Inertia 2, Tailwind CSS, shadcn/ui, lucide-react, sonner (toast), recharts (chart admin)
- **PDF**: `barryvdh/laravel-dompdf`
- **QR Code**: `simplesoftwareio/simple-qrcode`
- **Excel Export**: `maatwebsite/excel`
- **WhatsApp Gateway**: Fonnte (via abstraksi `WhatsAppService` agar bisa diganti vendor)
- **Queue**: driver `database` untuk job kirim WA & generate PDF asynchronous

## 2. Tema Warna

Extend Tailwind config dengan palet `navy` dan `gold`:

```js
colors: {
  navy: {
    50: '#f0f4f8', 100: '#d9e2ec', 200: '#bcccdc', 300: '#9fb3c8',
    400: '#829ab1', 500: '#627d98', 600: '#486581', 700: '#334e68',
    800: '#243b53', 900: '#1E3A5F', 950: '#102a43',
  },
  gold: {
    50: '#fdf8e8', 100: '#f9edc5', 200: '#f3db8e', 300: '#ecc94b',
    400: '#d4a72c', 500: '#C9A84C', 600: '#a17a2a', 700: '#7c5e20',
    800: '#5c4516', 900: '#3d2e0f',
  },
}
```

## 3. Fitur Utama

1. **Registrasi akun via No HP/WA + Password** (tanpa email).
2. **Verifikasi nomor WhatsApp via OTP 6 digit** (wajib sebelum bisa submit pendaftaran).
3. **Form Wizard 3 Step** dengan auto-save tiap klik tombol Next.
4. **Resume Pendaftaran**: user bisa logout dan lanjut dari step terakhir.
5. **Generator PDF Formulir Pendaftaran** otomatis setelah submit (lengkap dengan QR code & watermark).
6. **Notifikasi WhatsApp Otomatis**: konfirmasi submit + kirim PDF, perubahan status (diterima/ditolak/revisi), reminder draft.
7. **Public Status Tracker** (tanpa login, input No HP + Nomor Pendaftaran).
8. **Panel Admin**: dashboard statistik, list pendaftar dengan filter, verifikasi/tolak/minta revisi, export Excel, manajemen periode pendaftaran.
9. **Periode Pendaftaran (Tahun Ajaran)**: admin dapat membuka/menutup periode; submit di luar periode ditolak.
10. **Validasi NIK & No KK** (16 digit numerik, unique per tahun ajaran).
11. **Rate limit & anti-spam** untuk endpoint OTP, login, dan public status tracker.

## 4. Skema Database

### `users`

- `id`, `name`, `phone` (unique, format 08xx, 10-13 digit), `password`
- `phone_verified_at` (nullable), `role` enum(`user`,`admin`) default `user`
- `remember_token`, `created_at`, `updated_at`

### `registration_periods`

- `id`, `academic_year` (contoh: `2026/2027`), `opens_at`, `closes_at`, `is_active` (boolean)
- `created_at`, `updated_at`

### `registrations` (header pendaftaran)

- `id`, `user_id` (FK users), `period_id` (FK registration_periods)
- `registration_number` (format `SPMB-YYYY-XXXX`, unique, generated saat submit)
- `status` enum(`draft`,`submitted`,`verified`,`accepted`,`rejected`,`need_revision`) default `draft`
- `current_step` tinyint default `1`
- `submitted_at`, `verified_at`, `admin_note` (text, nullable)
- `created_at`, `updated_at`

### `student_identities` (1-1 ke `registrations` - Step 1)

- `registration_id` (FK)
- `school_name` default `SD Negeri 001 Kepenuhan`
- `district` default `Kepenuhan`
- `full_name`, `gender` enum(`L`,`P`)
- `nik` (16 digit), `kk_number` (16 digit)
- `previous_kindergarten` (nullable)
- `birth_place`, `birth_date`
- `has_special_needs` (boolean)
- `special_needs_types` (json array, nullable) - opsi: netra, rungu, grahita ringan, grahita sedang, daksa ringan, daksa sedang, laras, wicara, hyperaktif, cerdas istimewa, kesulitan belajar, autis
- `religion` enum(islam, kristen, katholik, hindu, budha, khonghucu, kepercayaan, lainnya)
- `dusun_name`, `kelurahan_name`, `address`, `rt`, `rw`, `postal_code`
- `residence_type` enum(orang_tua, wali, kost, asrama, panti_asuhan, pesantren, lainnya)
- `transportation` enum(jalan_kaki, ojek, andong, perahu, kuda, sepeda, sepeda_motor, mobil_pribadi, lainnya)
- `child_order` (anak ke-)
- `phone_wa`
- `is_kps_kph_recipient` (boolean), `has_kip` (boolean)

### `student_periodics` (1-1 ke `registrations` - Step 2)

- `registration_id` (FK)
- `height_cm`, `weight_kg`
- `hobby`, `aspiration`
- `birth_certificate_number`
- `distance_category` enum(`<1km`,`>1km`)
- `distance_km` (nullable, wajib jika `>1km`)
- `travel_time_minutes`
- `siblings_count`

### `student_parents` (1-N ke `registrations` - Step 3)

Satu baris per peran, role enum(`father`,`mother`,`guardian`).

- `registration_id` (FK), `role`
- `name`, `nik`
- `occupation` enum(tidak_bekerja, nelayan, petani, peternak, pns_tni_polri, karyawan_swasta, pedagang_kecil, pedagang_besar, wiraswasta, wirausaha, buruh, pensiunan, lainnya)
- `education` enum(tidak_sekolah, sd, smp, sma, d1, d2, d3, s1, s2, s3, lainnya)
- `monthly_income` enum(<1jt, 1-2jt, 2-3jt, 3-5jt, 5-20jt, >20jt, tidak_berpenghasilan)
- `phone` (nullable), `email` (nullable)
- `is_alive` (boolean, untuk ayah/ibu)

Toggle "Apakah mempunyai wali?" di Step 3 menentukan apakah baris `role=guardian` dibuat.

### `registration_contacts` (atau gabungkan ke `registrations`)

- `registration_id` (FK), `email` (kontak utama)

### `otp_codes`

- `id`, `phone`, `code` (6 digit), `purpose` enum(`register`,`reset`)
- `expires_at`, `used_at`, `created_at`

### `whatsapp_logs`

- `id`, `to`, `type`, `payload` (json), `status`, `response`, `created_at`

## 5. Auth Flow Custom (No HP + Password)

1. **Register**: input `name`, `phone`, `password`, `password_confirmation` -> validasi -> simpan user (`phone_verified_at = null`) -> generate OTP 6 digit, simpan ke `otp_codes` (TTL 5 menit) -> kirim WA -> redirect `/verify-otp`.
2. **Verify OTP**: input 6 digit -> cek match & belum expired -> set `phone_verified_at = now()`, `used_at = now()` -> auto login -> redirect `/dashboard`.
3. **Resend OTP**: rate limit 1 kali/menit.
4. **Login**: credential `phone` + `password`.
5. **Forgot Password**: input phone -> kirim OTP via WA -> input OTP + password baru -> reset.
6. Middleware `EnsurePhoneVerified` memblokir submit final formulir jika belum verified.

## 6. Form Wizard 3 Step

### Step 1 - Identitas Murid Baru

1. Satuan Pendidikan: `SD Negeri 001 Kepenuhan` (disabled, prefilled)
2. Kecamatan: `Kepenuhan` (disabled, prefilled)
3. Nama Lengkap
4. Jenis Kelamin (Laki-Laki / Perempuan)
5. NIK (16 digit numerik)
6. No KK (16 digit numerik)
7. Sekolah TK Asal (opsional)
8. Tempat Lahir (sesuai KK)
9. Tanggal Lahir (sesuai KK)
10. Berkebutuhan Khusus (Ya/Tidak). Jika Ya -> tampilkan multi-select: netra, rungu, grahita ringan, grahita sedang, daksa ringan, daksa sedang, laras, wicara, hyperaktif, cerdas istimewa, kesulitan belajar, autis
11. Agama (Islam, Kristen, Katholik, Hindu, Budha, Khonghucu, Kepercayaan Kepada Tuhan YME, Lainnya)
12. Nama Dusun
13. Nama Kelurahan
14. Alamat
15. RT
16. RW
17. Kode Pos
18. Tempat Tinggal (Bersama Orang Tua, Wali, Kost, Asrama, Panti Asuhan, Pesantren, Lainnya)
19. Alat Transportasi ke Sekolah (Jalan Kaki, Ojek, Andong/Bendi/Sado/Dokar/Delman/Becak, Perahu Penyebrangan/Rakit/Getek, Kuda, Sepeda, Sepeda Motor, Mobil Pribadi, Lainnya)
20. Anak Keberapa
21. Nomor HP / WA
22. Apakah Penerima KPS/KPH (Ya/Tidak)
23. Apakah Punya KIP (Ya/Tidak)

### Step 2 - Data Periodik

1. Tinggi Badan (cm)
2. Berat Badan (kg)
3. Hobi
4. Cita-Cita
5. No Registrasi Akta Lahir
6. Jarak Tempat Tinggal ke Sekolah (Kurang dari 1km / Lebih dari 1km). Jika lebih dari 1km -> tampilkan input jumlah km.
7. Waktu Tempuh ke Sekolah (menit)
8. Jumlah Saudara Kandung

### Step 3 - Data Orang Tua/Wali + Kontak

- **Sub-card Ayah Kandung** (wajib): Nama, NIK, Pekerjaan, Pendidikan Terakhir, Penghasilan Bulanan, Status (masih hidup/almarhum)
- **Sub-card Ibu Kandung** (wajib): Nama, NIK, Pekerjaan, Pendidikan Terakhir, Penghasilan Bulanan, Status
- **Toggle "Apakah mempunyai wali?"** (Ya/Tidak). Jika Ya, tampilkan **Sub-card Wali**: Nama, NIK, Pekerjaan, Pendidikan Terakhir, Penghasilan Bulanan, No HP
- **Kontak**: Email Aktif

### Mekanisme Form Wizard

- Tombol **Next** -> POST `/registration/step/{n}` -> validasi parsial -> save -> `current_step = max(current_step, n+1)`.
- Tombol **Previous** tetap ada, data tetap utuh.
- Sidebar: indikator step aktif + checklist field wajib.
- Halaman **Review** (read-only summary) sebelum tombol **Submit Final**.
- Setelah submit, formulir tidak bisa diubah lagi (kecuali admin set status `need_revision`).

## 7. Submit Final & Generator PDF

1. POST `/registration/submit` -> validasi lengkap semua step -> generate `registration_number` format `SPMB-{period_year}-{seq:4}` -> set `status=submitted`, `submitted_at=now()`.
2. Dispatch job `GenerateRegistrationPdf`:
    - Render Blade `pdf.registration` (mirip formulir resmi sekolah, kop dengan logo, watermark "SPMB 2026", QR code di pojok kanan bawah berisi URL public status tracker).
    - Simpan ke `storage/app/public/registrations/{registration_number}.pdf`.
3. Dispatch job `SendRegistrationConfirmation`:
    - Kirim pesan WA berisi: ucapan terima kasih, nomor pendaftaran, link download PDF, link cek status.
    - Lampirkan file PDF (Fonnte mendukung kirim file).
4. Halaman sukses: tampilkan nomor pendaftaran besar + tombol Download PDF + tombol Kirim Ulang ke WA.
5. PDF dapat di-download kapan saja dari dashboard user.

## 8. Panel Admin (`/admin`)

Dilindungi middleware `RoleAdmin`. Seeder admin pertama menggunakan `phone` & `password` dari `.env` (`ADMIN_PHONE`, `ADMIN_PASSWORD`).

- **`/admin/dashboard`**: kartu statistik (total pendaftar, status breakdown, gender ratio, agama, dusun top 5) + chart sederhana via recharts.
- **`/admin/registrations`**: tabel server-side dengan filter (status, periode, gender, dusun, search by nama/NIK/no pendaftaran). Action: Lihat detail, Verifikasi, Tolak (alasan), Minta Revisi (catatan -> dikirim WA).
- **`/admin/registrations/{id}`**: detail lengkap + tombol download PDF + tombol kirim ulang WA.
- **`/admin/registrations/export`**: export Excel sesuai filter aktif (kolom siap untuk Dapodik).
- **`/admin/periods`**: CRUD periode pendaftaran, tombol Aktifkan (hanya satu periode aktif pada satu waktu).
- **`/admin/users`**: list user.

### Status Lifecycle

```
draft -> submitted -> verified -> accepted
                                -> rejected
                   -> need_revision -> (kembali ke draft, user revisi -> submit lagi)
```

Setiap perubahan status oleh admin memicu notifikasi WhatsApp ke pendaftar.

## 9. Public Status Tracker

- Route publik `/cek-status` (tanpa auth).
- Form: No HP + Nomor Pendaftaran -> POST -> tampilkan: status, tanggal submit, catatan admin (jika ada), link download PDF (jika sudah submitted).
- Rate limit `5/menit/IP`.

## 10. Routing Map

```
GET  /                              Welcome (info sekolah, alur, FAQ, syarat)
GET  /cek-status                    Public status form
POST /cek-status                    Public status check (rate-limited)

# Auth (guest)
GET  /register                      Form register
POST /register                      Submit register + send OTP
GET  /verify-otp                    Form OTP
POST /verify-otp                    Verify OTP
POST /resend-otp                    Resend OTP (rate-limited)
GET  /login                         Login
POST /login                         Submit login
POST /logout
GET  /forgot-password               Form (input phone)
POST /forgot-password               Send OTP
GET  /reset-password                Form (OTP + password baru)
POST /reset-password                Submit reset

# User (auth + verified)
GET  /dashboard                     Status pendaftaran user
GET  /registration/start            Mulai/lanjut form (redirect ke step current)
GET  /registration/step/{n}         Render step (1..3)
POST /registration/step/{n}         Save partial step
GET  /registration/review           Review keseluruhan
POST /registration/submit           Final submit
GET  /registration/{id}/pdf         Download PDF
POST /registration/{id}/resend-wa   Kirim ulang notifikasi WA

# Admin (auth + role:admin)
GET  /admin/dashboard
GET  /admin/registrations
GET  /admin/registrations/{id}
POST /admin/registrations/{id}/verify
POST /admin/registrations/{id}/accept
POST /admin/registrations/{id}/reject
POST /admin/registrations/{id}/request-revision
GET  /admin/registrations/export
GET  /admin/periods
POST /admin/periods
PATCH /admin/periods/{id}
GET  /admin/users
```

## 11. WhatsApp Service Abstraction

```php
interface WhatsAppService {
    public function sendText(string $to, string $message): bool;
    public function sendFile(string $to, string $filePath, string $caption = ''): bool;
}
```

Driver default: `FonnteWhatsAppService` (HTTP POST ke `https://api.fonnte.com/send`).
Konfigurasi `.env`:

```
WHATSAPP_DRIVER=fonnte
FONNTE_TOKEN=
FONNTE_DEVICE=
```

Fallback: jika request gagal, tetap simpan ke `whatsapp_logs` dengan status `failed` dan log error. Tidak memblokir flow user (job retry 3x dengan backoff).

## 12. Tahapan Eksekusi

1. **Setup tema & UI**: extend Tailwind navy/gold, install shadcn/ui, lucide-react, sonner, recharts; siapkan layout publik / user / admin.
2. **Customize Auth**: ubah migrasi `users` (phone alih-alih email), override controller register/login, halaman React-nya.
3. **WhatsApp Service & OTP**: bikin interface + Fonnte driver, tabel `otp_codes`, flow verify-otp, resend, password reset.
4. **Migrasi Domain**: `registration_periods`, `registrations`, `student_identities`, `student_periodics`, `student_parents`, `whatsapp_logs`. Factory + seeder admin & periode aktif.
5. **Models + Relasi + Form Requests + Policies** per step.
6. **Form Wizard React (3 step)** + endpoint auto-save per step + halaman Review.
7. **Submit Final**: nomor pendaftaran + dispatch job PDF + dispatch job notifikasi WA.
8. **Generator PDF**: Blade template + QR code + watermark + endpoint download + endpoint resend WA.
9. **Dashboard User**: status card + tombol Lanjut/Download PDF.
10. **Welcome Page Publik**: hero, alur pendaftaran, FAQ, syarat, kontak sekolah.
11. **Public Status Tracker**.
12. **Panel Admin**: dashboard statistik, list & filter, detail, action verifikasi/tolak/revisi (auto kirim WA), export Excel, CRUD periode.
13. **Polish**: validasi, rate-limit (login/OTP/cek-status), queue worker, dokumentasi env, seeder demo, error handling.
14. **Testing**: Pest unit & feature test untuk register+OTP, save step, submit, generate PDF, akses admin.

## 13. Catatan Teknis & Risiko

- **Fonnte device** harus aktif. Service tetap log gagal kirim agar tidak memblokir submit.
- **DomPDF** tidak men-support semua CSS Tailwind. Template PDF ditulis dengan inline CSS sederhana berbasis tabel agar konsisten.
- **Tailwind**: gunakan Tailwind 3 (kompatibel penuh dengan shadcn/ui saat ini). Plugin `@tailwindcss/vite` v4 di `package.json` akan disesuaikan.
- **Validasi NIK**: 16 digit numerik, unique per `period_id` (mencegah satu anak didaftarkan dua kali pada periode yang sama).
- **Periode pendaftaran tidak aktif** -> submit ditolak, tapi user masih bisa lihat draft.
- **PDF storage** di `storage/app/public/registrations/`. Jalankan `php artisan storage:link`.
- **Queue**: jalankan `php artisan queue:work` (sudah dimasukkan ke script `composer dev`).
- **Rate limit**: login 5/menit, OTP send 1/menit, OTP verify 5/menit, public status 5/menit.
