<?php

namespace App\Imports;

use App\Models\GraduationLetter;
use App\Models\RegistrationPeriod;
use App\Models\SchoolSetting;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Row;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class GraduationLettersImport implements ToCollection, WithHeadingRow
{
    public const HEADINGS = [
        'nis',
        'nomor_surat_skl',
        'nomor_sk_kelulusan',
        'tanggal_sk_kelulusan',
        'tahun_pelajaran',
        'status_kelulusan',
        'tempat_terbit',
        'tanggal_terbit',
        'nilai_agama',
        'nilai_pancasila',
        'nilai_b_indo',
        'nilai_matematika',
        'nilai_ipas',
        'nilai_b_inggris',
        'nilai_seni_budaya',
        'nilai_pjok',
        'nilai_mulok_bahasa_daerah',
        'nilai_mulok_prakarya',
        'nilai_mulok_potensi_khusus',
    ];

    protected array $records = [];

    protected array $invalidRows = [];

    protected array $duplicateRows = [];

    protected array $studentIdsMap = [];

    protected array $studentReligions = [];

    protected ?int $periodId;

    protected ?string $principalNameSnapshot;

    protected ?string $principalNipSnapshot;

    public function __construct(?int $periodId = null)
    {
        $this->periodId = $periodId ?? RegistrationPeriod::active()?->id;
        $setting = SchoolSetting::current();
        $this->principalNameSnapshot = $setting->principal_name ?: '-';
        $this->principalNipSnapshot = $setting->principal_nip;
    }

    public function collection(Collection $rows): void
    {
        if ($rows->isEmpty()) {
            $this->invalidRows[] = [
                'row' => 2,
                'errors' => ['File tidak memiliki data SKL.'],
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

        if (! $this->periodId) {
            $this->invalidRows[] = [
                'row' => 1,
                'errors' => ['Tidak ada periode pendaftaran aktif.'],
            ];

            return;
        }

        // Preload all students based on NIS in the sheet
        $nisList = [];
        foreach ($rows as $row) {
            $raw = $this->rowToArray($row);
            if (! empty($raw['nis'])) {
                $nisList[] = (string) $raw['nis'];
            }
        }

        $nisList = array_unique($nisList);
        $students = Student::whereIn('nis', $nisList)->get(['id', 'nis', 'religion']);
        foreach ($students as $student) {
            $this->studentIdsMap[$student->nis] = $student->id;
            $this->studentReligions[$student->nis] = $student->religion;
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
                    'nis' => ['required', 'string'],
                    'student_id' => ['required', 'integer'],
                    'letter_number' => ['required', 'string', 'max:100'],
                    'decree_number' => ['required', 'string', 'max:100'],
                    'decree_date' => ['required', 'date'],
                    'academic_year' => ['required', 'string', 'max:20'],
                    'graduation_status' => ['required', 'in:LULUS,TIDAK LULUS'],
                    'issued_city' => ['required', 'string', 'max:100'],
                    'issued_date' => ['required', 'date'],
                    'nilai_agama' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_pancasila' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_b_indo' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_matematika' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_ipas' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_b_inggris' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_seni_budaya' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_pjok' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_mulok_bahasa_daerah' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_mulok_prakarya' => ['nullable', 'numeric', 'min:0', 'max:100'],
                    'nilai_mulok_potensi_khusus' => ['nullable', 'numeric', 'min:0', 'max:100'],
                ],
                [
                    'student_id.required' => 'Siswa dengan NIS tersebut tidak ditemukan di database.',
                    'letter_number.required' => 'Nomor Surat SKL wajib diisi.',
                    'decree_number.required' => 'Nomor SK Kelulusan wajib diisi.',
                    'decree_date.required' => 'Tanggal SK Kelulusan wajib diisi.',
                    'decree_date.date' => 'Format Tanggal SK Kelulusan tidak valid.',
                    'academic_year.required' => 'Tahun Pelajaran wajib diisi.',
                    'graduation_status.required' => 'Status Kelulusan wajib diisi (LULUS/TIDAK LULUS).',
                    'issued_city.required' => 'Tempat Terbit wajib diisi.',
                    'issued_date.required' => 'Tanggal Terbit wajib diisi.',
                    'issued_date.date' => 'Format Tanggal Terbit tidak valid.',
                ]
            );

            // Custom validation for exactly 1 mulok
            $mulokCount = 0;
            if (isset($normalized['nilai_mulok_bahasa_daerah'])) {
                $mulokCount++;
            }
            if (isset($normalized['nilai_mulok_prakarya'])) {
                $mulokCount++;
            }
            if (isset($normalized['nilai_mulok_potensi_khusus'])) {
                $mulokCount++;
            }

            if ($mulokCount > 1) {
                $validator->errors()->add('mulok', 'Hanya boleh mengisi nilai untuk satu jenis Muatan Lokal.');
            }

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
                'errors' => ['File tidak memiliki data SKL.'],
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
        $studentIds = array_unique(array_column(array_column($validRows, 'data'), 'student_id'));

        $existing = GraduationLetter::query()
            ->where('period_id', $this->periodId)
            ->whereIn('student_id', $studentIds)
            ->pluck('student_id')
            ->toArray();

        $existingStudentIds = array_fill_keys($existing, true);
        $seen = [];

        foreach ($validRows as $validRow) {
            $data = $validRow['data'];
            $studentId = $data['student_id'];
            $reasons = [];

            if (isset($existingStudentIds[$studentId])) {
                $reasons[] = 'Siswa (NIS: '.$data['nis'].') sudah memiliki SKL di tahun ajaran ini';
            } elseif (isset($seen[$studentId])) {
                $reasons[] = 'Siswa (NIS: '.$data['nis'].') duplikat pada baris '.$seen[$studentId];
            }

            if ($reasons) {
                $this->duplicateRows[] = [
                    'row' => $validRow['row'],
                    'reason' => implode('; ', $reasons).'.',
                ];

                continue;
            }

            $seen[$studentId] = $validRow['row'];

            // Format to insert array
            $grades = $this->buildGradesJson($data);

            $letter = new GraduationLetter;
            $letter->student_id = $studentId;
            $letter->period_id = $this->periodId;
            $letter->letter_number = $data['letter_number'];
            $letter->decree_number = $data['decree_number'];
            $letter->decree_date = $data['decree_date'];
            $letter->regulation_number = '22';
            $letter->regulation_year = 2024;
            $letter->academic_year = $data['academic_year'];
            $letter->graduation_status = $data['graduation_status'];
            $letter->issued_city = $data['issued_city'];
            $letter->issued_date = $data['issued_date'];
            $letter->grades = $grades;
            $letter->average_score = $this->calculateAverage($grades);
            $letter->document_status = 'draft';
            $letter->principal_name_snapshot = $this->principalNameSnapshot;
            $letter->principal_nip_snapshot = $this->principalNipSnapshot;
            $letter->created_by = request()->user()?->id ?? 1;

            $this->records[] = $letter->toArray();
        }
    }

    protected function buildGradesJson(array $data): array
    {
        $religion = strtolower($data['student_religion'] ?? 'islam');
        $religionMapels = [
            'islam' => 'Pendidikan Agama Islam dan Budi Pekerti',
            'kristen' => 'Pendidikan Agama Kristen dan Budi Pekerti',
            'katholik' => 'Pendidikan Agama Katolik dan Budi Pekerti',
            'hindu' => 'Pendidikan Agama Hindu dan Budi Pekerti',
            'budha' => 'Pendidikan Agama Buddha dan Budi Pekerti',
            'khonghucu' => 'Pendidikan Agama Khonghucu dan Budi Pekerti',
            'kepercayaan' => 'Pendidikan Kepercayaan Terhadap Tuhan YME dan Budi Pekerti',
        ];

        $mapelAgama = $religionMapels[$religion] ?? $religionMapels['islam'];

        $grades = [
            ['kelompok' => 'A', 'urutan' => 1, 'mapel' => $mapelAgama, 'nilai' => $data['nilai_agama']],
            ['kelompok' => 'A', 'urutan' => 2, 'mapel' => 'Pendidikan Pancasila', 'nilai' => $data['nilai_pancasila']],
            ['kelompok' => 'A', 'urutan' => 3, 'mapel' => 'Bahasa Indonesia', 'nilai' => $data['nilai_b_indo']],
            ['kelompok' => 'A', 'urutan' => 4, 'mapel' => 'Matematika', 'nilai' => $data['nilai_matematika']],
            ['kelompok' => 'A', 'urutan' => 5, 'mapel' => 'Ilmu Pengetahuan Alam dan Sosial', 'nilai' => $data['nilai_ipas']],
            ['kelompok' => 'B', 'urutan' => 1, 'mapel' => 'Pendidikan Jasmani Olahraga dan Kesehatan', 'nilai' => $data['nilai_pjok']],
            ['kelompok' => 'B', 'urutan' => 2, 'mapel' => 'Seni dan Budaya', 'nilai' => $data['nilai_seni_budaya']],
        ];

        // Mulok
        if (isset($data['nilai_mulok_bahasa_daerah'])) {
            $grades[] = [
                'kelompok' => 'B',
                'urutan' => 3,
                'jenis' => 'mulok',
                'mapel' => 'Muatan Lokal Bahasa Daerah',
                'nilai' => (float) $data['nilai_mulok_bahasa_daerah'],
            ];
        } elseif (isset($data['nilai_mulok_prakarya'])) {
            $grades[] = [
                'kelompok' => 'B',
                'urutan' => 3,
                'jenis' => 'mulok',
                'mapel' => 'Muatan Lokal Prakarya dan Keterampilan',
                'nilai' => (float) $data['nilai_mulok_prakarya'],
            ];
        } elseif (isset($data['nilai_mulok_potensi_khusus'])) {
            $grades[] = [
                'kelompok' => 'B',
                'urutan' => 3,
                'jenis' => 'mulok',
                'mapel' => 'Muatan Lokal Potensi Khusus Wilayah',
                'nilai' => (float) $data['nilai_mulok_potensi_khusus'],
            ];
        }

        return $grades;
    }

    protected function calculateAverage(array $grades): string
    {
        $filled = array_filter($grades, fn ($g) => isset($g['nilai']) && $g['nilai'] !== null && $g['nilai'] !== '');
        if (count($filled) === 0) {
            return '0.00';
        }
        $sum = array_reduce($filled, fn ($acc, $g) => $acc + (float) $g['nilai'], 0);

        return number_format($sum / count($filled), 2, '.', '');
    }

    protected function normalizeRow(array $row): array
    {
        $nis = $this->stringValue($row['nis'] ?? null);
        $studentId = $this->studentIdsMap[$nis] ?? null;

        return [
            'nis' => $nis,
            'student_id' => $studentId,
            'student_religion' => $this->studentReligions[$nis] ?? null,
            'letter_number' => $this->stringValue($row['nomor_surat_skl'] ?? null),
            'decree_number' => $this->stringValue($row['nomor_sk_kelulusan'] ?? null),
            'decree_date' => $this->normalizeDate($row['tanggal_sk_kelulusan'] ?? null),
            'academic_year' => $this->stringValue($row['tahun_pelajaran'] ?? null),
            'graduation_status' => strtoupper($this->stringValue($row['status_kelulusan'] ?? 'LULUS')),
            'issued_city' => $this->stringValue($row['tempat_terbit'] ?? null),
            'issued_date' => $this->normalizeDate($row['tanggal_terbit'] ?? null),
            'nilai_agama' => $this->numericValue($row['nilai_agama'] ?? null),
            'nilai_pancasila' => $this->numericValue($row['nilai_pancasila'] ?? null),
            'nilai_b_indo' => $this->numericValue($row['nilai_b_indo'] ?? null),
            'nilai_matematika' => $this->numericValue($row['nilai_matematika'] ?? null),
            'nilai_ipas' => $this->numericValue($row['nilai_ipas'] ?? null),
            'nilai_b_inggris' => $this->numericValue($row['nilai_b_inggris'] ?? null),
            'nilai_seni_budaya' => $this->numericValue($row['nilai_seni_budaya'] ?? null),
            'nilai_pjok' => $this->numericValue($row['nilai_pjok'] ?? null),
            'nilai_mulok_bahasa_daerah' => $this->numericValue($row['nilai_mulok_bahasa_daerah'] ?? null),
            'nilai_mulok_prakarya' => $this->numericValue($row['nilai_mulok_prakarya'] ?? null),
            'nilai_mulok_potensi_khusus' => $this->numericValue($row['nilai_mulok_potensi_khusus'] ?? null),
        ];
    }

    protected function rowToArray(mixed $row): array
    {
        if (is_object($row) && method_exists($row, 'toArray')) {
            return $row->toArray();
        }

        return is_array($row) ? $row : [];
    }

    protected function isBlank(array $row): bool
    {
        foreach ($row as $value) {
            if ($value instanceof \DateTimeInterface || ($value !== null && trim((string) $value) !== '')) {
                return false;
            }
        }

        return true;
    }

    protected function stringValue(mixed $value): ?string
    {
        if ($value === null || is_array($value) || is_object($value)) {
            return null;
        }

        if (is_float($value) && floor($value) === $value) {
            return (string) (int) $value;
        }

        return trim((string) $value);
    }

    protected function numericValue(mixed $value): ?float
    {
        $val = $this->stringValue($value);
        if ($val === null || $val === '') {
            return null;
        }

        $val = str_replace(',', '.', $val);

        return is_numeric($val) ? (float) $val : null;
    }

    protected function normalizeDate(mixed $value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        $value = $this->stringValue($value);

        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value) && (float) $value >= 20000) {
            try {
                return ExcelDate::excelToDateTimeObject((float) $value)->format('Y-m-d');
            } catch (\Throwable) {
                return $value;
            }
        }

        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y', 'd.m.Y', 'Y/m/d'] as $format) {
            try {
                $date = Carbon::createFromFormat($format, $value);

                if ($date !== false) {
                    return $date->format('Y-m-d');
                }
            } catch (\Throwable) {
                // Try the next supported format.
            }
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable) {
            return $value;
        }
    }
}
