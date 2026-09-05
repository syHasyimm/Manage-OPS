<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class StudentsTemplateExport implements FromArray, ShouldAutoSize, WithHeadings
{
    public function array(): array
    {
        return [[
            'Nama Contoh',
            'NIS001',
            '0123456789',
            '1234567890123456',
            'Kepenuhan',
            '2018-01-01',
            'islam',
            'Alamat contoh',
            '081234567890',
            'Bapak/Ibu Contoh',
            '1A',
        ]];
    }

    public function headings(): array
    {
        return [
            'Nama',
            'NIS',
            'NISN',
            'NIK',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Alamat',
            'No Ortu',
            'Nama Ortu',
            'Kelas',
        ];
    }
}
