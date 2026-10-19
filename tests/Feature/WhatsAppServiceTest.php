<?php

use App\Models\AppSetting;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

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

test('Fonnte falls back to the environment token when no stored token exists', function () {
    config([
        'whatsapp.driver' => 'fonnte',
        'whatsapp.drivers.fonnte.token' => 'env-token',
        'whatsapp.drivers.fonnte.base_url' => 'https://api.fonnte.test',
    ]);

    Http::fake([
        'https://api.fonnte.test/*' => Http::response(['status' => true], 200),
    ]);

    expect(app(WhatsAppService::class)->sendText('081200000000', 'SPMB confirmation'))->toBeTrue();

    Http::assertSent(fn (Request $request) => $request->hasHeader('Authorization', 'env-token'));
});

test('stored Fonnte tokens remain encrypted during technical maintenance', function () {
    AppSetting::set(AppSetting::FONNTE_TOKEN, 'stored-token');

    expect(AppSetting::query()->where('key', AppSetting::FONNTE_TOKEN)->value('value'))
        ->not->toBe('stored-token');
    expect(AppSetting::value(AppSetting::FONNTE_TOKEN))->toBe('stored-token');

    AppSetting::set(AppSetting::FONNTE_TOKEN, 'updated-token');
    expect(AppSetting::value(AppSetting::FONNTE_TOKEN))->toBe('updated-token');

    AppSetting::set(AppSetting::FONNTE_TOKEN, null);
    expect(AppSetting::value(AppSetting::FONNTE_TOKEN, 'env-token'))->toBe('env-token');
});
