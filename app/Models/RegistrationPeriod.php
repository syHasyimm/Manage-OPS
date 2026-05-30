<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistrationPeriod extends Model
{
    protected $fillable = [
        'academic_year',
        'opens_at',
        'closes_at',
        'is_active',
        'last_sequence',
    ];

    protected function casts(): array
    {
        return [
            'opens_at' => 'datetime',
            'closes_at' => 'datetime',
            'is_active' => 'boolean',
            'last_sequence' => 'integer',
        ];
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'period_id');
    }

    public function isOpen(): bool
    {
        return $this->is_active
            && $this->opens_at->isPast()
            && $this->closes_at->isFuture();
    }

    /**
     * Tahun (4 digit) untuk format nomor pendaftaran.
     */
    public function yearKey(): string
    {
        return explode('/', $this->academic_year)[0] ?? (string) now()->year;
    }

    public static function active(): ?self
    {
        return static::where('is_active', true)->first();
    }
}
