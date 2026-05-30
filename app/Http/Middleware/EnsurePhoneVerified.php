<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneVerified
{
    /**
     * Block akses jika user belum memverifikasi nomor WhatsApp-nya.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->isAdmin() || $user->isPhoneVerified()) {
            return $next($request);
        }

        return $request->expectsJson()
            ? response()->json(['message' => 'Nomor WhatsApp belum diverifikasi.'], 403)
            : redirect()->route('verification.notice');
    }
}
