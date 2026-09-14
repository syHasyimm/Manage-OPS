<?php

use App\Http\Controllers\Admin\AcademicCalendarController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Admin\GraduationLetterController as AdminGraduationLetterController;
use App\Http\Controllers\Admin\KartuNisnController as AdminKartuNisnController;
use App\Http\Controllers\Admin\NotificationTemplateController as AdminNotificationTemplateController;
use App\Http\Controllers\Admin\PeriodController as AdminPeriodController;
use App\Http\Controllers\Admin\RegistrationController as AdminRegistrationController;
use App\Http\Controllers\Admin\SchoolSettingController as AdminSchoolSettingController;
use App\Http\Controllers\Admin\SppdController as AdminSppdController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\StudentNotificationController as AdminStudentNotificationController;
use App\Http\Controllers\Admin\StudentPhotoController;
use App\Http\Controllers\Admin\SuratTugasController as AdminSuratTugasController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\WhatsAppSettingController as AdminWhatsAppSettingController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\DesktopController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicStatusController;
use App\Http\Controllers\RegistrationController;
use App\Models\RegistrationPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

Route::prefix('__desktop')->name('desktop.')->group(function () {
    Route::get('/health', [DesktopController::class, 'health'])->name('health');
    Route::get('/start', [DesktopController::class, 'start'])->name('start');
    Route::get('/setup', [DesktopController::class, 'create'])->name('setup');
    Route::post('/setup', [DesktopController::class, 'store'])->name('setup.store');
});

// Pada paket desktop folder instalasi bersifat read-only, sehingga symlink
// public/storage digantikan route aman menuju storage di AppData.
Route::get('/storage/{path}', function (string $path) {
    abort_if(Str::contains($path, ['..', "\0"]), 404);

    $disk = Storage::disk('public');
    abort_unless($disk->exists($path), 404);

    return response()->file($disk->path($path));
})->where('path', '.*')->name('desktop.storage');

Route::post('/chatbot/message', [ChatbotController::class, 'handle'])
    ->middleware('throttle:20,1')
    ->name('chatbot.message');

Route::get('/', LandingController::class)->name('home');

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
            'isOpen' => (bool) $period?->isOpen(),
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
        Route::post('/periods/{period}/deactivate', [AdminPeriodController::class, 'deactivate'])->name('periods.deactivate');

        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');

        Route::resource('faqs', AdminFaqController::class)->except(['show', 'create', 'edit']);

        Route::get('/kartu-nisn', [AdminKartuNisnController::class, 'index'])->name('kartu-nisn.index');
        Route::post('/kartu-nisn/desain', [AdminKartuNisnController::class, 'updateDesain'])->name('kartu-nisn.desain.update');
        Route::delete('/kartu-nisn/desain/{field}', [AdminKartuNisnController::class, 'deleteAsset'])->name('kartu-nisn.desain.asset.destroy');
        Route::get('/kartu-nisn/print', [AdminKartuNisnController::class, 'print'])->name('kartu-nisn.print');

        Route::get('/notifications', [AdminStudentNotificationController::class, 'index'])->name('notifications.index');
        Route::get('/notifications/create', [AdminStudentNotificationController::class, 'create'])->name('notifications.create');
        Route::get('/notifications/students', [AdminStudentNotificationController::class, 'searchStudents'])->name('notifications.students');
        Route::post('/notifications', [AdminStudentNotificationController::class, 'store'])->name('notifications.store');
        Route::post('/notifications/{studentNotification}/retry', [AdminStudentNotificationController::class, 'retry'])->name('notifications.retry');

        Route::resource('notification-templates', AdminNotificationTemplateController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
        Route::get('/documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
        Route::resource('documents', DocumentController::class)->except(['show']);

        Route::get('/staff/export', [StaffController::class, 'export'])->name('staff.export');
        Route::get('/staff/template', [StaffController::class, 'template'])->name('staff.template');
        Route::get('/staff/import', [StaffController::class, 'importForm'])->name('staff.import.create');
        Route::post('/staff/import', [StaffController::class, 'import'])->name('staff.import.store');
        Route::resource('staff', StaffController::class)->except(['show']);

        Route::resource('academic-calendars', AcademicCalendarController::class)->except(['create', 'edit', 'show']);

        Route::get('/students/export', [AdminStudentController::class, 'export'])->name('students.export');
        Route::get('/students/template', [AdminStudentController::class, 'template'])->name('students.template');
        Route::get('/students/import-photos', [StudentPhotoController::class, 'create'])->name('students.import-photos.create');
        Route::post('/students/import-photos', [StudentPhotoController::class, 'store'])->name('students.import-photos.store');
        Route::get('/students/import', [AdminStudentController::class, 'importForm'])->name('students.import.create');
        Route::post('/students/import', [AdminStudentController::class, 'import'])->name('students.import.store');
        Route::resource('students', AdminStudentController::class)->except(['show']);

        Route::get('/surat-tugas', [AdminSuratTugasController::class, 'create'])->name('surat-tugas.create');
        Route::post('/surat-tugas', [AdminSuratTugasController::class, 'store'])->name('surat-tugas.store');
        Route::get('/surat-tugas/download', [AdminSuratTugasController::class, 'download'])->name('surat-tugas.download');

        Route::get('/sppd', [AdminSppdController::class, 'create'])->name('sppd.create');
        Route::post('/sppd', [AdminSppdController::class, 'store'])->name('sppd.store');
        Route::get('/sppd/download', [AdminSppdController::class, 'download'])->name('sppd.download');

        Route::get('/graduation-letters/template', [AdminGraduationLetterController::class, 'template'])->name('graduation-letters.template');
        Route::get('/graduation-letters/import', [AdminGraduationLetterController::class, 'importForm'])->name('graduation-letters.import.create');
        Route::post('/graduation-letters/import', [AdminGraduationLetterController::class, 'import'])->name('graduation-letters.import.store');
        Route::get('/graduation-letters', [AdminGraduationLetterController::class, 'index'])->name('graduation-letters.index');
        Route::get('/graduation-letters/create', [AdminGraduationLetterController::class, 'create'])->name('graduation-letters.create');
        Route::post('/graduation-letters', [AdminGraduationLetterController::class, 'store'])->name('graduation-letters.store');
        Route::get('/graduation-letters/{graduationLetter}/download', [AdminGraduationLetterController::class, 'download'])->name('graduation-letters.download');
        Route::post('/graduation-letters/{graduationLetter}/finalize', [AdminGraduationLetterController::class, 'finalize'])->name('graduation-letters.finalize');
        Route::delete('/graduation-letters/{graduationLetter}', [AdminGraduationLetterController::class, 'destroy'])->name('graduation-letters.destroy');

        Route::get('/school-settings', [AdminSchoolSettingController::class, 'edit'])->name('school-settings.edit');
        Route::match(['post', 'patch'], '/school-settings', [AdminSchoolSettingController::class, 'update'])->name('school-settings.update');
        Route::delete('/school-settings/logo', [AdminSchoolSettingController::class, 'deleteLogo'])->name('school-settings.logo.destroy');
        Route::delete('/school-settings/regency-logo', [AdminSchoolSettingController::class, 'deleteRegencyLogo'])->name('school-settings.regency-logo.destroy');
        Route::get('/whatsapp-settings', [AdminWhatsAppSettingController::class, 'edit'])->name('whatsapp-settings.edit');
        Route::patch('/whatsapp-settings', [AdminWhatsAppSettingController::class, 'update'])->name('whatsapp-settings.update');
        Route::post('/whatsapp-settings/test', [AdminWhatsAppSettingController::class, 'test'])
            ->middleware('throttle:5,1')
            ->name('whatsapp-settings.test');
    });

require __DIR__.'/auth.php';
