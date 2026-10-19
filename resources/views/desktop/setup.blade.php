<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Siapkan Administrator - {{ config('app.name') }}</title>
    <link rel="preload" href="/fonts/manrope-latin-variable.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/plus-jakarta-sans-latin-variable.woff2" as="font" type="font/woff2" crossorigin>
    <style>
        @font-face { font-family: Manrope; font-style: normal; font-weight: 400 800; font-display: swap; src: url('/fonts/manrope-latin-variable.woff2') format('woff2'); }
        @font-face { font-family: 'Plus Jakarta Sans'; font-style: normal; font-weight: 400 800; font-display: swap; src: url('/fonts/plus-jakarta-sans-latin-variable.woff2') format('woff2'); }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 32px; background: #f8fafc; color: #1E293B; font-family: Manrope, Arial, sans-serif; color-scheme: light; }
        main { width: min(100%, 520px); background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 32px; box-shadow: 0 18px 50px rgba(30, 41, 59, .10); }
        .eyebrow { margin: 0 0 8px; color: #1d4ed8; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        h1 { margin: 0 0 10px; font-family: 'Plus Jakarta Sans', Manrope, sans-serif; font-size: 28px; }
        .intro { margin: 0 0 26px; color: #475569; line-height: 1.6; }
        label { display: block; margin: 17px 0 7px; font-size: 14px; font-weight: 700; }
        input { width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 14px; font: inherit; outline: none; }
        input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, .18); }
        button { width: 100%; margin-top: 24px; border: 0; border-radius: 10px; padding: 13px 16px; background: #3B82F6; color: #0f172a; font: inherit; font-weight: 700; cursor: pointer; transition: background-color 180ms, color 180ms; }
        button:hover { background: #2563eb; color: #fff; }
        button:focus-visible { outline: 2px solid #2563eb; outline-offset: 3px; }
        .error { margin-top: 6px; color: #b91c1c; font-size: 13px; }
        .note { margin-top: 18px; color: #64748b; font-size: 12px; line-height: 1.5; }
        main { animation: setup-enter 450ms cubic-bezier(.22, 1, .36, 1); }
        input { transition: border-color 180ms, box-shadow 180ms; }
        button { transition: background-color 180ms, color 180ms, translate 200ms, scale 200ms; }
        @media (hover: hover) and (pointer: fine) { button:hover { translate: 0 -2px; } }
        button:active { translate: 0 0; scale: .98; }
        @keyframes setup-enter { from { opacity: 0; translate: 0 12px; } to { opacity: 1; translate: 0 0; } }
        @media (prefers-reduced-motion: reduce) { main { animation: none; } input, button { transition: none; } button:hover, button:active { translate: none; scale: none; } }
    </style>
</head>
<body>
<main>
    <p class="eyebrow">Pengaturan pertama</p>
    <h1>Buat akun administrator</h1>
    <p class="intro">Akun ini disimpan hanya pada database lokal perangkat dan dapat digunakan tanpa koneksi internet.</p>

    <form method="POST" action="{{ route('desktop.setup.store') }}">
        @csrf

        <label for="name">Nama administrator</label>
        <input id="name" name="name" value="{{ old('name', 'Administrator SPMB') }}" required autofocus>
        @error('name')<div class="error">{{ $message }}</div>@enderror

        <label for="phone">Nomor HP</label>
        <input id="phone" name="phone" inputmode="numeric" placeholder="081234567890" value="{{ old('phone') }}" required>
        @error('phone')<div class="error">{{ $message }}</div>@enderror

        <label for="password">Kata sandi</label>
        <input id="password" name="password" type="password" minlength="8" required>
        @error('password')<div class="error">{{ $message }}</div>@enderror

        <label for="password_confirmation">Ulangi kata sandi</label>
        <input id="password_confirmation" name="password_confirmation" type="password" minlength="8" required>

        <button type="submit">Simpan dan masuk</button>
    </form>

    <p class="note">Simpan nomor HP dan kata sandi ini dengan aman. Pemulihan melalui WhatsApp hanya tersedia ketika perangkat terhubung ke internet.</p>
</main>
</body>
</html>
