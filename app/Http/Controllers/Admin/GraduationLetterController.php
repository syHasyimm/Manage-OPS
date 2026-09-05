<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GraduationLetter;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Exports\GraduationLettersTemplateExport;
use App\Imports\GraduationLettersImport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class GraduationLetterController extends Controller
{
    public function index(Request $request): Response
    {
        $query = GraduationLetter::with(['student:id,name,nis,nisn,kelas'])
            ->latest('id');

        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%");
            })->orWhere('letter_number', 'like', "%{$search}%");
        }

        $letters = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/GraduationLetters/Index', [
            'letters' => $letters,
            'filters' => ['search' => $search ?? ''],
        ]);
    }

    public function create(): Response
    {
        $setting = SchoolSetting::current();
        $year = date('n') >= 7 ? date('Y') . '/' . (date('Y') + 1) : (date('Y') - 1) . '/' . date('Y');

        $students = Student::select('id', 'name', 'nis', 'nisn', 'kelas', 'gender', 'religion', 'birth_place', 'birth_date', 'parent_name', 'previous_school')
            ->where('kelas', 'like', '6%')
            ->orderBy('name')
            ->get()
            ->map(fn (Student $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'nis' => $s->nis,
                'nisn' => $s->nisn,
                'kelas' => $s->kelas,
                'gender' => $s->gender,
                'religion' => $s->religion,
                'birth_place' => $s->birth_place,
                'birth_date' => $s->birth_date?->toDateString(),
                'parent_name' => $s->parent_name,
                'previous_school' => $s->previous_school,
            ]);

        return Inertia::render('Admin/GraduationLetters/Create', [
            'students' => $students,
            'principal' => [
                'name' => $setting->principal_name,
                'nip' => $setting->principal_nip,
            ],
            'defaults' => [
                'issued_city' => $setting->signature_city ?: $setting->district ?: '',
                'issued_date' => now()->toDateString(),
                'regulation_number' => '22',
                'regulation_year' => 2024,
                'school_name' => $setting->name,
                'academic_year' => $year,
            ],
            'defaultGrades' => GraduationLetter::defaultGrades(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'student_id' => [
                'required',
                'exists:students,id',
                \Illuminate\Validation\Rule::unique('graduation_letters')->where(function ($query) use ($request) {
                    return $query->where('academic_year', $request->academic_year);
                })
            ],
            'letter_number' => ['required', 'string', 'max:100'],
            'decree_number' => ['required', 'string', 'max:100'],
            'decree_date' => ['required', 'date'],
            'regulation_number' => ['required', 'string', 'max:20'],
            'regulation_year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'academic_year' => ['required', 'string', 'max:20'],
            'graduation_status' => ['required', 'in:LULUS,TIDAK LULUS'],
            'grades' => ['required', 'array', 'min:1'],
            'grades.*.kelompok' => ['required', 'string', 'in:A,B'],
            'grades.*.urutan' => ['required', 'integer'],
            'grades.*.mapel' => ['required', 'string', 'max:150'],
            'grades.*.nilai' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'issued_city' => ['required', 'string', 'max:100'],
            'issued_date' => ['required', 'date'],
        ]);

        $setting = SchoolSetting::current();

        $letter = GraduationLetter::create([
            ...$data,
            'principal_name_snapshot' => $setting->principal_name ?: '-',
            'principal_nip_snapshot' => $setting->principal_nip,
            'document_status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        // Calculate & save average
        $letter->average_score = $letter->calculateAverage();
        $letter->save();

        return redirect()
            ->route('admin.graduation-letters.index')
            ->with('success', 'Surat Keterangan Kelulusan berhasil dibuat.');
    }

    public function download(GraduationLetter $graduationLetter)
    {
        $graduationLetter->load('student');

        $school = SchoolSetting::current()->toPdfArray();
        $student = $graduationLetter->student;

        $issuedDate = Carbon::parse($graduationLetter->issued_date)->locale('id');
        $decreeDate = Carbon::parse($graduationLetter->decree_date)->locale('id');
        $birthDate = $student->birth_date ? Carbon::parse($student->birth_date)->locale('id') : null;

        // Map gender code to human-readable label
        $genderMap = ['L' => 'Laki-Laki', 'P' => 'Perempuan'];
        $student->gender = $genderMap[$student->gender] ?? $student->gender;

        $pdf = Pdf::loadView('pdf.skl', [
            'school' => $school,
            'skl' => $graduationLetter,
            'student' => $student,
            'grades' => $graduationLetter->grades ?? [],
            'average_score' => $graduationLetter->average_score,
            'issued_date_formatted' => $issuedDate->translatedFormat('d F Y'),
            'decree_date_formatted' => $decreeDate->translatedFormat('d F Y'),
            'birth_date_formatted' => $birthDate?->translatedFormat('d F Y'),
        ])
            ->setPaper('a4', 'portrait')
            ->setOption(['isPhpEnabled' => true, 'isRemoteEnabled' => true]);

        $slug = Str::slug($graduationLetter->letter_number) ?: now()->format('Ymd-His');

        return $pdf->download("skl-{$slug}.pdf");
    }

    public function finalize(GraduationLetter $graduationLetter): RedirectResponse
    {
        $graduationLetter->update(['document_status' => 'final']);

        return back()->with('status', 'SKL berhasil difinalisasi. Nomor seri telah dikunci.');
    }

    public function template()
    {
        return Excel::download(new GraduationLettersTemplateExport, 'template-skl.xlsx');
    }

    public function importForm(Request $request): Response
    {
        return Inertia::render('Admin/GraduationLetters/Import', [
            'result' => $request->session()->pull('admin.graduation_letters.import_result'),
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
        ]);

        $import = new GraduationLettersImport();

        try {
            Excel::import($import, $request->file('file'));
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors([
                'file' => 'File Excel tidak dapat dibaca. Pastikan formatnya sesuai template. Pesan error: '.$e->getMessage(),
            ]);
        }

        $result = [
            'imported' => 0,
            'duplicate_rows' => $import->duplicateRows(),
            'invalid_rows' => $import->invalidRows(),
        ];

        if ($import->invalidRows()) {
            $result['status'] = 'failed';
            $result['message'] = 'Import dibatalkan karena terdapat baris yang tidak valid. Tidak ada data yang disimpan.';

            return redirect()
                ->route('admin.graduation-letters.import.create')
                ->with('admin.graduation_letters.import_result', $result);
        }

        $records = $import->records();

        if ($records) {
            $timestamp = now();
            $records = array_map(
                fn (array $record) => [
                    ...$record,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ],
                $records,
            );
            
            // Format grades back to json string for DB insert
            $records = array_map(function($record) {
                $record['grades'] = json_encode($record['grades']);
                return $record;
            }, $records);

            DB::transaction(fn () => GraduationLetter::query()->insert($records));
        }

        $result['status'] = 'success';
        $result['imported'] = count($records);
        $result['message'] = $result['imported'] > 0
            ? "Import selesai. {$result['imported']} data SKL berhasil disimpan."
            : 'Import selesai, tetapi tidak ada data SKL baru yang disimpan.';

        return redirect()
            ->route('admin.graduation-letters.import.create')
            ->with('admin.graduation_letters.import_result', $result);
    }

    public function destroy(GraduationLetter $graduationLetter): RedirectResponse
    {
        if ($graduationLetter->document_status === 'final') {
            return back()->with('error', 'SKL yang sudah final tidak bisa dihapus.');
        }

        $graduationLetter->delete();

        return back()->with('success', 'SKL berhasil dihapus.');
    }
}
