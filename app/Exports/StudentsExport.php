<?php

namespace App\Exports;

use App\Models\Student;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use App\Exports\Concerns\WithStandardExcelStyling;

class StudentsExport implements FromView, ShouldAutoSize, WithEvents
{
    use WithStandardExcelStyling;

    public function __construct(public array $filters = []) {}

    public function view(): View
    {
        $query = Student::query()->latest('id');

        if ($search = trim((string) ($this->filters['q'] ?? ''))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if ($tingkat = $this->filters['tingkat'] ?? null) {
            $query->where('kelas', 'like', ((int) $tingkat).'%');
        }

        $students = $query->get();
        $columns = $this->filters['columns'] ?? [];
        if (is_string($columns)) {
            $columns = explode(',', $columns);
        }

        return view('exports.students', [
            'students' => $students,
            'columns' => empty($columns) ? $this->defaultColumns() : $columns,
        ]);
    }

    }
}
