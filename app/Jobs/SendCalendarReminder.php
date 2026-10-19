<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Retained so reminders queued before feature removal can finish without sending.
 */
class SendCalendarReminder implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $deliveryId)
    {
        $this->onQueue('calendar-reminders');
    }

    public function handle(): void
    {
        // Calendar reminders have been removed, including previously queued sends.
    }
}
