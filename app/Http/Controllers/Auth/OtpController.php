<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Placeholder OTP controller. Logika kirim & verifikasi OTP akan
 * dipasang lengkap di Tahap 2 (WhatsApp Service & OTP).
 */
class OtpController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('Auth/VerifyOtp', [
            'phone' => $request->user()->phone,
            'status' => session('status'),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'digits:6'],
        ]);

        // Tahap 2 akan mengganti ini dengan verifikasi OTP via WhatsApp.
        throw ValidationException::withMessages([
            'code' => 'Verifikasi OTP belum aktif. Selesaikan Tahap 2 terlebih dahulu.',
        ]);
    }

    public function resend(Request $request): RedirectResponse
    {
        // Tahap 2 akan dispatch SendWhatsAppMessage berisi OTP baru.
        return back()->with('status', 'Fitur kirim ulang OTP akan aktif setelah Tahap 2.');
    }
}
