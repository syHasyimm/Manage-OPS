<?php

namespace App\Http\Controllers\Admin;

use App\Exports\RegistrationsExport;
use App\Http\Controllers\Controller;
use App\Jobs\SendStatusUpdateNotification;
use App\Models\Registration;
use App\Models\RegistrationPeriod;
use App\Support\RegistrationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class RegistrationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Registration::query()
            ->with(['user', 'identity', 'period'])
            ->latest('id');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($periodId = $request->query('period_id')) {
            $query->where('period_id', $periodId);
        }

        if ($gender = $request->query('gender')) {
            $query->whereHas('identity', fn ($q) => $q->where('gender', $gender));
        }

        if ($dusun = $request->query('dusun')) {
            $query->whereHas('identity', fn ($q) => $q->where('dusun_name', 'like', '%'.$dusun.'%'));
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('registration_number', 'like', "%{$search}%")
                    ->orWhereHas('identity', function ($qi) use ($search) {
                        $qi->where('full_name', 'like', "%{$search}%")
                            ->orWhere('nik', 'like', "%{$search}%");
                    });
            });
        }

        $registrations = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Registrations/Index', [
            'registrations' => $registrations,
            'filters' => $request->only(['status', 'period_id', 'gender', 'dusun', 'q']),
            'periods' => RegistrationPeriod::orderByDesc('id')->get(),
        ]);
    }

    public function show(Registration $registration): Response
    {
        $registration->load(['user', 'identity', 'periodic', 'parents', 'period']);

        return Inertia::render('Admin/Registrations/Show', [
            'registration' => $registration,
            'options' => RegistrationOptions::all(),
            'school' => [
                'name' => config('spmb.school.name'),
                'district' => config('spmb.school.district'),
            ],
        ]);
    }

    public function verify(Request $request, Registration $registration): RedirectResponse
    {
        return $this->changeStatus($request, $registration, Registration::STATUS_VERIFIED);
    }

    public function accept(Request $request, Registration $registration): RedirectResponse
    {
        return $this->changeStatus($request, $registration, Registration::STATUS_ACCEPTED);
    }

    public function reject(Request $request, Registration $registration): RedirectResponse
    {
        $request->validate(['note' => ['required', 'string', 'max:1000']]);

        return $this->changeStatus($request, $registration, Registration::STATUS_REJECTED);
    }

    public function requestRevision(Request $request, Registration $registration): RedirectResponse
    {
        $request->validate(['note' => ['required', 'string', 'max:1000']]);

        return $this->changeStatus($request, $registration, Registration::STATUS_NEED_REVISION);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $request->only(['status', 'period_id', 'gender', 'dusun', 'q']);
        $filename = 'pendaftaran-'.now()->format('Ymd-His').'.xlsx';

        return Excel::download(new RegistrationsExport($filters), $filename);
    }

    protected function changeStatus(Request $request, Registration $registration, string $status): RedirectResponse
    {
        $note = $request->input('note');

        $registration->forceFill([
            'status' => $status,
            'verified_at' => $status === Registration::STATUS_VERIFIED ? now() : $registration->verified_at,
            'admin_note' => $note,
        ])->save();

        SendStatusUpdateNotification::dispatch($registration->id, $status, $note);

        return back()->with('status', 'Status pendaftaran diperbarui.');
    }
}
