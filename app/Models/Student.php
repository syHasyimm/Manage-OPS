<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Student extends Model
{
    protected $fillable = [
        'name',
        'gender',
        'nis',
        'nisn',
        'nik',
        'birth_place',
        'birth_date',
        'religion',
        'address',
        'parent_phone',
        'parent_name',
        'kelas',
        'previous_school',
        'photo_path',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(StudentNotification::class);
    }

    public function graduationLetters(): HasMany
    {
        return $this->hasMany(GraduationLetter::class);
    }

    public function photoUrl(): ?string
    {
        if (! $this->photo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->photo_path);
    }
}
