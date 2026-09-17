<?php

namespace App\Imports;

use App\Imports\Concerns\NormalizesImportData;
use App\Models\Student;
use App\Support\RegistrationOptions;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Row;

class StudentsImport implements ToCollection, WithHeadingRow
{
    use NormalizesImportData;

    public const HEADINGS = [
        'nama',
        'nis',
        'nisn',
        'nik',
        'tempat_lahir',
        'tanggal_lahir',
        'agama',
        'alamat',
        'no_ortu',
        'nama_ortu',
        'kelas',
    ];

    protected array $records = [];

    protected array $invalidRows = [];

    protected array $duplicateRows = [];

    public function collection(Collection $rows): void
    {
        if ($rows->isEmpty()) {
            $this->invalidRows[] = [
                'row' => 2,
                'errors' => ['File tidak memiliki data siswa.'],
            ];

            return;
        }

        $firstRow = $this->rowToArray($rows->first());
        $missingHeadings = array_values(array_diff(self::HEADINGS, array_keys($firstRow)));

        if ($missingHeadings) {
            $this->invalidRows[] = [
                'row' => 1,
                'errors' => ['Kolom wajib tidak ditemukan: '.implode(', ', $missingHeadings).'.'],
            ];

            return;
        }

        $validRows = [];

        foreach ($rows as $index => $row) {
            $raw = $this->rowToArray($row);

            if ($this->isBlank($raw)) {
                continue;
            }

            $rowNumber = $row instanceof Row ? $row->getIndex() : $index + 2;
            $normalized = $this->normalizeRow($raw);
            $validator = Validator::make(
                $normalized,
                [
                    'name' => ['required', 'string', 'max:150'],
                    'nis' => ['required', 'string', 'max:30'],
                    'nisn' => ['required', 'digits:10'],
                    'nik' => ['required', 'digits:16'],
                    'birth_place' => ['required', 'string', 'max:100'],
                    'birth_date' => ['required', 'date'],
                    'religion' => ['required', Rule::in(array_keys(RegistrationOptions::RELIGIONS))],
                    'address' => ['required', 'string', 'max:1000'],
                    'parent_phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+()\s-]+$/'],
                    'parent_name' => ['required', 'string', 'max:100'],
                    'kelas' => ['required', 'regex:/^[1-6][A-Za-z]?$/'],
                ],
                [
                    'name.required' => 'Nama wajib diisi.',
                    'nis.required' => 'NIS wajib diisi.',
                    'nisn.required' => 'NISN wajib diisi.',
                    'nisn.digits' => 'NISN harus 10 digit.',
                    'nik.required' => 'NIK wajib diisi.',
                    'nik.digits' => 'NIK harus 16 digit.',
                    'birth_place.required' => 'Tempat lahir wajib diisi.',
                    'birth_date.required' => 'Tanggal lahir wajib diisi.',
                    'birth_date.date' => 'Tanggal lahir tidak valid.',
                    'religion.required' => 'Agama wajib diisi.',
                    'religion.in' => 'Agama tidak sesuai daftar.',
                    'address.required' => 'Alamat wajib diisi.',
                    'parent_phone.required' => 'No HP ortu wajib diisi.',
                    'parent_phone.regex' => 'No HP ortu tidak valid.',
                    'parent_name.required' => 'Nama ortu wajib diisi.',
                    'kelas.required' => 'Kelas wajib diisi.',
                    'kelas.regex' => 'Kelas harus berupa tingkat 1-6 dengan rombel opsional, contoh 1A.',
                ],
            );

            if ($validator->fails()) {
                $this->invalidRows[] = [
                    'row' => $rowNumber,
                    'errors' => $validator->errors()->all(),
                ];

                continue;
            }

            $validRows[] = [
                'row' => $rowNumber,
                'data' => $normalized,
            ];
        }

        if ($this->invalidRows) {
            return;
        }

        if (! $validRows) {
            $this->invalidRows[] = [
                'row' => 2,
                'errors' => ['File tidak memiliki data siswa.'],
            ];

            return;
        }

        $this->separateDuplicates($validRows);
    }

    public function records(): array
    {
        return $this->records;
    }

    public function invalidRows(): array
    {
        return $this->invalidRows;
    }

    public function duplicateRows(): array
    {
        return $this->duplicateRows;
    }

    protected function separateDuplicates(array $validRows): void
    {
        $values = [
            'nis' => array_values(array_unique(array_column(array_column($validRows, 'data'), 'nis'))),
            'nisn' => array_values(array_unique(array_column(array_column($validRows, 'data'), 'nisn'))),
            'nik' => array_values(array_unique(array_column(array_column($validRows, 'data'), 'nik'))),
        ];

        $existing = Student::query()
            ->where(function ($query) use ($values) {
                $query->whereIn('nis', $values['nis'])
                    ->orWhereIn('nisn', $values['nisn'])
                    ->orWhereIn('nik', $values['nik']);
            })
            ->get(['nis', 'nisn', 'nik']);

        $existingValues = [
            'nis' => [],
            'nisn' => [],
            'nik' => [],
        ];

        foreach ($existing as $student) {
            foreach (array_keys($existingValues) as $field) {
                if ($student->{$field}) {
                    $existingValues[$field][$student->{$field}] = true;
                }
            }
        }

        $seen = [
            'nis' => [],
            'nisn' => [],
            'nik' => [],
        ];

        foreach ($validRows as $validRow) {
            $data = $validRow['data'];
            $reasons = [];

            foreach (array_keys($seen) as $field) {
                if (isset($existingValues[$field][$data[$field]])) {
                    $reasons[] = strtoupper($field).' sudah terdaftar';
                } elseif (isset($seen[$field][$data[$field]])) {
                    $reasons[] = strtoupper($field).' duplikat pada baris '.$seen[$field][$data[$field]];
                }
            }

            if ($reasons) {
                $this->duplicateRows[] = [
                    'row' => $validRow['row'],
                    'reason' => implode('; ', $reasons).'.',
                ];

                continue;
            }

            foreach (array_keys($seen) as $field) {
                $seen[$field][$data[$field]] = $validRow['row'];
            }

            $this->records[] = $data;
        }
    }

    protected function normalizeRow(array $row): array
    {
        return [
            'name' => $this->stringValue($row['nama'] ?? null),
            'nis' => $this->stringValue($row['nis'] ?? null),
            'nisn' => $this->stringValue($row['nisn'] ?? null),
            'nik' => $this->stringValue($row['nik'] ?? null),
            'birth_place' => $this->stringValue($row['tempat_lahir'] ?? null),
            'birth_date' => $this->normalizeDate($row['tanggal_lahir'] ?? null),
            'religion' => $this->normalizeReligion($this->stringValue($row['agama'] ?? null)),
            'address' => $this->stringValue($row['alamat'] ?? null),
            'parent_phone' => $this->stringValue($row['no_ortu'] ?? null),
            'parent_name' => $this->stringValue($row['nama_ortu'] ?? null),
            'kelas' => $this->normalizeClass($this->stringValue($row['kelas'] ?? null)),
        ];
    }
}
