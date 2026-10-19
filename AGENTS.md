# Repository Instructions

- This is a Laravel 12 + Inertia 2 + React 18 application; frontend files use plain `.jsx`, not TypeScript.
- `resources/js/app.jsx` is the Vite entrypoint; the `@/*` alias maps to `resources/js/*`.

## Commands

- Run the full local stack with `composer dev` (Laravel server, queue listener for `default`, Pail logs, and Vite).
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
- The admin panel contains Dashboard SPMB, Periods, Registrations, Pengaturan KOP, and Kelola FAQ Chatbot. Removed modules, including calendars, teacher contacts, WhatsApp settings, and reminder history, must not be reintroduced without an explicit request.
- Historical migrations, existing database tables, and uploaded files are retained; this cleanup does not authorize deleting stored data.
- Admin routes live under `/admin` and use the `admin.*` name prefix; protect new admin endpoints with the existing `auth` and `admin` middleware group.
- `config/spmb.php` and `config/whatsapp.php` contain app defaults; `SchoolSetting` overrides school display values from the database at boot. Admin > Pengaturan KOP manages school identity, logos, and principal details; updates must call `SchoolSetting::bust()` to clear its cache. Admin > Kelola FAQ Chatbot manages the FAQ data used by the public SPMB chatbot.
- Registration numbers must be generated through `RegistrationNumberGenerator`, which locks the per-period sequence in a transaction.
- PDF output uses `resources/views/pdf/registration.blade.php` and DomPDF-compatible inline/table CSS, not Tailwind classes.

## WhatsApp Settings

- WhatsApp remains available for OTP and SPMB registration notifications. The calendar reminder feature and its settings UI have been removed. Preserve existing encrypted Fonnte credentials; never expose or flash tokens.
- `FONNTE_TOKEN` remains the `.env` fallback when no database token exists. `FONNTE_DEVICE` is a reference value only. Clearing the stored token with `AppSetting::set(AppSetting::FONNTE_TOKEN, null)` restores the `.env` fallback.
- `WhatsAppService` is a scoped binding so long-running queue workers resolve the current database token for each job; do not change it back to a singleton.
- Fonnte's send endpoint authenticates with the token; the stored device value is a reference and must not be added as an unsupported send payload field.
- Set `WHATSAPP_DRIVER=log` during development to avoid real WhatsApp sends; queue jobs still need a worker in normal development.
- Preserve historical calendar, teacher contact, staff, and reminder delivery data and migrations. `SendCalendarReminder` is retained only as an inert compatibility job for old queue payloads; it must never send messages or modify historical data. There is no calendar reminder command or schedule.
- Fonnte receipts distinguish `accepted`, `failed`, `uncertain`, and development `simulated`. Never automatically retry an uncertain HTTP outcome.
