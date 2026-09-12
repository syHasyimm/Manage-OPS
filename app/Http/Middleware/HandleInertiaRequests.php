<?php

namespace App\Http\Middleware;

use App\Models\SchoolSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;
use Throwable;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $schoolSetting = null;
        try {
            if (Schema::hasTable('school_settings')) {
                $schoolSetting = SchoolSetting::current();
            }
        } catch (Throwable) {
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'phone' => $request->user()->phone,
                    'role' => $request->user()->role,
                    'phone_verified_at' => $request->user()->phone_verified_at,
                ] : null,
            ],
            'school' => [
                'name' => config('spmb.school.name', 'SD Negeri 001 Kepenuhan'),
                'district' => config('spmb.school.district', 'Kepenuhan'),
                'address' => config('spmb.school.address'),
                'phone' => config('spmb.school.phone'),
                'email' => config('spmb.school.email'),
                'logo_url' => $schoolSetting?->logoUrl(),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
