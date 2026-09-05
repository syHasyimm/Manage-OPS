<?php

namespace App\Providers;

use App\Models\AppSetting;
use App\Models\SchoolSetting;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use App\Services\WhatsApp\Drivers\FonnteWhatsAppService;
use App\Services\WhatsApp\Drivers\LogWhatsAppService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->scoped(WhatsAppService::class, function () {
            $driver = config('whatsapp.driver', 'log');
            $token = config('whatsapp.drivers.fonnte.token');

            // Queue workers are long-lived, so resolve admin settings for each job lifecycle.
            try {
                if (Schema::hasTable('app_settings')) {
                    $token = AppSetting::value(AppSetting::FONNTE_TOKEN, $token);
                }
            } catch (Throwable) {
                // Use .env fallback while the database is unavailable or not migrated yet.
            }

            return match ($driver) {
                'fonnte' => new FonnteWhatsAppService(
                    token: $token,
                    baseUrl: config('whatsapp.drivers.fonnte.base_url', 'https://api.fonnte.com'),
                    timeout: (int) config('whatsapp.drivers.fonnte.timeout', 15),
                ),
                default => new LogWhatsAppService,
            };
        });
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->configureRateLimiters();
        $this->overrideSchoolConfigFromDatabase();
    }

    /**
     * Override config('spmb.school.*') dengan nilai dari tabel school_settings,
     * sehingga semua call site yang sudah pakai config tetap berfungsi.
     */
    protected function overrideSchoolConfigFromDatabase(): void
    {
        // Hindari error saat artisan migrate / install awal sebelum tabel ada.
        try {
            if (! Schema::hasTable('school_settings')) {
                return;
            }

            $setting = SchoolSetting::current();

            config([
                'spmb.school.name' => $setting->name,
                'spmb.school.district' => $setting->district,
                'spmb.school.address' => $setting->fullAddress() ?: config('spmb.school.address'),
                'spmb.school.principal' => $setting->principal_name ?: config('spmb.school.principal'),
                'spmb.school.phone' => $setting->phone ?: config('spmb.school.phone'),
                'spmb.school.email' => $setting->email ?: config('spmb.school.email'),
                'spmb.school.logo_path' => $setting->logo_path ?: config('spmb.school.logo_path'),
            ]);
        } catch (Throwable $e) {
            // Diam saja: jika DB belum siap (mis. saat migrate fresh), pakai config default.
        }
    }

    protected function configureRateLimiters(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $key = strtolower((string) $request->input('phone')).'|'.$request->ip();

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('otp-send', function (Request $request) {
            $phone = optional($request->user())->phone ?? $request->input('phone') ?? $request->ip();

            return Limit::perMinute(1)->by('otp-send|'.$phone);
        });

        RateLimiter::for('otp-verify', function (Request $request) {
            $phone = optional($request->user())->phone ?? $request->ip();

            return Limit::perMinute(5)->by('otp-verify|'.$phone);
        });

        RateLimiter::for('public-status', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
    }
}
