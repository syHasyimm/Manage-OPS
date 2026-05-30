<?php

namespace App\Services\WhatsApp\Contracts;

interface WhatsAppService
{
    /**
     * Kirim pesan teks ke nomor tujuan.
     *
     * @param  string  $to  Nomor tujuan (format: 08xx atau 62xx).
     * @param  string  $message  Isi pesan.
     * @return bool  True jika request gateway berhasil.
     */
    public function sendText(string $to, string $message): bool;

    /**
     * Kirim file (PDF / gambar) ke nomor tujuan.
     *
     * @param  string  $to  Nomor tujuan.
     * @param  string  $filePath  Path absolut file pada storage.
     * @param  string  $caption  Caption pesan.
     */
    public function sendFile(string $to, string $filePath, string $caption = ''): bool;
}
