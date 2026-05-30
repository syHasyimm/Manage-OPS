<?php

namespace App\Exports;

use App\Models\Registration;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class RegistrationsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(public array $filters = []) {}

    public function query()
    {
        $q = Registration::query()->with(['user', 'identity', 'periodic', 'parents', 'period']);

        if ($status = $this->filters['status'] ?? null) {
            $q->where('status', $status);
        }
        if ($periodId = $this->filters['period_id'] ?? null) {
            $q->where('period_id', $periodId);
        }
        if ($gender = $this->filters['gender'] ?? null) {
            $q->whereHas('identity', fn ($qi) => $qi->where('gender', $gender));
        }
        if ($dusun = $this->filters['dusun'] ?? null) {
            $q->whereHas('identity', fn ($qi) => $qi->where('dusun_name', 'like', "%{$dusun}%"));
        }
        if ($search = $this->filters['q'] ?? null) {
            $q->where(function ($w) use ($search) {
                $w->where('registration_number', 'like', "%{$search}%")
                    ->orWhereHas('identity', fn ($qi) => $qi->where('full_name', 'like', "%{$search}%")
                        ->orWhere('nik', 'like', "%{$search}%"));
            });
        }

        return $q->latest('id');
    }

    public function headings(): array
    {
        return [
            'No Pendaftaran',
            'Periode',
            'Status',
            'Nama Lengkap',
            'JK',
            'NIK',
            'No KK',
            'Tempat Lahir',
            'Tgl Lahir',
            'Agama',
            'Alamat',
            'Dusun',
            'Kelurahan',
            'RT/RW',
            'Kode Pos',
            'No HP/WA',
            'Email',
            'Tinggi',
            'Berat',
            'Saudara',
            'Nama Ayah',
            'Pekerjaan Ayah',
            'Nama Ibu',
            'Pekerjaan Ibu',
            'Nama Wali',
            'Submitted At',
        ];
    }

    public function map($r): array
    {
        $i = $r->identity;
        $p = $r->periodic;
        $father = $r->parents->firstWhere('role', 'father');
        $mother = $r->parents->firstWhere('role', 'mother');
        $guardian = $r->parents->firstWhere('role', 'guardian');

        return [
            $r->registration_number,
            $r->period?->academic_year,
            strtoupper($r->status),
            $i?->full_name,
            $i?->gender === 'L' ? 'Laki-Laki' : 'Perempuan',
            $i?->nik,
            $i?->kk_number,
            $i?->birth_place,
            optional($i?->birth_date)->format('Y-m-d'),
            ucfirst((string) $i?->religion),
            $i?->address,
            $i?->dusun_name,
            $i?->kelurahan_name,
            $i?->rt.'/'.$i?->rw,
            $i?->postal_code,
            $i?->phone_wa,
            $r->contact_email,
            $p?->height_cm,
            $p?->weight_kg,
            $p?->siblings_count,
            $father?->name,
            $father?->occupation,
            $mother?->name,
            $mother?->occupation,
            $guardian?->name,
            optional($r->submitted_at)->format('Y-m-d H:i'),
        ];
    }
}
