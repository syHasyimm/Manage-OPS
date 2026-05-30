<?php

use App\Models\Registration;
use App\Models\RegistrationPeriod;
use App\Models\StudentIdentity;
use App\Models\User;

test('public status form renders', function () {
    $this->get('/cek-status')->assertOk();
});

test('valid phone + registration number returns result', function () {
    $period = RegistrationPeriod::create([
        'academic_year' => '2026/2027',
        'opens_at' => now()->subMonth(),
        'closes_at' => now()->addMonth(),
        'is_active' => true,
    ]);

    $user = User::factory()->create(['phone' => '081234567890']);

    $registration = Registration::create([
        'user_id' => $user->id,
        'period_id' => $period->id,
        'registration_number' => 'SPMB-2026-0001',
        'status' => Registration::STATUS_SUBMITTED,
        'submitted_at' => now(),
    ]);

    StudentIdentity::create([
        'registration_id' => $registration->id,
        'full_name' => 'Budi',
        'gender' => 'L',
        'nik' => '1234567890123456',
        'kk_number' => '1234567890123456',
        'birth_place' => 'X',
        'birth_date' => '2018-01-01',
        'religion' => 'islam',
        'dusun_name' => 'D',
        'kelurahan_name' => 'K',
        'address' => 'A',
        'rt' => '01', 'rw' => '01', 'postal_code' => '12345',
        'residence_type' => 'orang_tua',
        'transportation' => 'jalan_kaki',
        'child_order' => 1,
        'phone_wa' => '081234567890',
    ]);

    $response = $this->post('/cek-status', [
        'phone' => '081234567890',
        'registration_number' => 'SPMB-2026-0001',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('result');
});

test('mismatched phone returns error', function () {
    $period = RegistrationPeriod::create([
        'academic_year' => '2026/2027',
        'opens_at' => now()->subMonth(),
        'closes_at' => now()->addMonth(),
        'is_active' => true,
    ]);

    $user = User::factory()->create(['phone' => '081234567890']);

    Registration::create([
        'user_id' => $user->id,
        'period_id' => $period->id,
        'registration_number' => 'SPMB-2026-0001',
        'status' => Registration::STATUS_SUBMITTED,
    ]);

    $this->post('/cek-status', [
        'phone' => '081111111111',
        'registration_number' => 'SPMB-2026-0001',
    ])->assertSessionHasErrors('registration_number');
});
