<?php

namespace App\Http\Controllers\Admin;

use App\Exports\StudentsExport;
use App\Exports\StudentsTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\StudentsImport;
use App\Models\Student;
use App\Support\RegistrationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class StudentController extends Controller
{
    public const IMPORT_RESULT_KEY = 'admin.students.import.result';

    public function export(Request $request)
    {
        return Excel::download(
            new StudentsExport($request->only(['q', 'tingkat', 'columns'])),
            'buku-induk-siswa.xlsx'
        );
    }

    public function index(Request $request): Response
    {
        $query = Student::query()->latest('id');

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if ($tingkat = $request->query('tingkat')) {
            $query->where('kelas', 'like', ((int) $tingkat).'%');
        }

        $students = $query->paginate(20)->withQueryString();
        $students->getCollection()->transform(fn (Student $student) => $this->studentResource($student));

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'filters' => $request->only(['q', 'tingkat']),
            'grades' => range(1, 6),
            'religions' => RegistrationOptions::all()['religions'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Students/Create', $this->formProps());
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->studentRules());
        $data = $this->prepareStudentData($data);

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->storePhoto($request, $data['nis']);
        }

        unset($data['photo'], $data['remove_photo']);

        Student::create($data);

        return redirect()
            ->route('admin.students.index')
            ->with('status', 'Data siswa berhasil ditambahkan.');
    }

    public function edit(Student $student): Response
    {
        return Inertia::render('Admin/Students/Edit', [
            ...$this->formProps(),
            'student' => $this->studentResource($student, true),
        ]);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate($this->studentRules($student));
        $data = $this->prepareStudentData($data);

        if ($request->hasFile('photo')) {
            $newPhotoPath = $this->storePhoto($request, $data['nis']);
            $this->deletePhoto($student);
            $data['photo_path'] = $newPhotoPath;
        } elseif (! empty($data['remove_photo'])) {
            $this->deletePhoto($student);
            $data['photo_path'] = null;
        }

        unset($data['photo'], $data['remove_photo']);

        $student->update($data);

        return redirect()
            ->route('admin.students.index')
            ->with('status', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $this->deletePhoto($student);
        $student->delete();

        return back()->with('status', 'Data siswa berhasil dihapus.');
    }

    public function importForm(Request $request): Response
    {
        return Inertia::render('Admin/Students/Import', [
            'result' => $request->session()->pull(self::IMPORT_RESULT_KEY),
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
        ]);

        $import = new StudentsImport;

        try {
            Excel::import($import, $request->file('file'));
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors([
                'file' => 'File Excel tidak dapat dibaca. Pastikan formatnya sesuai template.',
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
                ->route('admin.students.import.create')
                ->with(self::IMPORT_RESULT_KEY, $result);
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

            DB::transaction(fn () => Student::query()->insert($records));
        }

        $result['status'] = 'success';
        $result['imported'] = count($records);
        $result['message'] = $result['imported'] > 0
            ? "Import selesai. {$result['imported']} data siswa berhasil disimpan."
            : 'Import selesai, tetapi tidak ada data siswa baru yang disimpan.';

        return redirect()
            ->route('admin.students.import.create')
            ->with(self::IMPORT_RESULT_KEY, $result);
    }

    public function template()
    {
        return Excel::download(new StudentsTemplateExport, 'template-data-siswa.xlsx');
    }

    protected function formProps(): array
    {
        return [
            'religions' => RegistrationOptions::all()['religions'],
            'genders' => RegistrationOptions::all()['genders'],
            'grades' => range(1, 6),
        ];
    }

    protected function studentRules(?Student $student = null): array
    {
        $nis = Rule::unique('students', 'nis');
        $nisn = Rule::unique('students', 'nisn');
        $nik = Rule::unique('students', 'nik');

        if ($student) {
            $nis->ignore($student->id);
            $nisn->ignore($student->id);
            $nik->ignore($student->id);
        }

        return [
            'name' => ['required', 'string', 'max:150'],
            'nis' => ['required', 'string', 'max:30', $nis],
            'nisn' => ['required', 'digits:10', $nisn],
            'nik' => ['required', 'digits:16', $nik],
            'gender' => ['required', Rule::in(array_keys(RegistrationOptions::GENDERS))],
            'birth_place' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date'],
            'religion' => ['required', Rule::in(array_keys(RegistrationOptions::RELIGIONS))],
            'address' => ['required', 'string', 'max:1000'],
            'parent_phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+()\s-]+$/'],
            'parent_name' => ['required', 'string', 'max:100'],
            'previous_school' => ['nullable', 'string', 'max:200'],
            'tingkat' => ['required', 'integer', 'between:1,6'],
            'rombel' => ['nullable', 'string', 'max:1', 'regex:/^[A-Za-z]$/'],
            'photo' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:1024'],
            'remove_photo' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareStudentData(array $data): array
    {
        $data['parent_name'] = trim($data['parent_name']);
        $data['parent_phone'] = trim($data['parent_phone']);
        $data['kelas'] = (string) $data['tingkat'].strtoupper(trim((string) ($data['rombel'] ?? '')));
        unset($data['tingkat'], $data['rombel']);

        return $data;
    }

    protected function storePhoto(Request $request, string $nis): string
    {
        $photo = $request->file('photo');
        $extension = $photo->extension() ?: 'jpg';
        $filename = Str::slug($nis).'-'.Str::uuid().'.'.$extension;

        return $photo->storeAs('students', $filename, 'public');
    }

    protected function deletePhoto(Student $student): void
    {
        if ($student->photo_path && Storage::disk('public')->exists($student->photo_path)) {
            Storage::disk('public')->delete($student->photo_path);
        }
    }

    protected function studentResource(Student $student, bool $withFormValues = false): array
    {
        $resource = [
            'id' => $student->id,
            'name' => $student->name,
            'nis' => $student->nis,
            'nisn' => $student->nisn,
            'nik' => $student->nik,
            'gender' => $student->gender,
            'birth_place' => $student->birth_place,
            'birth_date' => $student->birth_date?->format('Y-m-d'),
            'religion' => $student->religion,
            'address' => $student->address,
            'parent_phone' => $student->parent_phone,
            'parent_name' => $student->parent_name,
            'previous_school' => $student->previous_school,
            'kelas' => $student->kelas,
            'photo_path' => $student->photo_path,
            'photo_url' => $student->photoUrl(),
        ];

        if ($withFormValues) {
            $resource['tingkat'] = substr($student->kelas, 0, 1);
            $resource['rombel'] = substr($student->kelas, 1);
        }

        return $resource;
    }
}
