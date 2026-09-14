<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Siapkan Administrator - {{ config('app.name') }}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 32px; background: #f4f7f5; color: #17221b; font-family: Arial, sans-serif; }
        main { width: min(100%, 520px); background: #fff; border: 1px solid #dce5df; border-radius: 18px; padding: 32px; box-shadow: 0 18px 50px rgba(25, 55, 37, .10); }
        .eyebrow { margin: 0 0 8px; color: #257a47; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        h1 { margin: 0 0 10px; font-size: 28px; }
        .intro { margin: 0 0 26px; color: #5b6860; line-height: 1.6; }
        label { display: block; margin: 17px 0 7px; font-size: 14px; font-weight: 700; }
        input { width: 100%; border: 1px solid #cbd7cf; border-radius: 10px; padding: 12px 14px; font: inherit; outline: none; }
        input:focus { border-color: #27844d; box-shadow: 0 0 0 3px rgba(39, 132, 77, .12); }
        button { width: 100%; margin-top: 24px; border: 0; border-radius: 10px; padding: 13px 16px; background: #206f40; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
        .error { margin-top: 6px; color: #b42318; font-size: 13px; }
        .note { margin-top: 18px; color: #69756d; font-size: 12px; line-height: 1.5; }
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
