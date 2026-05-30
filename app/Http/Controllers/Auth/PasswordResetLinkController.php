<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Validasi nomor & kirim OTP via WhatsApp untuk reset password.
     *
     * @throws ValidationException
     */
    public function store(Request $request, OtpService $otp): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^08[0-9]{8,12}$/'],
        ], [
            'phone.regex' => 'Format nomor HP tidak valid (contoh: 081234567890).',
        ]);

        $user = User::where('phone', $validated['phone'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor HP tidak terdaftar.',
            ]);
        }

        if (! $otp->canResend($user->phone, OtpService::PURPOSE_RESET)) {
            $seconds = $otp->secondsUntilResend($user->phone, OtpService::PURPOSE_RESET);

            return redirect()
                ->route('password.reset.form', ['phone' => $user->phone])
                ->with('status', "Tunggu {$seconds} detik sebelum kirim ulang OTP.");
        }

        $otp->generate($user->phone, OtpService::PURPOSE_RESET, $request->ip());

        return redirect()
            ->route('password.reset.form', ['phone' => $user->phone])
            ->with('status', 'Kode OTP telah dikirim ke WhatsApp Anda.');
    }
}
