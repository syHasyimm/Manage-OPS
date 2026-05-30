<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'phone' => $request->query('phone'),
            'status' => session('status'),
        ]);
    }

    /**
     * Reset password dengan verifikasi OTP via WhatsApp.
     *
     * @throws ValidationException
     */
    public function store(Request $request, OtpService $otp): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^08[0-9]{8,12}$/'],
            'code' => ['required', 'string', 'digits:6'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'phone.regex' => 'Format nomor HP tidak valid.',
            'code.digits' => 'Kode OTP harus 6 digit.',
        ]);

        $user = User::where('phone', $validated['phone'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor HP tidak terdaftar.',
            ]);
        }

        if (! $otp->verify($user->phone, $validated['code'], OtpService::PURPOSE_RESET)) {
            throw ValidationException::withMessages([
                'code' => 'Kode OTP tidak valid atau sudah kadaluarsa.',
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'remember_token' => Str::random(60),
        ])->save();

        return redirect()
            ->route('login')
            ->with('status', 'Password berhasil diubah. Silakan login.');
    }
}
