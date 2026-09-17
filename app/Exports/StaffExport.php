<?php

namespace App\Exports;

use App\Models\Staff;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use App\Exports\Concerns\WithStandardExcelStyling;

class StaffExport implements FromView, ShouldAutoSize, WithEvents
{
    use WithStandardExcelStyling;

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

    }
}
