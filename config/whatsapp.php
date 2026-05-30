<?php

return [

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Gateway Driver
    |--------------------------------------------------------------------------
    |
    | Driver yang dipakai untuk mengirim pesan WhatsApp.
    | Opsi: "fonnte" | "log" (untuk dev tanpa kirim asli).
    |
    */

    'driver' => env('WHATSAPP_DRIVER', 'log'),

    'drivers' => [
        'fonnte' => [
            'token' => env('FONNTE_TOKEN'),
            'device' => env('FONNTE_DEVICE'),
            'base_url' => env('FONNTE_BASE_URL', 'https://api.fonnte.com'),
            'timeout' => 15,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | OTP Settings
    |--------------------------------------------------------------------------
    */

    'otp' => [
        'length' => (int) env('OTP_LENGTH', 6),
        'expiry_minutes' => (int) env('OTP_EXPIRY_MINUTES', 5),
        'resend_cooldown_seconds' => 60,
    ],
];
