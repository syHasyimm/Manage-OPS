<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isPhoneVerified()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/VerifyOtp', [
            'phone' => $user->phone,
            'status' => session('status'),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function verify(Request $request, OtpService $otp): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'digits:6'],
        ], [
            'code.digits' => 'Kode OTP harus 6 digit.',
        ]);

        $user = $request->user();

        if ($user->isPhoneVerified()) {
            return redirect()->route('dashboard');
        }

        if (! $otp->verify($user->phone, $validated['code'], OtpService::PURPOSE_REGISTER)) {
            throw ValidationException::withMessages([
                'code' => 'Kode OTP tidak valid atau sudah kadaluarsa.',
            ]);
        }

        $user->markPhoneAsVerified();

        return redirect()
            ->route('dashboard')
            ->with('status', 'Nomor WhatsApp berhasil diverifikasi.');
    }

    public function resend(Request $request, OtpService $otp): RedirectResponse
    {
        $user = $request->user();

        if ($user->isPhoneVerified()) {
            return redirect()->route('dashboard');
        }

        if (! $otp->canResend($user->phone, OtpService::PURPOSE_REGISTER)) {
            $seconds = $otp->secondsUntilResend($user->phone, OtpService::PURPOSE_REGISTER);

            return back()->with('status', "Tunggu {$seconds} detik sebelum kirim ulang OTP.");
        }

        $otp->generate($user->phone, OtpService::PURPOSE_REGISTER, $request->ip());

        return back()->with('status', 'Kode OTP baru telah dikirim ke WhatsApp Anda.');
    }
}
