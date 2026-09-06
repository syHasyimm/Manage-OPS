<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolFacility extends Model
{
    protected $fillable = [
        'title',
        'description',
        'icon',
        'image_path',
        'sort_order',
        'is_active',
    ];

    protected $appends = ['image_url'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getImageUrlAttribute()
    {
        return $this->image_path ? \Illuminate\Support\Facades\Storage::url($this->image_path) : null;
    }
}
