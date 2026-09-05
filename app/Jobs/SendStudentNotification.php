<?php

namespace App\Jobs;

use App\Models\StudentNotification;
use App\Models\WhatsappLog;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendStudentNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public int $notificationId) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $notification = StudentNotification::query()->findOrFail($this->notificationId);

        if ($notification->status === StudentNotification::STATUS_SENT) {
            return;
        }

        $log = WhatsappLog::create([
            'to' => $notification->target_phone,
            'type' => 'text',
            'purpose' => 'student-notification.'.$notification->id,
            'message' => $notification->final_message,
            'status' => WhatsappLog::STATUS_PENDING,
        ]);

        try {
            $sent = $whatsapp->sendText($notification->target_phone, $notification->final_message);

            $notification->update([
                'status' => $sent ? StudentNotification::STATUS_SENT : StudentNotification::STATUS_FAILED,
                'sent_at' => $sent ? now() : null,
                'error' => $sent ? null : 'WhatsApp gateway returned a failure response.',
            ]);
            $log->update([
                'status' => $sent ? WhatsappLog::STATUS_SENT : WhatsappLog::STATUS_FAILED,
                'error' => $sent ? null : 'WhatsApp gateway returned a failure response.',
            ]);

            if (! $sent) {
                throw new \RuntimeException('WhatsApp gateway returned a failure response.');
            }
        } catch (\Throwable $e) {
            $notification->update([
                'status' => StudentNotification::STATUS_FAILED,
                'sent_at' => null,
                'error' => $e->getMessage(),
            ]);
            $log->update([
                'status' => WhatsappLog::STATUS_FAILED,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
