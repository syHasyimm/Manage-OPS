<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrationController;
use App\Models\RegistrationPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'period' => RegistrationPeriod::active(),
    ]);
})->name('home');

Route::middleware(['auth', 'verified.phone'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();
        $period = RegistrationPeriod::active();
        $registration = $user->registrations()
            ->with(['identity', 'period'])
            ->when($period, fn ($q) => $q->where('period_id', $period->id))
            ->latest('id')
            ->first();

        return Inertia::render('Dashboard', [
            'period' => $period,
            'registration' => $registration ? [
                'id' => $registration->id,
                'status' => $registration->status,
                'current_step' => $registration->current_step,
                'registration_number' => $registration->registration_number,
                'submitted_at' => $registration->submitted_at,
                'admin_note' => $registration->admin_note,
                'pdf_ready' => (bool) $registration->pdf_path,
                'student_name' => $registration->identity?->full_name,
                'period' => $registration->period?->academic_year,
            ] : null,
        ]);
    })->name('dashboard');

    Route::prefix('registration')->name('registration.')->group(function () {
        Route::get('/start', [RegistrationController::class, 'start'])->name('start');
        Route::get('/step/{step}', [RegistrationController::class, 'showStep'])
            ->whereNumber('step')
            ->name('step');
        Route::post('/step/1', [RegistrationController::class, 'storeStep1'])->name('step.1.store');
        Route::post('/step/2', [RegistrationController::class, 'storeStep2'])->name('step.2.store');
        Route::post('/step/3', [RegistrationController::class, 'storeStep3'])->name('step.3.store');
        Route::get('/review', [RegistrationController::class, 'review'])->name('review');
        Route::post('/submit', [RegistrationController::class, 'submit'])->name('submit');
        Route::get('/{registration}/success', [RegistrationController::class, 'success'])
            ->whereNumber('registration')
            ->name('success');
        Route::get('/{registration}/pdf', [RegistrationController::class, 'downloadPdf'])
            ->whereNumber('registration')
            ->name('pdf');
        Route::post('/{registration}/resend-wa', [RegistrationController::class, 'resendWa'])
            ->whereNumber('registration')
            ->name('resend-wa');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
