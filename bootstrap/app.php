<?php

use App\Http\Middleware\EnsurePhoneVerified;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'verified.phone' => EnsurePhoneVerified::class,
            'admin' => EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

if ($desktopDataDirectory = env('SPMB_DESKTOP_DATA_DIR')) {
    $app->addAbsoluteCachePathPrefix($desktopDataDirectory);
    $app->useStoragePath(rtrim($desktopDataDirectory, '\\/').DIRECTORY_SEPARATOR.'storage');
}

return $app;
