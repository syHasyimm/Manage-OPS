<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolValue extends Model
{
    protected $fillable = [
        'title',
        'description',
        'icon',
        'sort_order',
    ];
}
