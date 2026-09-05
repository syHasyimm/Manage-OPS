<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentParent extends Model
{
    public const ROLE_FATHER = 'father';

    public const ROLE_MOTHER = 'mother';

    public const ROLE_GUARDIAN = 'guardian';

    protected $table = 'student_parents';

    protected $fillable = [
        'registration_id',
        'role',
        'name',
        'nik',
        'occupation',
        'education',
        'monthly_income',
        'phone',
        'email',
        'is_alive',
    ];

    protected function casts(): array
    {
        return [
            'is_alive' => 'boolean',
        ];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function scopeFather(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_FATHER);
    }

    public function scopeMother(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_MOTHER);
    }

    public function scopeGuardian(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_GUARDIAN);
    }
}
