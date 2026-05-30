<?php

namespace App\Services\WhatsApp\Drivers;

use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Support\Facades\Log;

/**
 * Driver fallback: hanya menulis log. Berguna saat Fonnte token belum di-set
 * atau saat menjalankan testing.
 */
class LogWhatsAppService implements WhatsAppService
{
    public function sendText(string $to, string $message): bool
    {
        Log::info('[WA-LOG] sendText', [
            'to' => $to,
            'message' => $message,
        ]);

        return true;
    }

    public function sendFile(string $to, string $filePath, string $caption = ''): bool
    {
        Log::info('[WA-LOG] sendFile', [
            'to' => $to,
            'file' => $filePath,
            'caption' => $caption,
        ]);

        return true;
    }
}
