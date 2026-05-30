<?php

use App\Models\Registration;
use App\Models\RegistrationPeriod;
use App\Models\User;
use Database\Seeders\RegistrationPeriodSeeder;
use Illuminate\Support\Facades\Bus;

beforeEach(function () {
    $this->seed(RegistrationPeriodSeeder::class);
});

function makeVerifiedUser(): User
{
    return User::factory()->create([
        'phone_verified_at' => now(),
    ]);
}

function step1Payload(): array
{
    return [
        'full_name' => 'Budi Test',
        'gender' => 'L',
        'nik' => '1234567890123456',
        'kk_number' => '6543210987654321',
        'previous_kindergarten' => null,
        'birth_place' => 'Kepenuhan',
        'birth_date' => '2018-04-12',
        'has_special_needs' => false,
        'special_needs_types' => [],
        'religion' => 'islam',
        'dusun_name' => 'Dusun Contoh',
        'kelurahan_name' => 'Kel. Contoh',
        'address' => 'Jl. Mawar No. 1',
        'rt' => '01',
        'rw' => '02',
        'postal_code' => '28557',
        'residence_type' => 'orang_tua',
        'transportation' => 'jalan_kaki',
        'child_order' => 1,
        'phone_wa' => '081299999999',
        'is_kps_kph_recipient' => false,
        'has_kip' => false,
    ];
}

function step2Payload(): array
{
    return [
        'height_cm' => 110,
        'weight_kg' => 22,
        'hobby' => 'Membaca',
        'aspiration' => 'Dokter',
        'birth_certificate_number' => '123/2018',
        'distance_category' => '<1km',
        'distance_km' => null,
        'travel_time_minutes' => 10,
        'siblings_count' => 0,
    ];
}

function step3Payload(): array
{
    return [
        'contact_email' => 'wali@example.com',
        'has_guardian' => false,
        'father' => [
            'name' => 'Pak Budi',
            'nik' => null,
            'occupation' => 'petani',
            'education' => 'sma',
            'monthly_income' => '1-2jt',
            'is_alive' => true,
        ],
        'mother' => [
            'name' => 'Bu Siti',
            'nik' => null,
            'occupation' => 'tidak_bekerja',
            'education' => 'sma',
            'monthly_income' => 'tidak_berpenghasilan',
            'is_alive' => true,
        ],
    ];
}

test('unverified user is redirected to OTP from registration start', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->get('/registration/start')
        ->assertRedirect(route('verification.notice'));
});

test('user can save step 1', function () {
    $user = makeVerifiedUser();

    $this->actingAs($user)
        ->post('/registration/step/1', step1Payload())
        ->assertRedirect(route('registration.step', ['step' => 2]));

    $registration = $user->registrations()->first();
    expect($registration)->not->toBeNull();
    expect($registration->identity)->not->toBeNull();
    expect($registration->identity->full_name)->toBe('Budi Test');
    expect($registration->current_step)->toBe(2);
});

test('user can complete all 3 steps and submit', function () {
    Bus::fake();

    $user = makeVerifiedUser();

    $this->actingAs($user)->post('/registration/step/1', step1Payload())->assertRedirect();
    $this->actingAs($user)->post('/registration/step/2', step2Payload())->assertRedirect();
    $this->actingAs($user)->post('/registration/step/3', step3Payload())->assertRedirect(route('registration.review'));

    $registration = $user->registrations()->first();

    $response = $this->actingAs($user)->post('/registration/submit');

    $registration = $registration->fresh();
    expect($registration->status)->toBe(Registration::STATUS_SUBMITTED);
    expect($registration->registration_number)->toMatch('/^SPMB-\d{4}-\d{4}$/');
    expect($registration->submitted_at)->not->toBeNull();

    $response->assertRedirect(route('registration.success', ['registration' => $registration->id]));

    Bus::assertChained([
        \App\Jobs\GenerateRegistrationPdf::class,
        \App\Jobs\SendRegistrationConfirmation::class,
    ]);
});

test('submit fails when steps incomplete', function () {
    $user = makeVerifiedUser();

    $this->actingAs($user)->post('/registration/step/1', step1Payload());

    $this->actingAs($user)
        ->post('/registration/submit')
        ->assertRedirect(route('registration.start'));

    expect($user->registrations()->first()->status)->toBe(Registration::STATUS_DRAFT);
});

test('NIK must be 16 digits', function () {
    $user = makeVerifiedUser();

    $payload = array_merge(step1Payload(), ['nik' => '123']);

    $this->actingAs($user)
        ->post('/registration/step/1', $payload)
        ->assertSessionHasErrors('nik');
});

test('distance_km is required when distance > 1km', function () {
    $user = makeVerifiedUser();

    $this->actingAs($user)->post('/registration/step/1', step1Payload());

    $payload = array_merge(step2Payload(), [
        'distance_category' => '>1km',
        'distance_km' => null,
    ]);

    $this->actingAs($user)
        ->post('/registration/step/2', $payload)
        ->assertSessionHasErrors('distance_km');
});
