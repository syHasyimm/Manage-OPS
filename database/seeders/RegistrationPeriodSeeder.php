<?php

namespace Database\Seeders;

use App\Models\RegistrationPeriod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class RegistrationPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $year = config('spmb.period.academic_year', '2026/2027');
        $opens = Carbon::parse(config('spmb.period.opens_at'));
        $closes = Carbon::parse(config('spmb.period.closes_at'));

        // Pastikan hanya satu periode aktif: nonaktifkan dulu yang ada.
        RegistrationPeriod::where('is_active', true)->update(['is_active' => false]);

        RegistrationPeriod::updateOrCreate(
            ['academic_year' => $year],
            [
                'opens_at' => $opens,
                'closes_at' => $closes,
                'is_active' => true,
            ],
        );

        $this->command?->info("Periode {$year} disiapkan & diaktifkan.");
    }
}
