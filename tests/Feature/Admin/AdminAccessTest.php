<?php

use App\Models\Registration;
use App\Models\RegistrationPeriod;
use App\Models\StudentIdentity;
use App\Models\User;
use Database\Seeders\RegistrationPeriodSeeder;

beforeEach(function () {
    $this->seed(RegistrationPeriodSeeder::class);
});

test('regular user cannot access admin dashboard', function () {
    $user = User::factory()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/admin/dashboard')
        ->assertForbidden();
});

test('admin can access admin dashboard', function () {
    $admin = User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get('/admin/dashboard')
        ->assertOk();
});

test('admin can verify a submitted registration', function () {
    $admin = User::factory()->admin()->create();
    $applicant = User::factory()->create();
    $period = RegistrationPeriod::active();

    $registration = Registration::create([
        'user_id' => $applicant->id,
        'period_id' => $period->id,
        'status' => Registration::STATUS_SUBMITTED,
        'submitted_at' => now(),
        'registration_number' => 'SPMB-2026-0001',
    ]);

    StudentIdentity::create([
        'registration_id' => $registration->id,
        'full_name' => 'Test',
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
        'phone_wa' => '081200000000',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.registrations.verify', ['registration' => $registration->id]))
        ->assertRedirect();

    expect($registration->fresh()->status)->toBe(Registration::STATUS_VERIFIED);
    expect($registration->fresh()->verified_at)->not->toBeNull();
});

test('admin reject requires note', function () {
    $admin = User::factory()->admin()->create();
    $applicant = User::factory()->create();
    $period = RegistrationPeriod::active();

    $registration = Registration::create([
        'user_id' => $applicant->id,
        'period_id' => $period->id,
        'status' => Registration::STATUS_SUBMITTED,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.registrations.reject', ['registration' => $registration->id]), [])
        ->assertSessionHasErrors('note');
});
