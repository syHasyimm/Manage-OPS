<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolSetting;
use App\Models\Staff;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SppdController extends Controller
{
    public const SESSION_KEY = 'admin.sppd.payload';

    public function create(): Response
    {
        $setting = SchoolSetting::current();

        return Inertia::render('Admin/Sppd/Create', [
            'staff' => Staff::query()
                ->orderBy('name')
                ->get(['id', 'name', 'nip', 'jabatan', 'pangkat', 'golongan'])
                ->map(fn (Staff $staff) => [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'nip' => $staff->nip,
                    'position' => $staff->jabatan,
                    'rank' => $staff->pangkat,
                    'grade' => $staff->golongan,
                ]),
            'principal' => [
                'name' => $setting->principal_name,
                'nip' => $setting->principal_nip,
                'title' => $setting->principal_title ?: 'Kepala Sekolah',
                'rank' => $setting->principal_rank,
                'grade' => $setting->principal_grade,
            ],
            'defaults' => [
                'departure_place' => $setting->name,
                'agency' => $setting->name,
                'issue_place' => $setting->signature_city ?: $setting->district ?: '',
                'issue_date' => now()->toDateString(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'letter_number' => ['required', 'string', 'max:150'],
            'travelers' => ['required', 'array', 'min:1', 'max:2'],
            'travelers.*.staff_id' => ['required', 'integer', 'distinct', 'exists:staff,id'],
            'travelers.*.salary' => ['nullable', 'string', 'max:50'],
            'travelers.*.travel_level' => ['nullable', 'string', 'max:100'],
            'purpose' => ['required', 'string', 'max:1000'],
            'transportation' => ['required', 'string', 'max:100'],
            'departure_place' => ['required', 'string', 'max:255'],
            'destination' => ['required', 'string', 'max:255'],
            'departure_date' => ['required', 'date'],
            'return_date' => ['required', 'date', 'after_or_equal:departure_date'],
            'followers' => ['nullable', 'array', 'max:10'],
            'followers.*.name' => ['nullable', 'string', 'max:150'],
            'followers.*.age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'followers.*.relationship' => ['nullable', 'string', 'max:150'],
            'agency' => ['required', 'string', 'max:150'],
            'budget_account' => ['required', 'string', 'max:150'],
            'other_notes' => ['nullable', 'string', 'max:1000'],
            'issue_place' => ['required', 'string', 'max:100'],
            'issue_date' => ['required', 'date'],
        ]);

        $staff = Staff::query()
            ->whereKey(collect($data['travelers'])->pluck('staff_id'))
            ->get()
            ->keyBy('id');

        $data['travelers'] = collect($data['travelers'])
            ->map(function (array $traveler) use ($staff) {
                $employee = $staff->get((int) $traveler['staff_id']);

                return [
                    'staff_id' => $employee->id,
                    'name' => $employee->name,
                    'nip' => $employee->nip,
                    'position' => $employee->jabatan,
                    'rank' => $employee->pangkat,
                    'grade' => $employee->golongan,
                    'salary' => $this->clean($traveler['salary'] ?? null),
                    'travel_level' => $this->clean($traveler['travel_level'] ?? null),
                ];
            })
            ->values()
            ->all();

        $data['followers'] = collect($data['followers'] ?? [])
            ->map(fn (array $follower) => [
                'name' => $this->clean($follower['name'] ?? null),
                'age' => $follower['age'] ?? null,
                'relationship' => $this->clean($follower['relationship'] ?? null),
            ])
            ->filter(fn (array $follower) => $follower['name'] || $follower['relationship'])
            ->values()
            ->all();

        foreach (['letter_number', 'purpose', 'transportation', 'departure_place', 'destination', 'agency', 'budget_account', 'other_notes', 'issue_place'] as $field) {
            $data[$field] = $this->clean($data[$field] ?? null);
        }

        $request->session()->put(self::SESSION_KEY, $data);

        return back()->with('status', 'SPPD sedang disiapkan untuk diunduh.');
    }

    public function download(Request $request)
    {
        $data = $request->session()->pull(self::SESSION_KEY);

        if (! is_array($data)) {
            return redirect()
                ->route('admin.sppd.create')
                ->with('error', 'Data SPPD tidak ditemukan. Silakan isi formulir kembali.');
        }

        $school = SchoolSetting::current()->toPdfArray();
        $departureDate = Carbon::parse($data['departure_date'])->locale('id');
        $returnDate = Carbon::parse($data['return_date'])->locale('id');
        $issueDate = Carbon::parse($data['issue_date'])->locale('id');

        $pdf = Pdf::loadView('pdf.sppd', [
            ...$data,
            'school' => $school,
            'principal' => [
                'name' => $school['principal_name'] ?: '-',
                'nip' => $school['principal_nip'] ?: '-',
                'title' => $school['principal_title'] ?: 'Kepala Sekolah',
                'rank' => $school['principal_rank'] ?: null,
                'grade' => $school['principal_grade'] ?: null,
            ],
            'duration' => ((int) $departureDate->diffInDays($returnDate)) + 1,
            'departure_date_formatted' => $departureDate->translatedFormat('d F Y'),
            'return_date_formatted' => $returnDate->translatedFormat('d F Y'),
            'issue_date_formatted' => $issueDate->translatedFormat('d F Y'),
        ])
            ->setPaper('legal', 'portrait')
            ->setOption(['isPhpEnabled' => true, 'isRemoteEnabled' => true]);

        $slug = Str::slug($data['letter_number']) ?: now()->format('Ymd-His');

        return $pdf->download("sppd-{$slug}.pdf");
    }

    private function clean(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
