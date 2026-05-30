<?php

namespace App\Providers;

use App\Services\WhatsApp\Contracts\WhatsAppService;
use App\Services\WhatsApp\Drivers\FonnteWhatsAppService;
use App\Services\WhatsApp\Drivers\LogWhatsAppService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
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

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
