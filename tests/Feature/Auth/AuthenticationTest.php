<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using phone + password', function () {
    $user = User::factory()->create([
        'phone' => '081234567890',
    ]);

    $response = $this->post('/login', [
        'phone' => $user->phone,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create([
        'phone' => '081234567891',
    ]);

    $this->post('/login', [
        'phone' => $user->phone,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('admin login redirects to admin dashboard', function () {
    $admin = User::factory()->admin()->create([
        'phone' => '081234567892',
    ]);

    $response = $this->post('/login', [
        'phone' => $admin->phone,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
