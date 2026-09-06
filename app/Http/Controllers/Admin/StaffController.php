<?php

namespace App\Http\Controllers\Admin;

use App\Exports\StaffExport;
use App\Exports\StaffTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\StaffImport;
use App\Models\Staff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class StaffController extends Controller
{
    public const IMPORT_RESULT_KEY = 'admin.staff.import.result';

    public function export(Request $request)
    {
        return Excel::download(
            new StaffExport($request->only(['q', 'jenis', 'columns'])),
            'data-guru-tendik.xlsx'
        );
    }

    public function index(Request $request): Response
    {
        $query = Staff::query()->latest('id');

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if ($jenis = $request->query('jenis')) {
            $query->where('jenis', $jenis);
        }

        $staff = $query->paginate(20)->withQueryString();
        $staff->getCollection()->transform(fn (Staff $item) => $this->staffResource($item));

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'filters' => $request->only(['q', 'jenis']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Staff/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->staffRules());

        Staff::create($data);

        return redirect()
            ->route('admin.staff.index')
            ->with('status', 'Data guru/tendik berhasil ditambahkan.');
    }

    public function edit(Staff $staff): Response
    {
        return Inertia::render('Admin/Staff/Edit', [
            'staff' => $this->staffResource($staff),
        ]);
    }

    public function update(Request $request, Staff $staff): RedirectResponse
    {
        $data = $request->validate($this->staffRules($staff));

        $staff->update($data);

        return redirect()
            ->route('admin.staff.index')
            ->with('status', 'Data guru/tendik berhasil diperbarui.');
    }

    public function destroy(Staff $staff): RedirectResponse
    {
        $staff->delete();

        return back()->with('status', 'Data guru/tendik berhasil dihapus.');
    }

    public function importForm(Request $request): Response
    {
        return Inertia::render('Admin/Staff/Import', [
            'result' => $request->session()->pull(self::IMPORT_RESULT_KEY),
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
        ]);

        $import = new StaffImport;

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
                ->route('admin.staff.import.create')
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

            DB::transaction(fn () => Staff::query()->insert($records));
        }

        $result['status'] = 'success';
        $result['imported'] = count($records);
        $result['message'] = $result['imported'] > 0
            ? "Import selesai. {$result['imported']} data guru/tendik berhasil disimpan."
            : 'Import selesai, tetapi tidak ada data baru yang disimpan.';

        return redirect()
            ->route('admin.staff.import.create')
            ->with(self::IMPORT_RESULT_KEY, $result);
    }

    public function template()
    {
        return Excel::download(new StaffTemplateExport, 'template-data-guru-tendik.xlsx');
    }

    protected function staffRules(?Staff $staff = null): array
    {
        $nik = Rule::unique('staff', 'nik');

        if ($staff) {
            $nik->ignore($staff->id);
        }

        return [
            'name' => ['required', 'string', 'max:150'],
            'nip' => ['nullable', 'string', 'max:30'],
            'nuptk' => ['nullable', 'string', 'max:20'],
            'nik' => ['required', 'digits:16', $nik],
            'birth_place' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date'],
            'jabatan' => ['required', 'string', 'max:100'],
            'pangkat' => ['nullable', 'string', 'max:100'],
            'golongan' => ['nullable', 'string', 'max:20'],
            'jenis' => ['required', Rule::in(['guru', 'tendik'])],
        ];
    }

    protected function staffResource(Staff $staff): array
    {
        return [
            'id' => $staff->id,
            'name' => $staff->name,
            'nip' => $staff->nip,
            'nuptk' => $staff->nuptk,
            'nik' => $staff->nik,
            'birth_place' => $staff->birth_place,
            'birth_date' => $staff->birth_date?->format('Y-m-d'),
            'jabatan' => $staff->jabatan,
            'pangkat' => $staff->pangkat,
            'golongan' => $staff->golongan,
            'jenis' => $staff->jenis,
        ];
    }
}
