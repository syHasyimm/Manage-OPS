<?php

namespace App\Http\Controllers;

use App\Http\Requests\Registration\StoreStep1Request;
use App\Http\Requests\Registration\StoreStep2Request;
use App\Http\Requests\Registration\StoreStep3Request;
use App\Models\Registration;
use App\Models\StudentParent;
use App\Services\RegistrationService;
use App\Support\RegistrationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    public function submit(Request $request): RedirectResponse
    {
        // Implementasi penuh di Tahap 5 (generate nomor + PDF + WA).
        return redirect()->route('registration.review')
            ->with('status', 'Submit final akan tersedia setelah Tahap 5 selesai.');
    }

    protected function upsertParent(Registration $registration, string $role, array $data): void
    {
        $registration->parents()->updateOrCreate(
            ['role' => $role],
            array_merge($data, ['role' => $role]),
        );
    }
}
