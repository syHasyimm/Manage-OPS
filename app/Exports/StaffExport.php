<?php

namespace App\Exports;

use App\Models\Staff;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class StaffExport implements FromView, ShouldAutoSize, WithEvents
{
    public function __construct(public array $filters = []) {}

    public function view(): View
    {
        $query = Staff::query()->latest('id');

        if ($search = trim((string) ($this->filters['q'] ?? ''))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if ($jenis = $this->filters['jenis'] ?? null) {
            $query->where('jenis', $jenis);
        }

        $staff = $query->get();
        $columns = $this->filters['columns'] ?? [];
        if (is_string($columns)) {
            $columns = explode(',', $columns);
        }

        return view('exports.staff', [
            'staff' => $staff,
            'columns' => empty($columns) ? $this->defaultColumns() : $columns,
        ]);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();

                $cellRange = 'A2:'.$highestColumn.$highestRow;

                // Center Title
                $sheet->getStyle('A1:'.$highestColumn.'1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 14,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // Header styles
                $sheet->getStyle('A2:'.$highestColumn.'2')->applyFromArray([
                    'font' => [
                        'bold' => true,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => 'D9E1F2', // Light blueish color for header
                        ],
                    ],
                ]);

                // Borders for all cells
                $sheet->getStyle($cellRange)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FF000000'],
                        ],
                    ],
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);
            },
        ];
    }

    protected function defaultColumns(): array
    {
        return [
            'name',
            'nip',
            'nuptk',
            'nik',
            'birth_info',
            'jabatan',
            'pangkat',
            'golongan',
            'jenis',
        ];
    }
}
