<?php

use App\Models\AppSetting;
use App\Models\User;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

test('only admins can access WhatsApp settings', function () {
    $user = User::factory()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('admin.whatsapp-settings.edit'))
        ->assertForbidden();

    $this->actingAsGuest()
        ->get(route('admin.whatsapp-settings.edit'))
        ->assertRedirect(route('login'));
});

test('admin can save encrypted Fonnte settings', function () {
    $admin = User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.whatsapp-settings.update'), [
            'fonnte_token' => 'database-fonnte-token',
            'fonnte_device' => 'device-01',
        ])
        ->assertRedirect();

    $stored = AppSetting::query()->where('key', AppSetting::FONNTE_TOKEN)->first();

    expect($stored)->not->toBeNull()
        ->and($stored->value)->not->toBe('database-fonnte-token')
        ->and(AppSetting::value(AppSetting::FONNTE_TOKEN))->toBe('database-fonnte-token')
        ->and(AppSetting::value(AppSetting::FONNTE_DEVICE))->toBe('device-01');
});

test('blank token keeps the existing token while device can be updated', function () {
    $admin = User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);

    AppSetting::set(AppSetting::FONNTE_TOKEN, 'existing-token');
    AppSetting::set(AppSetting::FONNTE_DEVICE, 'old-device');

    $this->actingAs($admin)
        ->patch(route('admin.whatsapp-settings.update'), [
            'fonnte_token' => '',
            'fonnte_device' => 'new-device',
        ])
        ->assertRedirect();

    expect(AppSetting::value(AppSetting::FONNTE_TOKEN))->toBe('existing-token')
        ->and(AppSetting::value(AppSetting::FONNTE_DEVICE))->toBe('new-device');
});

test('Fonnte uses the database token without an unsupported device payload', function () {
    config([
        'whatsapp.driver' => 'fonnte',
        'whatsapp.drivers.fonnte.token' => 'env-token',
        'whatsapp.drivers.fonnte.device' => 'env-device',
    ]);

    AppSetting::set(AppSetting::FONNTE_TOKEN, 'database-token');
    AppSetting::set(AppSetting::FONNTE_DEVICE, 'database-device');

    Http::fake([
        'https://api.fonnte.test/*' => Http::response(['status' => true], 200),
    ]);
    config(['whatsapp.drivers.fonnte.base_url' => 'https://api.fonnte.test']);

    expect(app(WhatsAppService::class)->sendText('081200000000', 'Test message'))->toBeTrue();

    Http::assertSent(function (Request $request) {
        return $request->hasHeader('Authorization', 'database-token')
            && ! isset($request->data()['device']);
    });
});

test('admin can send a WhatsApp test message', function () {
    $admin = User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);

    config([
        'whatsapp.driver' => 'fonnte',
        'whatsapp.drivers.fonnte.base_url' => 'https://api.fonnte.test',
    ]);
    AppSetting::set(AppSetting::FONNTE_TOKEN, 'database-token');

    Http::fake([
        'https://api.fonnte.test/*' => Http::response(['status' => true], 200),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.whatsapp-settings.test'), [
            'phone' => '081200000000',
        ])
        ->assertRedirect()
        ->assertSessionHas('status', 'Pesan uji berhasil diproses oleh driver WhatsApp.');

    Http::assertSent(fn (Request $request) => $request['target'] === '6281200000000');
});
