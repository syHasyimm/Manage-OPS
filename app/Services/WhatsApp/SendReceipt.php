<?php

namespace App\Services\WhatsApp;

final readonly class SendReceipt
{
    public function __construct(public string $status, public array $response = [], public ?string $error = null) {}
}
