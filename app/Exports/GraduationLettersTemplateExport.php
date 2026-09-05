<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class GraduationLettersTemplateExport implements FromArray, ShouldAutoSize, WithHeadings
{
    public function array(): array
    {
        return [[
            'NIS001',
            '400.3.11.1/SDN001-KEP/037',
            'Kpts.400.3.11.1/SDN001-KEP/036',
            '2026-06-15',
            '2025/2026',
            'LULUS',
            'Pekanbaru',
            '2026-06-15',
            '85.50',
            '88.00',
            '90.25',
            '80.00',
            '82.50',
            '85.00',
            '92.00',
            '88.00',
            'Budaya Melayu Riau',
            '',
            '',
        ]];
    }

    public function headings(): array
    {
        return [
            'NIS',
            'Nomor Surat SKL',
            'Nomor SK Kelulusan',
            'Tanggal SK Kelulusan',
            'Tahun Pelajaran',
            'Status Kelulusan',
            'Tempat Terbit',
            'Tanggal Terbit',
            'Nilai Agama',
            'Nilai Pancasila',
            'Nilai B Indo',
            'Nilai Matematika',
            'Nilai IPAS',
            'Nilai B Inggris',
            'Nilai Seni Budaya',
            'Nilai PJOK',
            'Nilai Mulok Bahasa Daerah',
            'Nilai Mulok Prakarya',
            'Nilai Mulok Potensi Khusus',
        ];
    }
}
