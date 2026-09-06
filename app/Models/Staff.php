<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $fillable = [
        'name',
        'nip',
        'nuptk',
        'nik',
        'birth_place',
        'birth_date',
        'jabatan',
        'pangkat',
        'golongan',
        'jenis',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }
}
