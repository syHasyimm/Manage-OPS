<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GraduationLetter extends Model
{
    protected $fillable = [
        'student_id',
        'letter_number',
        'decree_number',
        'decree_date',
        'regulation_number',
        'regulation_year',
        'academic_year',
        'graduation_status',
        'grades',
        'average_score',
        'issued_city',
        'issued_date',
        'principal_name_snapshot',
        'principal_nip_snapshot',
        'document_status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'grades' => 'array',
            'decree_date' => 'date',
            'issued_date' => 'date',
            'average_score' => 'decimal:2',
            'regulation_year' => 'integer',
        ];
    }

    /**
     * Daftar mapel default Kurikulum Merdeka SD.
     */
    public static function defaultGrades(): array
    {
        return [
            ['kelompok' => 'A', 'urutan' => 1, 'mapel' => 'Pendidikan Agama dan Budi Pekerti', 'nilai' => null],
            ['kelompok' => 'A', 'urutan' => 2, 'mapel' => 'Pendidikan Pancasila', 'nilai' => null],
            ['kelompok' => 'A', 'urutan' => 3, 'mapel' => 'Bahasa Indonesia', 'nilai' => null],
            ['kelompok' => 'A', 'urutan' => 4, 'mapel' => 'Matematika', 'nilai' => null],
            ['kelompok' => 'A', 'urutan' => 5, 'mapel' => 'Ilmu Pengetahuan Alam dan Sosial', 'nilai' => null],
            ['kelompok' => 'A', 'urutan' => 6, 'mapel' => 'Bahasa Inggris', 'nilai' => null],
            ['kelompok' => 'B', 'urutan' => 1, 'mapel' => 'Seni Budaya', 'nilai' => null],
            ['kelompok' => 'B', 'urutan' => 2, 'mapel' => 'Pendidikan Jasmani, Olahraga dan Kesehatan', 'nilai' => null],
            ['kelompok' => 'B', 'urutan' => 3, 'mapel' => '', 'jenis' => 'mulok', 'nilai' => null],
        ];
    }

    /**
     * Hitung rata-rata dari kolom grades JSON.
     */
    public function calculateAverage(): float
    {
        $grades = collect($this->grades ?? []);
        $filled = $grades->filter(fn (array $g) => is_numeric($g['nilai'] ?? null));

        if ($filled->isEmpty()) {
            return 0;
        }

        return round($filled->avg('nilai'), 2);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
