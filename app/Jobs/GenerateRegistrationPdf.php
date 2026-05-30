<?php

namespace App\Jobs;

use App\Models\Registration;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class GenerateRegistrationPdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public int $registrationId) {}

    public function handle(): void
    {
        $registration = Registration::with([
            'user',
            'period',
            'identity',
            'periodic',
            'parents',
        ])->findOrFail($this->registrationId);

        if (! $registration->registration_number) {
            return;
        }

        $statusUrl = URL::to('/cek-status?no='.$registration->registration_number);

        $qrSvg = QrCode::format('svg')
            ->size(110)
            ->margin(0)
            ->errorCorrection('M')
            ->generate($statusUrl);

        $pdf = Pdf::loadView('pdf.registration', [
            'registration' => $registration,
            'identity' => $registration->identity,
            'periodic' => $registration->periodic,
            'father' => $registration->parents->firstWhere('role', 'father'),
            'mother' => $registration->parents->firstWhere('role', 'mother'),
            'guardian' => $registration->parents->firstWhere('role', 'guardian'),
            'school' => config('spmb.school'),
            'qr' => $qrSvg,
            'statusUrl' => $statusUrl,
        ])
            ->setPaper('folio', 'portrait')
            ->setOption(['isPhpEnabled' => true]);

        $relative = "registrations/{$registration->registration_number}.pdf";
        Storage::disk('public')->put($relative, $pdf->output());

        $registration->forceFill(['pdf_path' => $relative])->save();
    }
}
