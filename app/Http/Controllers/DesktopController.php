<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class DesktopController extends Controller
{
    public function health(): JsonResponse
    {
        $this->ensureDesktopMode();
        DB::connection()->getPdo();

        return response()->json([
            'status' => 'ok',
            'desktop' => true,
            'database' => DB::getDefaultConnection(),
        ]);
    }

    public function start(Request $request): RedirectResponse
    {
        $this->ensureDesktopMode();

        if (! User::query()->where('role', User::ROLE_ADMIN)->exists()) {
            return redirect()->route('desktop.setup');
        }

        if ($request->user()?->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('login');
    }

    public function create(): View|RedirectResponse
    {
        $this->ensureDesktopMode();

        if (User::query()->where('role', User::ROLE_ADMIN)->exists()) {
            return redirect()->route('login');
        }

        return view('desktop.setup');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureDesktopMode();

        if (User::query()->where('role', User::ROLE_ADMIN)->exists()) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^08[0-9]{8,12}$/', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(fn () => User::query()->create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'password' => $validated['password'],
            'role' => User::ROLE_ADMIN,
            'phone_verified_at' => now(),
        ]));

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    private function ensureDesktopMode(): void
    {
        abort_unless(config('desktop.enabled'), 404);
    }
}
