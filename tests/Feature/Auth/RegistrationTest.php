<?php

use App\Models\OtpCode;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Support\Facades\Bus;

test('registration screen can be rendered', function () {
    $this->get('/register')->assertStatus(200);
});

test('new users can register with phone and password', function () {
    Bus::fake();

    $response = $this->post('/register', [
        'name' => 'Wali Murid',
        'phone' => '081234567890',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'phone' => '081234567890',
        'role' => 'user',
        'phone_verified_at' => null,
    ]);

    $this->assertDatabaseHas('otp_codes', [
        'phone' => '081234567890',
        'purpose' => OtpService::PURPOSE_REGISTER,
    ]);

    $response->assertRedirect(route('verification.notice'));
});

test('phone must follow indonesian format', function () {
    $this->post('/register', [
        'name' => 'X',
        'phone' => '6281234567890',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('phone');
});

test('user can verify phone with valid otp', function () {
    $user = User::factory()->unverified()->create([
        'phone' => '081234567890',
    ]);

    $otp = app(OtpService::class)->generate($user->phone, OtpService::PURPOSE_REGISTER);

    $response = $this->actingAs($user)->post('/verify-otp', [
        'code' => $otp->code,
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    expect($user->fresh()->phone_verified_at)->not->toBeNull();
});

test('invalid otp is rejected', function () {
    $user = User::factory()->unverified()->create([
        'phone' => '081234567890',
    ]);

    app(OtpService::class)->generate($user->phone, OtpService::PURPOSE_REGISTER);

    $response = $this->actingAs($user)->post('/verify-otp', [
        'code' => '000000',
    ]);

    $response->assertSessionHasErrors('code');
    expect($user->fresh()->phone_verified_at)->toBeNull();
});
