<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class WhatsAppSettingController extends Controller
{
    public function edit(): Response
    {
        $token = $this->effectiveSetting(
            AppSetting::FONNTE_TOKEN,
            config('whatsapp.drivers.fonnte.token'),
        );
        $device = $this->effectiveSetting(
            AppSetting::FONNTE_DEVICE,
            config('whatsapp.drivers.fonnte.device'),
        );

        return Inertia::render('Admin/WhatsAppSettings/Edit', [
            'driver' => config('whatsapp.driver', 'log'),
            'base_url' => config('whatsapp.drivers.fonnte.base_url', 'https://api.fonnte.com'),
            'token_configured' => filled($token),
            'token_hint' => AppSetting::mask($token),
            'device' => $device,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'fonnte_token' => ['nullable', 'string', 'max:500'],
            'fonnte_device' => ['nullable', 'string', 'max:100'],
        ]);

        // A blank token means "keep the existing token"; this prevents accidental deletion.
        if ($request->filled('fonnte_token')) {
            AppSetting::set(AppSetting::FONNTE_TOKEN, trim($data['fonnte_token']));
        }

        // An empty device falls back to FONNTE_DEVICE from .env.
        AppSetting::set(AppSetting::FONNTE_DEVICE, $data['fonnte_device'] ?? null);

        return back()->with('status', 'Pengaturan WhatsApp berhasil diperbarui.');
    }

    public function test(Request $request, WhatsAppService $whatsapp): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^[0-9+()\s-]{8,30}$/'],
        ]);

        $message = 'Pesan uji WhatsApp dari panel admin SPMB.';

        if (! $whatsapp->sendText($data['phone'], $message)) {
            return back()->with('error', 'Pesan uji gagal dikirim. Periksa token, device, dan log gateway.');
        }

        return back()->with('status', 'Pesan uji berhasil diproses oleh driver WhatsApp.');
    }

    protected function effectiveSetting(string $key, ?string $fallback): ?string
    {
        try {
            if (Schema::hasTable('app_settings')) {
                return AppSetting::value($key, $fallback);
            }
        } catch (Throwable) {
            // Use the environment value until the settings table is available.
        }

        return $fallback;
    }
}
