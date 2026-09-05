<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Registration extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_VERIFIED = 'verified';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_NEED_REVISION = 'need_revision';

    protected $fillable = [
        'user_id',
        'period_id',
        'registration_number',
        'status',
        'current_step',
        'has_guardian',
        'contact_email',
        'submitted_at',
        'verified_at',
        'admin_note',
        'pdf_path',
    ];

    protected function casts(): array
    {
        return [
            'has_guardian' => 'boolean',
            'current_step' => 'integer',
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(RegistrationPeriod::class, 'period_id');
    }

    public function identity(): HasOne
    {
        return $this->hasOne(StudentIdentity::class);
    }

    public function periodic(): HasOne
    {
        return $this->hasOne(StudentPeriodic::class);
    }

    public function parents(): HasMany
    {
        return $this->hasMany(StudentParent::class);
    }

    public function father(): HasOne
    {
        return $this->hasOne(StudentParent::class)->where('role', StudentParent::ROLE_FATHER);
    }

    public function mother(): HasOne
    {
        return $this->hasOne(StudentParent::class)->where('role', StudentParent::ROLE_MOTHER);
    }

    public function guardian(): HasOne
    {
        return $this->hasOne(StudentParent::class)->where('role', StudentParent::ROLE_GUARDIAN);
    }

    public function scopeSubmitted(Builder $query): Builder
    {
        return $query->whereNotNull('submitted_at');
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isSubmitted(): bool
    {
        return ! is_null($this->submitted_at) && $this->status !== self::STATUS_DRAFT;
    }
}
