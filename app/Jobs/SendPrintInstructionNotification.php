<?php

namespace App\Jobs;

use App\Models\Registration;
use App\Models\SchoolSetting;
use App\Models\WhatsappLog;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class SendPrintInstructionNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public const PURPOSE = 'registration.print_instruction';

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public int $registrationId) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $registration = Registration::with(['user', 'identity'])->findOrFail($this->registrationId);

        $phone = $registration->identity?->phone_wa ?? $registration->user->phone;
        if (empty($phone)) {
            return;
        }

        // Idempotency guard tambahan: bila ada log SENT untuk purpose+phone+registration ini,
        // jangan kirim ulang. Ini melindungi dari double-dispatch akibat race condition.
        $alreadySent = WhatsappLog::query()
            ->where('purpose', self::PURPOSE)
            ->where('to', $phone)
            ->where('message', 'like', '%'.$registration->registration_number.'%')
            ->where('status', WhatsappLog::STATUS_SENT)
            ->exists();

        if ($alreadySent) {
            return;
        }

        $school = SchoolSetting::current();
        $schoolName = $school->name ?: config('spmb.school.name');
        $studentName = $registration->identity?->full_name ?? $registration->user->name;
        $number = $registration->registration_number;
        $statusUrl = URL::to('/cek-status?no='.$number);

        $address = trim($school->fullAddress());
        $addressLine = $address !== '' ? $address : 'sekolah';
        $contactLine = $school->phone ? "\nKontak panitia: {$school->phone}" : '';

        $message = <<<TXT
*INSTRUKSI FINALISASI PENDAFTARAN*
*{$schoolName}*

Halo {$studentName},
Formulir pendaftaran No. *{$number}* sudah berhasil diunduh.

Langkah selanjutnya:
1. *Cetak* formulir pendaftaran (PDF) yang sudah diunduh
2. Siapkan berkas pendukung sesuai persyaratan sekolah
3. *Bawa & serahkan* berkas ke panitia di {$addressLine}
4. Datang langsung ke sekolah untuk *memfinalisasi pendaftaran*
{$contactLine}
Cek status kapan saja:
{$statusUrl}

Terima kasih.
TXT;

        $log = WhatsappLog::create([
            'to' => $phone,
            'type' => 'text',
            'purpose' => self::PURPOSE,
            'message' => $message,
            'status' => WhatsappLog::STATUS_PENDING,
        ]);

        try {
            $sent = $whatsapp->sendText($phone, $message);
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
