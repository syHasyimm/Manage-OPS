<?php

namespace App\Http\Controllers;

use App\Models\RegistrationPeriod;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /** Tampilkan landing page khusus informasi dan pendaftaran SPMB. */
    public function __invoke(): Response
    {
        $period = RegistrationPeriod::active();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'period' => $period,
        ]);
    }
}
