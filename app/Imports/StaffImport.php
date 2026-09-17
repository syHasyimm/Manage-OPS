<?php

namespace App\Imports;

use App\Imports\Concerns\NormalizesImportData;
use App\Models\Staff;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Row;

class StaffImport implements ToCollection, WithHeadingRow
{
    use NormalizesImportData;

    public const HEADINGS = [
        'nama',
        'nip',
        'nuptk',
        'nik',
        'tempat_lahir',
        'tanggal_lahir',
        'jabatan',
        'pangkat',
        'golongan',
        'jenis',
    ];

    protected array $records = [];

    protected array $invalidRows = [];

    protected array $duplicateRows = [];

    public function collection(Collection $rows): void
    {
        if ($rows->isEmpty()) {
            $this->invalidRows[] = [
                'row' => 2,
                'errors' => ['File tidak memiliki data guru/tendik.'],
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
                    'nip' => ['nullable', 'string', 'max:30'],
                    'nuptk' => ['nullable', 'string', 'max:20'],
                    'nik' => ['required', 'digits:16'],
                    'birth_place' => ['required', 'string', 'max:100'],
                    'birth_date' => ['required', 'date'],
                    'jabatan' => ['required', 'string', 'max:100'],
                    'pangkat' => ['nullable', 'string', 'max:100'],
                    'golongan' => ['nullable', 'string', 'max:20'],
                    'jenis' => ['required', Rule::in(['guru', 'tendik'])],
                ],
                [
                    'name.required' => 'Nama wajib diisi.',
                    'nik.required' => 'NIK wajib diisi.',
                    'nik.digits' => 'NIK harus 16 digit.',
                    'birth_place.required' => 'Tempat lahir wajib diisi.',
                    'birth_date.required' => 'Tanggal lahir wajib diisi.',
                    'birth_date.date' => 'Tanggal lahir tidak valid.',
                    'jabatan.required' => 'Jabatan wajib diisi.',
                    'jenis.required' => 'Jenis wajib diisi.',
                    'jenis.in' => 'Jenis harus berupa guru atau tendik.',
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
                'errors' => ['File tidak memiliki data guru/tendik.'],
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
            'nik' => array_values(array_unique(array_column(array_column($validRows, 'data'), 'nik'))),
        ];

        $existing = Staff::query()
            ->whereIn('nik', $values['nik'])
            ->get(['nik']);

        $existingValues = [
            'nik' => [],
        ];

        foreach ($existing as $staff) {
            if ($staff->nik) {
                $existingValues['nik'][$staff->nik] = true;
            }
        }

        $seen = [
            'nik' => [],
        ];

        foreach ($validRows as $validRow) {
            $data = $validRow['data'];
            $reasons = [];

            if (isset($existingValues['nik'][$data['nik']])) {
                $reasons[] = 'NIK sudah terdaftar';
            } elseif (isset($seen['nik'][$data['nik']])) {
                $reasons[] = 'NIK duplikat pada baris '.$seen['nik'][$data['nik']];
            }

            if ($reasons) {
                $this->duplicateRows[] = [
                    'row' => $validRow['row'],
                    'reason' => implode('; ', $reasons).'.',
                ];

                continue;
            }

            $seen['nik'][$data['nik']] = $validRow['row'];
            $this->records[] = $data;
        }
    }

    protected function normalizeRow(array $row): array
    {
        return [
            'name' => $this->stringValue($row['nama'] ?? null),
            'nip' => $this->stringValue($row['nip'] ?? null),
            'nuptk' => $this->stringValue($row['nuptk'] ?? null),
            'nik' => $this->stringValue($row['nik'] ?? null),
            'birth_place' => $this->stringValue($row['tempat_lahir'] ?? null),
            'birth_date' => $this->normalizeDate($row['tanggal_lahir'] ?? null),
            'jabatan' => $this->stringValue($row['jabatan'] ?? null),
            'pangkat' => $this->stringValue($row['pangkat'] ?? null),
            'golongan' => $this->stringValue($row['golongan'] ?? null),
            'jenis' => strtolower($this->stringValue($row['jenis'] ?? null)),
        ];
    }
}
