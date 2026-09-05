# Repository Instructions

- This is a Laravel 12 + Inertia 2 + React 18 application; frontend files use plain `.jsx`, not TypeScript.
- `resources/js/app.jsx` is the Vite entrypoint; the `@/*` alias maps to `resources/js/*`.

## Commands

- Run the full local stack with `composer dev` (Laravel server, queue listener, Pail logs, and Vite).
- Run tests with `php artisan test`; focus one test with `php artisan test --filter="test name"` or a test path.
- Format PHP with `vendor/bin/pint`; there is no repository lint, typecheck, CI, or pre-commit script.
- Build frontend assets with `npm run build`; use `npm run dev` for Vite HMR.
- Setup requires `composer install`, `npm install`, `.env`, `php artisan key:generate`, `php artisan migrate --seed`, and `php artisan storage:link`.

## Testing

- Pest is the test framework; feature tests are bound to `RefreshDatabase` in `tests/Pest.php`.
- `phpunit.xml` forces MySQL database `spmb_test` on `127.0.0.1:3306`; tests do not use the sqlite default from `.env.example`.
- Tests force `QUEUE_CONNECTION=sync` and `WHATSAPP_DRIVER=log`; use `Http::fake()` when testing Fonnte behavior.

## Architecture

- Phone-number auth and WhatsApp OTP are implemented in `app/Http/Controllers/Auth` and `app/Services/OtpService.php`; there is no email login.
- Registration form option values have one source of truth in `app/Support/RegistrationOptions.php`; do not duplicate them in requests or React pages.
- Admin routes live under `/admin` and use the `admin.*` name prefix; protect new admin endpoints with the existing `auth` and `admin` middleware group.
- `config/spmb.php` and `config/whatsapp.php` contain app defaults; `SchoolSetting` overrides school display values from the database at boot.
- Registration numbers must be generated through `RegistrationNumberGenerator`, which locks the per-period sequence in a transaction.
- PDF output uses `resources/views/pdf/registration.blade.php` and DomPDF-compatible inline/table CSS, not Tailwind classes.
- Surat Tugas uses `resources/views/pdf/surat-tugas.blade.php`; POST validation stores a temporary session payload, then GET download consumes it to return a PDF without database history.
- Student master data lives in `Student`; manual photos use the public `students/` storage path, while Excel import uses `StudentsImport` and all-or-nothing validation before inserts.
- Parent notifications use `StudentNotification` snapshots and `SendStudentNotification`; render templates before dispatching queue jobs so edited templates cannot change message history.

## WhatsApp Settings

- Fonnte token/device can be managed at Admin > Pengaturan WhatsApp; token values are encrypted in `app_settings`.
- `FONNTE_TOKEN` and `FONNTE_DEVICE` remain `.env` fallbacks. A blank admin token deliberately preserves the existing token.
- `WhatsAppService` is a scoped binding so long-running queue workers resolve the current database token for each job; do not change it back to a singleton.
- Fonnte's send endpoint authenticates with the token; the stored device value is a reference and must not be added as an unsupported send payload field.
- Set `WHATSAPP_DRIVER=log` during development to avoid real WhatsApp sends; queue jobs still need a worker in normal development.
