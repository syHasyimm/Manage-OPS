<?php

namespace App\Services\WhatsApp\Drivers;

use App\Models\User;
use App\Services\WhatsApp\Contracts\WhatsAppService;
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
