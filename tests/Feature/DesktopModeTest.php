<?php

use App\Models\User;

beforeEach(function () {
    config()->set('desktop.enabled', true);
});

test('desktop endpoints are hidden when desktop mode is disabled', function () {
    config()->set('desktop.enabled', false);

    $this->get('/__desktop/health')->assertNotFound();
});

test('desktop start directs a fresh installation to administrator setup', function () {
    $this->get('/__desktop/start')
        ->assertRedirect(route('desktop.setup', absolute: false));

    $this->get('/__desktop/setup')->assertOk();
});

test('desktop setup creates and signs in the first administrator', function () {
    $response = $this->post('/__desktop/setup', [
        'name' => 'Administrator Sekolah',
        'phone' => '081234567890',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $admin = User::query()->where('phone', '081234567890')->firstOrFail();

    expect($admin->role)->toBe(User::ROLE_ADMIN)
        ->and($admin->phone_verified_at)->not->toBeNull();
    $this->assertAuthenticatedAs($admin);
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('desktop start directs an existing installation to login', function () {
    User::factory()->admin()->create();

    $this->get('/__desktop/start')
        ->assertRedirect(route('login', absolute: false));
});

test('desktop health verifies the active database connection', function () {
    $this->get('/__desktop/health')
        ->assertOk()
        ->assertJson([
            'status' => 'ok',
            'desktop' => true,
            'database' => config('database.default'),
        ]);
});
