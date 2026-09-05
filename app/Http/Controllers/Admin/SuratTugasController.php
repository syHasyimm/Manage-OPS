<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SuratTugasController extends Controller
{
    public const SESSION_KEY = 'admin.surat_tugas.payload';

    public function create(): Response
    {
        $setting = SchoolSetting::current();

        return Inertia::render('Admin/SuratTugas/Create', [
            'principal' => [
                'name' => $setting->principal_name,
                'nip' => $setting->principal_nip,
                'title' => $setting->principal_title ?: 'Kepala Sekolah',
                'unit_kerja' => $setting->name,
            ],
            'defaults' => [
                'letter_place' => $setting->signature_city ?: $setting->district ?: '',
                'letter_date' => now()->toDateString(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nomor_surat' => ['required', 'string', 'max:150'],
            'assignees' => ['required', 'array', 'min:1', 'max:50'],
            'assignees.*.name' => ['required', 'string', 'max:150'],
            'assignees.*.position' => ['required', 'string', 'max:150'],
            'assignees.*.unit_kerja' => ['required', 'string', 'max:150'],
            'activity_name' => ['required', 'string', 'max:255'],
            'activity_date' => ['required', 'date'],
            'activity_place' => ['required', 'string', 'max:255'],
            'letter_place' => ['required', 'string', 'max:100'],
            'letter_date' => ['required', 'date'],
        ]);

        $data['nomor_surat'] = trim($data['nomor_surat']);
        $data['activity_name'] = trim($data['activity_name']);
        $data['activity_place'] = trim($data['activity_place']);
        $data['letter_place'] = trim($data['letter_place']);
        $data['assignees'] = array_map(
            fn (array $assignee) => [
                'name' => trim($assignee['name']),
                'position' => trim($assignee['position']),
                'unit_kerja' => trim($assignee['unit_kerja']),
            ],
            array_values($data['assignees']),
        );

        // Keep the validated payload only until the browser requests the PDF.
        $request->session()->put(self::SESSION_KEY, $data);

        return back()->with('status', 'Surat sedang disiapkan untuk diunduh.');
    }

    public function download(Request $request)
    {
        $data = $request->session()->pull(self::SESSION_KEY);

        if (! is_array($data)) {
            return redirect()
                ->route('admin.surat-tugas.create')
                ->with('error', 'Data surat tidak ditemukan. Silakan isi formulir kembali.');
        }

        $school = SchoolSetting::current()->toPdfArray();
        $activityDate = Carbon::parse($data['activity_date'])->locale('id');
        $letterDate = Carbon::parse($data['letter_date'])->locale('id');

        $pdf = Pdf::loadView('pdf.surat-tugas', [
            'school' => $school,
            'nomor_surat' => $data['nomor_surat'],
            'principal' => [
                'name' => $school['principal_name'] ?: '-',
                'nip' => $school['principal_nip'] ?: '-',
                'title' => $school['principal_title'] ?: 'Kepala Sekolah',
                'unit_kerja' => $school['name'] ?: '-',
            ],
            'assignees' => $data['assignees'],
            'activity_name' => $data['activity_name'],
            'activity_date' => $activityDate->translatedFormat('l, d F Y'),
            'activity_place' => $data['activity_place'],
            'letter_place' => $data['letter_place'],
            'letter_date' => $letterDate->translatedFormat('d F Y'),
        ])
            ->setPaper('legal', 'portrait')
            ->setOption(['isPhpEnabled' => true, 'isRemoteEnabled' => true]);

        $slug = Str::slug($data['nomor_surat']) ?: now()->format('Ymd-His');

        return $pdf->download("surat-tugas-{$slug}.pdf");
    }
}
