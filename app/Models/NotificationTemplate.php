<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationTemplate extends Model
{
    protected $fillable = [
        'category',
        'name',
        'body',
    ];

    public function notifications(): HasMany
    {
        return $this->hasMany(StudentNotification::class, 'template_id');
    }
}
