<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DesainKartuNisn extends Model
{
    protected $fillable = [
        'warna_primary',
        'nama_sekolah',
        'alamat_sekolah',
        'logo_sekolah',
        'logo_nisn',
        'logo_dapodik',
        'background_depan',
    ];

    public const CACHE_KEY = 'desain_kartu_nisn:current';

    public static function current(): self
    {
        return self::firstOrCreate(
            ['id' => 1],
            self::defaultsFromSchoolSetting()
        );
    }

    public static function defaultsFromSchoolSetting(): array
    {
        $school = SchoolSetting::current();
        
        return [
            'warna_primary' => '#1d4ed8',
            'nama_sekolah' => $school->name ?? 'Sekolah Anda',
            'alamat_sekolah' => $school->fullAddress() ?? 'Alamat Sekolah',
        ];
    }
}
