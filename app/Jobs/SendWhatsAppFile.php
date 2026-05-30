<?php

namespace App\Jobs;

use App\Models\WhatsappLog;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendWhatsAppFile implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public string $to,
        public string $filePath,
        public string $caption = '',
        public ?string $purpose = null,
    ) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $log = WhatsappLog::create([
            'to' => $this->to,
            'type' => 'file',
            'purpose' => $this->purpose,
            'message' => $this->caption,
            'file_path' => $this->filePath,
            'status' => WhatsappLog::STATUS_PENDING,
        ]);

        try {
            $sent = $whatsapp->sendFile($this->to, $this->filePath, $this->caption);

            $log->update([
                'status' => $sent ? WhatsappLog::STATUS_SENT : WhatsappLog::STATUS_FAILED,
            ]);

            if (! $sent) {
                throw new \RuntimeException('WhatsApp gateway returned a failure response.');
            }
        } catch (\Throwable $e) {
            $log->update([
                'status' => WhatsappLog::STATUS_FAILED,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
