<?php

namespace App\Services;

use App\Models\Registration;
use App\Models\RegistrationPeriod;
use Illuminate\Support\Facades\DB;

class RegistrationNumberGenerator
{
    /**
     * Generate nomor pendaftaran unik per periode dengan format SPMB-{tahun}-{seq:4}.
     * Aman concurrency: pakai lockForUpdate pada baris periode.
     */
    public function generate(Registration $registration): string
    {
        return DB::transaction(function () use ($registration) {
            $period = RegistrationPeriod::lockForUpdate()->findOrFail($registration->period_id);

            $next = $period->last_sequence + 1;
            $period->last_sequence = $next;
            $period->save();

            $padding = (int) config('spmb.sequence_padding', 4);
            $format = config('spmb.number_format', 'SPMB-{year}-{seq}');

            return strtr($format, [
                '{year}' => $period->yearKey(),
                '{seq}' => str_pad((string) $next, $padding, '0', STR_PAD_LEFT),
            ]);
        });
    }
}
