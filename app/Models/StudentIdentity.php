<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentIdentity extends Model
{
    protected $fillable = [
        'registration_id',
        'school_name',
        'district',
        'full_name',
        'gender',
        'nik',
        'kk_number',
        'previous_kindergarten',
        'birth_place',
        'birth_date',
        'has_special_needs',
        'special_needs_types',
        'religion',
        'dusun_name',
        'kelurahan_name',
        'address',
        'rt',
        'rw',
        'postal_code',
        'residence_type',
        'transportation',
        'child_order',
        'phone_wa',
        'is_kps_kph_recipient',
        'has_kip',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'has_special_needs' => 'boolean',
            'special_needs_types' => 'array',
            'is_kps_kph_recipient' => 'boolean',
            'has_kip' => 'boolean',
            'child_order' => 'integer',
        ];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
