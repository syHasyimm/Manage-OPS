<?php

namespace App\Services;

use App\Jobs\SendWhatsAppMessage;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Support\Carbon;

class OtpService
{
    public const PURPOSE_REGISTER = 'register';

    public const PURPOSE_RESET = 'reset';

    /**
     * Generate OTP baru, simpan ke DB, dispatch kirim WA.
     */
    public function generate(string $phone, string $purpose, ?string $ip = null): OtpCode
    {
        $length = (int) config('whatsapp.otp.length', 6);
        $expiry = (int) config('whatsapp.otp.expiry_minutes', 5);

        // Hapus OTP belum-terpakai sebelumnya untuk purpose ini -> hanya 1 aktif.
        OtpCode::where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->delete();

        $code = $this->randomDigits($length);

        $otp = OtpCode::create([
            'phone' => $phone,
            'code' => $code,
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes($expiry),
            'ip_address' => $ip,
        ]);

        SendWhatsAppMessage::dispatch(
            to: $phone,
            message: $this->buildMessage($purpose, $code, $expiry),
            purpose: 'otp.'.$purpose,
        );

        return $otp;
    }

    /**
     * Verifikasi kode OTP. Mengembalikan true jika cocok dan belum expired.
     */
    public function verify(string $phone, string $code, string $purpose): bool
    {
        $otp = OtpCode::where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->latest('id')
            ->first();

        if (! $otp) {
            return false;
        }

        $otp->increment('attempts');

        if ($otp->isExpired()) {
            return false;
        }

        if ($otp->code !== $code) {
            return false;
        }

        $otp->forceFill(['used_at' => now()])->save();

        return true;
    }

    /**
     * Apakah user boleh kirim ulang OTP saat ini?
     */
    public function canResend(string $phone, string $purpose): bool
    {
        $cooldown = (int) config('whatsapp.otp.resend_cooldown_seconds', 60);

        $latest = OtpCode::where('phone', $phone)
            ->where('purpose', $purpose)
            ->latest('id')
            ->first();

        if (! $latest) {
            return true;
        }

        return $latest->created_at->addSeconds($cooldown)->isPast();
    }

    public function secondsUntilResend(string $phone, string $purpose): int
    {
        $cooldown = (int) config('whatsapp.otp.resend_cooldown_seconds', 60);

        $latest = OtpCode::where('phone', $phone)
            ->where('purpose', $purpose)
            ->latest('id')
            ->first();

        if (! $latest) {
            return 0;
        }

        $availableAt = $latest->created_at->addSeconds($cooldown);

        return max(0, Carbon::now()->diffInSeconds($availableAt, false));
    }

    protected function randomDigits(int $length): string
    {
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= random_int(0, 9);
        }

        return $code;
    }

    protected function buildMessage(string $purpose, string $code, int $expiry): string
    {
        $school = config('spmb.school.name', 'SD Negeri 001 Kepenuhan');
        $appName = config('app.name');

        $intro = match ($purpose) {
            self::PURPOSE_RESET => 'Anda meminta reset password. Gunakan kode di bawah ini:',
            default => 'Selamat datang di sistem '.$appName.'. Berikut kode verifikasi nomor WhatsApp Anda:',
        };

        return "*{$appName}*\n*{$school}*\n\n{$intro}\n\n*KODE: {$code}*\n\nKode berlaku {$expiry} menit. JANGAN bagikan kode ini kepada siapapun.";
    }
}
