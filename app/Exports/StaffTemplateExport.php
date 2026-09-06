<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class StaffTemplateExport implements FromArray, ShouldAutoSize, WithHeadings
{
    public function array(): array
    {
        return [[
            'Nama Guru/Tendik',
            '198001012010011001',
            '1234567890123456',
            '1234567890123456',
            'Jakarta',
            '1980-01-01',
            'Guru Kelas',
            'Penata Muda Tk.I',
            'III/b',
            'guru',
        ]];
    }

    public function headings(): array
    {
        return [
            'Nama',
            'NIP',
            'NUPTK',
            'NIK',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Jabatan',
            'Pangkat',
            'Golongan',
            'Jenis',
        ];
    }
}
