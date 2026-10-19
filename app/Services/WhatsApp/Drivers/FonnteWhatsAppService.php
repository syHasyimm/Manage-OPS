<?php

namespace App\Services\WhatsApp\Drivers;

use App\Models\User;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use App\Services\WhatsApp\SendReceipt;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteWhatsAppService implements WhatsAppService
{
    public function __construct(
        protected ?string $token,
        protected string $baseUrl = 'https://api.fonnte.com',
        protected int $timeout = 15,
    ) {}

    public function sendTextWithReceipt(string $to, string $message): SendReceipt
    {
        if (empty($this->token)) {
            return new SendReceipt('failed', error: 'Token Fonnte belum diatur.');
        }

        try {
            // No HTTP retry: a lost response may still mean Fonnte accepted the message.
            $response = $this->client()->post("{$this->baseUrl}/send", [
                'target' => User::normalizePhone($to),
                'message' => $message,
                'countryCode' => '62',
                'connectOnly' => true,
            ]);
            $json = $response->json();
            // Store only receipt metadata; never echo arbitrary gateway content or secrets.
            $receipt = ['http_status' => $response->status()];
            foreach (['id', 'requestid', 'process', 'status'] as $key) {
                if (isset($json[$key])) {
                    $receipt[$key] = $json[$key];
                }
            }

            if ($response->successful() && ($json['status'] ?? null) === true) {
                return new SendReceipt('accepted', $receipt);
            }

            if (($response->successful() && ($json['status'] ?? null) === false)
                || ($response->clientError() && ! in_array($response->status(), [408, 429]))) {
                return new SendReceipt('failed', $receipt, 'Fonnte menolak permintaan. Periksa token, perangkat, kuota, dan nomor tujuan.');
            }

            return new SendReceipt('uncertain', $receipt, 'Respons Fonnte tidak memastikan hasil. Periksa Fonnte sebelum mengirim ulang.');
        } catch (\Throwable) {
            return new SendReceipt('uncertain', error: 'Koneksi terputus atau timeout; pesan mungkin sudah diterima Fonnte.');
        }
    }

    public function sendText(string $to, string $message): bool
    {
        return $this->dispatch([
            'target' => User::normalizePhone($to),
            'message' => $message,
            'countryCode' => '62',
        ]);
    }

    public function sendFile(string $to, string $filePath, string $caption = ''): bool
    {
        if (! is_file($filePath)) {
            $this->logFailure('file_missing', $to, ['file' => $filePath]);

            return false;
        }

        return $this->dispatch(
            [
                'target' => User::normalizePhone($to),
                'message' => $caption,
                'countryCode' => '62',
            ],
            $filePath,
        );
    }

    /**
     * @param  array<string, scalar>  $payload
     */
    protected function dispatch(array $payload, ?string $filePath = null): bool
    {
        if (empty($this->token)) {
            $this->logFailure('missing_token', $payload['target'] ?? '');

            return false;
        }

        try {
            $request = $this->client();

            if ($filePath) {
                $request = $request->attach('file', file_get_contents($filePath), basename($filePath));
            }

            $response = $request->post("{$this->baseUrl}/send", $payload);

            if (! $response->successful()) {
                $this->logFailure('http_error', (string) ($payload['target'] ?? ''), [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return false;
            }

            $json = $response->json();

            if (! ($json['status'] ?? false)) {
                $this->logFailure('gateway_error', (string) ($payload['target'] ?? ''), $json ?? []);

                return false;
            }

            return true;
        } catch (\Throwable $e) {
            $this->logFailure('exception', (string) ($payload['target'] ?? ''), [
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    protected function client(): PendingRequest
    {
        return Http::withHeaders([
            'Authorization' => $this->token,
        ])->timeout($this->timeout);
    }

    /**
     * @param  array<string, mixed>  $context
     */
    protected function logFailure(string $reason, string $to, array $context = []): void
    {
        Log::warning('Fonnte WA failure', array_merge([
            'reason' => $reason,
            'to' => $to,
        ], $context));
    }
}
