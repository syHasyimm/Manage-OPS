<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicCalendar extends Model
{
    protected $fillable = [
        'title',
        'category',
        'start_date',
        'end_date',
        'academic_year',
        'semester',
        'description',
        'target_audience',
        'color',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
