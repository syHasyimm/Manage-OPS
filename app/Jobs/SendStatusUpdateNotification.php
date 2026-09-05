<?php

namespace App\Jobs;

use App\Models\Registration;
use App\Models\WhatsappLog;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class SendStatusUpdateNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public int $registrationId,
        public string $newStatus,
        public ?string $note = null,
    ) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $registration = Registration::with(['user', 'identity'])->findOrFail($this->registrationId);

        $school = config('spmb.school.name');
        $number = $registration->registration_number;
        $studentName = $registration->identity?->full_name ?? $registration->user->name;
        $phone = $registration->identity?->phone_wa ?? $registration->user->phone;
        $statusUrl = URL::to('/cek-status?no='.$number);

        $statusLabel = match ($this->newStatus) {
            Registration::STATUS_VERIFIED => 'TERVERIFIKASI',
            Registration::STATUS_ACCEPTED => 'DITERIMA',
            Registration::STATUS_REJECTED => 'DITOLAK',
            Registration::STATUS_NEED_REVISION => 'PERLU REVISI',
            default => strtoupper($this->newStatus),
        };

        $intro = match ($this->newStatus) {
            Registration::STATUS_VERIFIED => 'Pendaftaran Anda telah diverifikasi oleh admin sekolah.',
            Registration::STATUS_ACCEPTED => 'Selamat! Pendaftaran Anda DITERIMA. Mohon ikuti pengumuman selanjutnya dari sekolah.',
            Registration::STATUS_REJECTED => 'Mohon maaf, pendaftaran Anda belum dapat kami terima.',
            Registration::STATUS_NEED_REVISION => 'Admin meminta perbaikan data pada formulir pendaftaran Anda.',
            default => 'Status pendaftaran Anda telah diperbarui.',
        };

        $message = "*UPDATE STATUS PENDAFTARAN*\n*{$school}*\n\n";
        $message .= "Halo, atas nama *{$studentName}*\nNo. Pendaftaran: *{$number}*\n\n";
        $message .= "{$intro}\n\nStatus: *{$statusLabel}*";

        if (! empty($this->note)) {
            $message .= "\n\nCatatan Admin:\n{$this->note}";
        }

        $message .= "\n\nLihat detail status:\n{$statusUrl}";

        $log = WhatsappLog::create([
            'to' => $phone,
            'type' => 'text',
            'purpose' => 'registration.status.'.$this->newStatus,
            'message' => $message,
            'status' => WhatsappLog::STATUS_PENDING,
        ]);

        try {
            $sent = $whatsapp->sendText($phone, $message);
            $log->update(['status' => $sent ? WhatsappLog::STATUS_SENT : WhatsappLog::STATUS_FAILED]);

            if (! $sent) {
                throw new \RuntimeException('WhatsApp gateway returned a failure response.');
            }
        } catch (\Throwable $e) {
            $log->update(['status' => WhatsappLog::STATUS_FAILED, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}
