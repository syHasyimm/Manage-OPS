<?php

namespace App\Http\Controllers;

use App\Http\Requests\Registration\StoreStep1Request;
use App\Http\Requests\Registration\StoreStep2Request;
use App\Http\Requests\Registration\StoreStep3Request;
use App\Jobs\GenerateRegistrationPdf;
use App\Jobs\SendPrintInstructionNotification;
use App\Jobs\SendRegistrationConfirmation;
use App\Models\Registration;
use App\Models\StudentParent;
use App\Models\WhatsappLog;
use App\Services\RegistrationNumberGenerator;
use App\Services\RegistrationService;
use App\Support\RegistrationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function __construct(protected RegistrationService $registrations) {}

    public function start(Request $request): RedirectResponse
    {
        $registration = $this->registrations->getOrCreateForUser($request->user());

        if (! $registration) {
            return redirect()->route('dashboard')->with('status', 'Periode pendaftaran belum dibuka.');
        }

        return redirect()->route('registration.step', ['step' => $registration->current_step]);
    }

    public function showStep(Request $request, int $step): Response|RedirectResponse
    {
        if ($step < 1 || $step > 3) {
            return redirect()->route('registration.start');
        }

        $registration = $this->registrations->getOrCreateForUser($request->user());

        if (! $registration) {
            return redirect()->route('dashboard')->with('status', 'Periode pendaftaran belum dibuka.');
        }

        $registration->load(['identity', 'periodic', 'parents', 'period']);

        return Inertia::render("Registration/Step{$step}", [
            'registration' => [
                'id' => $registration->id,
                'status' => $registration->status,
                'current_step' => $registration->current_step,
                'has_guardian' => $registration->has_guardian,
                'contact_email' => $registration->contact_email,
                'period' => [
                    'academic_year' => $registration->period->academic_year,
                ],
                'identity' => $registration->identity,
                'periodic' => $registration->periodic,
                'parents' => $registration->parents->keyBy('role'),
            ],
            'options' => RegistrationOptions::all(),
            'school' => [
                'name' => config('spmb.school.name'),
                'district' => config('spmb.school.district'),
            ],
            'editable' => $this->registrations->isEditable($registration),
        ]);
    }

    public function storeStep1(StoreStep1Request $request): RedirectResponse
    {
        $registration = $this->registrations->getOrCreateForUser($request->user());
        abort_if(! $registration, 404);
        abort_unless($this->registrations->isEditable($registration), 403, 'Pendaftaran tidak dapat diubah.');

        $data = $request->validated();
        $data['school_name'] = config('spmb.school.name');
        $data['district'] = config('spmb.school.district');
        $data['special_needs_types'] = $data['has_special_needs']
            ? ($data['special_needs_types'] ?? [])
            : null;

        $registration->identity()->updateOrCreate(
            ['registration_id' => $registration->id],
            $data,
        );

        $this->registrations->advanceStep($registration, 1);

        return redirect()->route('registration.step', ['step' => 2])
            ->with('status', 'Data Identitas tersimpan.');
    }

    public function storeStep2(StoreStep2Request $request): RedirectResponse
    {
        $registration = $this->registrations->getOrCreateForUser($request->user());
        abort_if(! $registration, 404);
        abort_unless($this->registrations->isEditable($registration), 403);

        $data = $request->validated();
        if ($data['distance_category'] === '<1km') {
            $data['distance_km'] = null;
        }

        $registration->periodic()->updateOrCreate(
            ['registration_id' => $registration->id],
            $data,
        );

        $this->registrations->advanceStep($registration, 2);

        return redirect()->route('registration.step', ['step' => 3])
            ->with('status', 'Data Periodik tersimpan.');
    }

    public function storeStep3(StoreStep3Request $request): RedirectResponse
    {
        $registration = $this->registrations->getOrCreateForUser($request->user());
        abort_if(! $registration, 404);
        abort_unless($this->registrations->isEditable($registration), 403);

        $data = $request->validated();

        DB::transaction(function () use ($registration, $data) {
            $registration->forceFill([
                'has_guardian' => (bool) $data['has_guardian'],
                'contact_email' => $data['contact_email'],
            ])->save();

            $this->upsertParent($registration, StudentParent::ROLE_FATHER, $data['father']);
            $this->upsertParent($registration, StudentParent::ROLE_MOTHER, $data['mother']);

            if (! empty($data['has_guardian']) && ! empty($data['guardian'])) {
                $this->upsertParent($registration, StudentParent::ROLE_GUARDIAN, $data['guardian']);
            } else {
                $registration->parents()->where('role', StudentParent::ROLE_GUARDIAN)->delete();
            }
        });

        $this->registrations->advanceStep($registration, 3);

        return redirect()->route('registration.review')
            ->with('status', 'Data Orang Tua / Wali tersimpan.');
    }

    public function review(Request $request): Response|RedirectResponse
    {
        $registration = $this->registrations->getOrCreateForUser($request->user());
        if (! $registration) {
            return redirect()->route('dashboard');
        }

        $registration->load(['identity', 'periodic', 'parents', 'period']);

        return Inertia::render('Registration/Review', [
            'registration' => $registration,
            'options' => RegistrationOptions::all(),
            'school' => [
                'name' => config('spmb.school.name'),
                'district' => config('spmb.school.district'),
            ],
            'editable' => $this->registrations->isEditable($registration),
        ]);
    }

    public function submit(Request $request, RegistrationNumberGenerator $generator): RedirectResponse
    {
        $registration = $this->registrations->getOrCreateForUser($request->user());
        abort_if(! $registration, 404);
        abort_unless($this->registrations->isEditable($registration), 403, 'Pendaftaran tidak dapat diubah.');

        $registration->load(['period', 'identity', 'periodic', 'parents']);
        $period = $registration->period;

        if (! $period || ! $period->isOpen()) {
            return back()->with('status', 'Periode pendaftaran sedang tidak dibuka.');
        }

        // Validasi kelengkapan
        if (! $registration->identity || ! $registration->periodic) {
            return redirect()->route('registration.start')
                ->with('status', 'Lengkapi terlebih dahulu Step 1 dan Step 2.');
        }

        $hasFather = $registration->parents->contains('role', 'father');
        $hasMother = $registration->parents->contains('role', 'mother');
        if (! $hasFather || ! $hasMother || empty($registration->contact_email)) {
            return redirect()->route('registration.step', ['step' => 3])
                ->with('status', 'Lengkapi data Ayah, Ibu, dan email kontak.');
        }

        DB::transaction(function () use ($registration, $generator) {
            if (empty($registration->registration_number)) {
                $registration->registration_number = $generator->generate($registration);
            }

            $registration->forceFill([
                'status' => Registration::STATUS_SUBMITTED,
                'submitted_at' => now(),
                'current_step' => 3,
            ])->save();
        });

        // Generate PDF dulu, lalu kirim WA setelah PDF tersedia.
        Bus::chain([
            new GenerateRegistrationPdf($registration->id),
            new SendRegistrationConfirmation($registration->id),
        ])->dispatch();

        return redirect()
            ->route('registration.success', ['registration' => $registration->id])
            ->with('status', 'Pendaftaran berhasil disubmit.');
    }

    public function success(Request $request, Registration $registration): Response|RedirectResponse
    {
        if ($registration->user_id !== $request->user()->id) {
            abort(403);
        }

        $registration->load(['identity', 'period']);

        return Inertia::render('Registration/Success', [
            'registration' => [
                'id' => $registration->id,
                'registration_number' => $registration->registration_number,
                'status' => $registration->status,
                'submitted_at' => $registration->submitted_at,
                'pdf_ready' => (bool) $registration->pdf_path,
                'student_name' => $registration->identity?->full_name,
                'period' => $registration->period?->academic_year,
            ],
        ]);
    }

    public function downloadPdf(Request $request, Registration $registration)
    {
        if ($registration->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        if (! $registration->pdf_path || ! Storage::disk('public')->exists($registration->pdf_path)) {
            abort(404, 'PDF belum siap. Coba lagi beberapa saat.');
        }

        $this->maybeDispatchPrintInstruction($request, $registration);

        $filename = ($registration->registration_number ?? 'pendaftaran').'.pdf';

        return Storage::disk('public')->download($registration->pdf_path, $filename);
    }

    /**
     * Kirim notifikasi WA berisi instruksi cetak & finalisasi ke sekolah.
     * Hanya dipanggil sekali per registrasi (idempotent via WhatsappLog).
     * Tidak dipicu untuk admin atau bila status sudah lewat fase verifikasi.
     */
    protected function maybeDispatchPrintInstruction(Request $request, Registration $registration): void
    {
        $user = $request->user();

        if ($registration->user_id !== $user->id) {
            return;
        }

        if (! in_array($registration->status, [
            Registration::STATUS_SUBMITTED,
            Registration::STATUS_VERIFIED,
        ], true)) {
            return;
        }

        $registration->loadMissing('identity');
        $phone = $registration->identity?->phone_wa ?? $user->phone;
        if (empty($phone)) {
            return;
        }

        $alreadySent = WhatsappLog::query()
            ->where('purpose', SendPrintInstructionNotification::PURPOSE)
            ->where('to', $phone)
            ->where('message', 'like', '%'.$registration->registration_number.'%')
            ->whereIn('status', [WhatsappLog::STATUS_SENT, WhatsappLog::STATUS_PENDING])
            ->exists();

        if ($alreadySent) {
            return;
        }

        SendPrintInstructionNotification::dispatch($registration->id);
    }

    public function resendWa(Request $request, Registration $registration): RedirectResponse
    {
        if ($registration->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        if (! $registration->isSubmitted()) {
            return back()->with('status', 'Pendaftaran belum disubmit.');
        }

        SendRegistrationConfirmation::dispatch($registration->id);

        return back()->with('status', 'Notifikasi WhatsApp dijadwalkan ulang.');
    }

    protected function upsertParent(Registration $registration, string $role, array $data): void
    {
        $registration->parents()->updateOrCreate(
            ['role' => $role],
            array_merge($data, ['role' => $role]),
        );
    }
}
