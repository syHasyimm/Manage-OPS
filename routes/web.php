<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\Admin\PeriodController as AdminPeriodController;
use App\Http\Controllers\Admin\RegistrationController as AdminRegistrationController;
use App\Http\Controllers\Admin\SchoolSettingController as AdminSchoolSettingController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicStatusController;
use App\Http\Controllers\RegistrationController;
use App\Models\RegistrationPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('/chatbot/message', [ChatbotController::class, 'handle'])
    ->middleware('throttle:20,1')
    ->name('chatbot.message');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'period' => RegistrationPeriod::active(),
    ]);
})->name('home');

Route::get('/cek-status', [PublicStatusController::class, 'show'])->name('public-status.show');
Route::post('/cek-status', [PublicStatusController::class, 'check'])
    ->middleware('throttle:public-status')
    ->name('public-status.check');
Route::get('/cek-status/{registration_number}/pdf', [PublicStatusController::class, 'downloadPdf'])
    ->name('registration.public-pdf');

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

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::get('/registrations/export', [AdminRegistrationController::class, 'export'])->name('registrations.export');
        Route::get('/registrations', [AdminRegistrationController::class, 'index'])->name('registrations.index');
        Route::get('/registrations/{registration}', [AdminRegistrationController::class, 'show'])->name('registrations.show');
        Route::post('/registrations/{registration}/verify', [AdminRegistrationController::class, 'verify'])->name('registrations.verify');
        Route::post('/registrations/{registration}/accept', [AdminRegistrationController::class, 'accept'])->name('registrations.accept');
        Route::post('/registrations/{registration}/reject', [AdminRegistrationController::class, 'reject'])->name('registrations.reject');
        Route::post('/registrations/{registration}/request-revision', [AdminRegistrationController::class, 'requestRevision'])->name('registrations.request-revision');
        Route::post('/registrations/{registration}/regenerate-pdf', [AdminRegistrationController::class, 'regeneratePdf'])->name('registrations.regenerate-pdf');

        Route::get('/periods', [AdminPeriodController::class, 'index'])->name('periods.index');
        Route::post('/periods', [AdminPeriodController::class, 'store'])->name('periods.store');
        Route::patch('/periods/{period}', [AdminPeriodController::class, 'update'])->name('periods.update');
        Route::post('/periods/{period}/activate', [AdminPeriodController::class, 'activate'])->name('periods.activate');

        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');

        Route::resource('faqs', AdminFaqController::class)->except(['show', 'create', 'edit']);

        Route::get('/school-settings', [AdminSchoolSettingController::class, 'edit'])->name('school-settings.edit');
        Route::match(['post', 'patch'], '/school-settings', [AdminSchoolSettingController::class, 'update'])->name('school-settings.update');
        Route::delete('/school-settings/logo', [AdminSchoolSettingController::class, 'deleteLogo'])->name('school-settings.logo.destroy');
        Route::delete('/school-settings/regency-logo', [AdminSchoolSettingController::class, 'deleteRegencyLogo'])->name('school-settings.regency-logo.destroy');
    });

require __DIR__.'/auth.php';
