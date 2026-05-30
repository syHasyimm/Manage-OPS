<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappLog extends Model
{
    protected $table = 'whatsapp_logs';

    public const STATUS_PENDING = 'pending';
    public const STATUS_SENT = 'sent';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'to',
        'type',
        'purpose',
        'message',
        'file_path',
        'status',
        'response',
        'error',
    ];

    protected function casts(): array
    {
        return [
            'response' => 'array',
        ];
    }
}
