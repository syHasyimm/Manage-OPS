<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'category',
        'academic_year',
        'tags',
        'status',
        'uploaded_by',
    ];

    protected $casts = [
        'tags' => 'array',
        'file_size' => 'integer',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFileSizeMbAttribute(): string
    {
        return number_format($this->file_size / 1048576, 2).' MB';
    }
}
