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
use Illuminate\Support\Facades\Storage;

class SendRegistrationConfirmation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public int $registrationId) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $registration = Registration::with(['user', 'identity'])->findOrFail($this->registrationId);
        $school = config('spmb.school.name');
        $number = $registration->registration_number;
        $phone = $registration->identity?->phone_wa ?? $registration->user->phone;
        $statusUrl = url('/cek-status?no='.$number);

        $message = <<<TXT
*PENDAFTARAN BERHASIL*
*{$school}*

Terima kasih, pendaftaran a/n {$registration->identity?->full_name} telah kami terima.

Nomor Pendaftaran: *{$number}*
Status: *Submitted*

Cek status pendaftaran kapan saja:
{$statusUrl}

Mohon menunggu proses verifikasi oleh admin sekolah. Anda akan menerima notifikasi WhatsApp kembali ketika status berubah.
TXT;

        // Kirim teks dulu.
        $textLog = WhatsappLog::create([
            'to' => $phone,
            'type' => 'text',
            'purpose' => 'registration.confirmation',
            'message' => $message,
            'status' => WhatsappLog::STATUS_PENDING,
        ]);

        try {
            $sent = $whatsapp->sendText($phone, $message);
            $textLog->update(['status' => $sent ? WhatsappLog::STATUS_SENT : WhatsappLog::STATUS_FAILED]);
        } catch (\Throwable $e) {
            $textLog->update(['status' => WhatsappLog::STATUS_FAILED, 'error' => $e->getMessage()]);
        }

        // Kirim PDF jika sudah ter-generate.
        if ($registration->pdf_path && Storage::disk('public')->exists($registration->pdf_path)) {
            $absolute = Storage::disk('public')->path($registration->pdf_path);

            $fileLog = WhatsappLog::create([
                'to' => $phone,
                'type' => 'file',
                'purpose' => 'registration.pdf',
                'message' => "Formulir pendaftaran {$number}",
                'file_path' => $registration->pdf_path,
                'status' => WhatsappLog::STATUS_PENDING,
            ]);

            try {
                $sent = $whatsapp->sendFile($phone, $absolute, "Formulir Pendaftaran {$number}");
                $fileLog->update(['status' => $sent ? WhatsappLog::STATUS_SENT : WhatsappLog::STATUS_FAILED]);
            } catch (\Throwable $e) {
                $fileLog->update(['status' => WhatsappLog::STATUS_FAILED, 'error' => $e->getMessage()]);
            }
        }
    }
}
