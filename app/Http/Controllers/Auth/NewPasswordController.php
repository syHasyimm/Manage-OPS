<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
     * NOTE: Verifikasi OTP akan dipasang di Tahap 2. Saat ini stub minimal.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^08[0-9]{8,12}$/'],
            'code' => ['required', 'string', 'digits:6'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::where('phone', $validated['phone'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor HP tidak terdaftar.',
            ]);
        }

        // Placeholder: OTP belum diverifikasi (Tahap 2). Untuk sementara block.
        throw ValidationException::withMessages([
            'code' => 'Verifikasi OTP belum tersedia. Tunggu rilis fitur lengkap.',
        ]);

        // Pseudocode Tahap 2:
        // if (!$otp->verify(...)) throw ...
        // $user->forceFill([...])->save();
        // return redirect()->route('login')->with('status', '...');
    }
}
