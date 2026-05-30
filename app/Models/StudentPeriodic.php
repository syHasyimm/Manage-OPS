<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentPeriodic extends Model
{
    protected $fillable = [
        'registration_id',
        'height_cm',
        'weight_kg',
        'hobby',
        'aspiration',
        'birth_certificate_number',
        'distance_category',
        'distance_km',
        'travel_time_minutes',
        'siblings_count',
    ];

    protected function casts(): array
    {
        return [
            'height_cm' => 'integer',
            'weight_kg' => 'integer',
            'distance_km' => 'decimal:2',
            'travel_time_minutes' => 'integer',
            'siblings_count' => 'integer',
        ];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
