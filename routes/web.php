<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::middleware(['auth', 'verified.phone'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
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
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
