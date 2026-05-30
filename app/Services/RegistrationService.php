<?php

namespace App\Services;

use App\Models\Registration;
use App\Models\RegistrationPeriod;
use App\Models\User;

class RegistrationService
{
    /**
     * Ambil pendaftaran pada periode aktif untuk user, atau buat draft baru.
     */
    public function getOrCreateForUser(User $user): ?Registration
    {
        $period = RegistrationPeriod::active();

        if (! $period) {
            return null;
        }

        return Registration::firstOrCreate(
            [
                'user_id' => $user->id,
                'period_id' => $period->id,
            ],
            [
                'status' => Registration::STATUS_DRAFT,
                'current_step' => 1,
            ],
        );
    }

    /**
     * Naikkan current_step jika step yang baru disimpan lebih jauh dari sebelumnya.
     */
    public function advanceStep(Registration $registration, int $completedStep): void
    {
        $next = min(3, $completedStep + 1);

        if ($registration->current_step < $next) {
            $registration->forceFill(['current_step' => $next])->save();
        }
    }

    /**
     * Cek apakah formulir bisa diedit oleh user (draft atau sedang revisi).
     */
    public function isEditable(Registration $registration): bool
    {
        return in_array($registration->status, [
            Registration::STATUS_DRAFT,
            Registration::STATUS_NEED_REVISION,
        ], true);
    }
}
