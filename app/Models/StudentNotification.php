<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentNotification extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_SENT = 'terkirim';

    public const STATUS_FAILED = 'gagal';

    protected $fillable = [
        'student_id',
        'template_id',
        'sent_by',
        'category',
        'student_name',
        'template_name',
        'variables',
        'final_message',
        'target_phone',
        'status',
        'error',
        'sent_at',
        'batch_id',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
