<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicStatusController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('PublicStatus', [
            'prefill' => [
                'no' => $request->query('no', ''),
                'phone' => $request->query('phone', ''),
            ],
            'result' => session('result'),
        ]);
    }

    public function check(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^08[0-9]{8,12}$/'],
            'registration_number' => ['required', 'string', 'max:32'],
        ], [
            'phone.regex' => 'Format nomor HP tidak valid (contoh: 081234567890).',
        ]);

        $registration = Registration::with(['identity', 'period', 'user'])
            ->where('registration_number', $validated['registration_number'])
            ->first();

        $matches = $registration
            && (
                $registration->user->phone === $validated['phone']
                || $registration->identity?->phone_wa === $validated['phone']
            );

        if (! $matches) {
            return back()
                ->withInput()
                ->withErrors(['registration_number' => 'Data tidak ditemukan. Periksa nomor pendaftaran & nomor HP.']);
        }

        return back()
            ->withInput()
            ->with('result', [
                'registration_number' => $registration->registration_number,
                'student_name' => $registration->identity?->full_name,
                'status' => $registration->status,
                'submitted_at' => $registration->submitted_at,
                'verified_at' => $registration->verified_at,
                'admin_note' => $registration->admin_note,
                'period' => $registration->period?->academic_year,
                'pdf_url' => $registration->pdf_path
                    ? route('registration.public-pdf', ['registration_number' => $registration->registration_number])
                    : null,
            ]);
    }

    public function downloadPdf(Request $request, string $registrationNumber)
    {
        $registration = Registration::where('registration_number', $registrationNumber)->first();

        abort_if(! $registration || ! $registration->pdf_path, 404);
        abort_unless(\Storage::disk('public')->exists($registration->pdf_path), 404);

        return \Storage::disk('public')->download(
            $registration->pdf_path,
            $registration->registration_number.'.pdf',
        );
    }
}
