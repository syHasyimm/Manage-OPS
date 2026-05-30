<?php

namespace App\Providers;

use App\Services\WhatsApp\Contracts\WhatsAppService;
use App\Services\WhatsApp\Drivers\FonnteWhatsAppService;
use App\Services\WhatsApp\Drivers\LogWhatsAppService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(WhatsAppService::class, function ($app) {
            $driver = config('whatsapp.driver', 'log');

            return match ($driver) {
                'fonnte' => new FonnteWhatsAppService(
                    token: config('whatsapp.drivers.fonnte.token'),
                    baseUrl: config('whatsapp.drivers.fonnte.base_url', 'https://api.fonnte.com'),
                    timeout: (int) config('whatsapp.drivers.fonnte.timeout', 15),
                ),
                default => new LogWhatsAppService(),
            };
        });
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->configureRateLimiters();
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
