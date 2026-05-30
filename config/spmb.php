<?php

return [

    /*
    |--------------------------------------------------------------------------
    | School Profile
    |--------------------------------------------------------------------------
    |
    | Identitas sekolah yang ditampilkan di Welcome page, layout, dan PDF.
    |
    */

    'school' => [
        'name' => 'SD Negeri 001 Kepenuhan',
        'district' => 'Kepenuhan',
        'address' => 'Kepenuhan, Kabupaten Rokan Hulu, Riau',
        'principal' => 'Kepala Sekolah',
        'phone' => '',
        'email' => '',
        'logo_path' => 'images/logo-school.png',
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Seed
    |--------------------------------------------------------------------------
    */

    'admin' => [
        'name' => env('ADMIN_NAME', 'Administrator SPMB'),
        'phone' => env('ADMIN_PHONE'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Active Registration Period (Default Seeder)
    |--------------------------------------------------------------------------
    */

    'period' => [
        'academic_year' => env('REGISTRATION_ACADEMIC_YEAR', '2026/2027'),
        'opens_at' => env('REGISTRATION_OPENS_AT', '2026-05-01 00:00:00'),
        'closes_at' => env('REGISTRATION_CLOSES_AT', '2026-07-31 23:59:59'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Number Format
    |--------------------------------------------------------------------------
    */

    'number_format' => 'SPMB-{year}-{seq}',
    'sequence_padding' => 4,
];
