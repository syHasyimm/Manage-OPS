<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
     * Handle phone submission. OTP dispatch akan diisi pada Tahap 2.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
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

        return redirect()
            ->route('password.reset.form', ['phone' => $user->phone])
            ->with('status', 'Lanjutkan untuk verifikasi OTP & atur password baru.');
    }
}
