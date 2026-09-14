<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SchoolSetting extends Model
{
    protected $fillable = [
        'government_regency',
        'education_office',
        'name',
        'npsn',
        'nss',
        'accreditation',
        'logo_path',
        'regency_logo_path',
        'address',
        'village',
        'district',
        'regency',
        'province',
        'postal_code',
        'phone',
        'email',
        'website',
        'principal_name',
        'principal_nip',
        'principal_title',
        'principal_rank',
        'principal_grade',
        'signature_city',
    ];

    public const CACHE_KEY = 'school_setting:current';

    /**
     * Ambil singleton row pengaturan sekolah dengan cache.
     * Jika belum ada, buat baris default dari config('spmb.school').
     */
    public static function current(): self
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return self::firstOrCreate(
                ['id' => 1],
                self::defaultsFromConfig(),
            );
        });
    }

    public static function bust(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Default dari config/spmb.php (fallback awal sebelum admin mengisi UI).
     */
    public static function defaultsFromConfig(): array
    {
        return [
            'name' => config('spmb.school.name', 'SD Negeri 001 Kepenuhan'),
            'district' => config('spmb.school.district'),
            'address' => config('spmb.school.address'),
            'principal_name' => config('spmb.school.principal') === 'Kepala Sekolah'
                ? null
                : config('spmb.school.principal'),
            'principal_title' => 'Kepala Sekolah',
            'phone' => config('spmb.school.phone') ?: null,
            'email' => config('spmb.school.email') ?: null,
            'signature_city' => config('spmb.school.district'),
            'government_regency' => 'Pemerintah Kabupaten Rokan Hulu',
            'education_office' => 'Dinas Pendidikan',
        ];
    }

    /**
     * URL publik logo (untuk preview di UI).
     */
    public function logoUrl(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    /**
     * Path absolute logo di filesystem (untuk DomPDF).
     */
    public function logoAbsolutePath(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        $path = storage_path('app/public/'.$this->logo_path);

        return file_exists($path) ? $path : null;
    }

    /**
     * URL publik logo kabupaten/dinas.
     */
    public function regencyLogoUrl(): ?string
    {
        if (! $this->regency_logo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->regency_logo_path);
    }

    /**
     * Path absolute logo kabupaten/dinas (untuk DomPDF).
     */
    public function regencyLogoAbsolutePath(): ?string
    {
        if (! $this->regency_logo_path) {
            return null;
        }

        $path = storage_path('app/public/'.$this->regency_logo_path);

        return file_exists($path) ? $path : null;
    }

    /**
     * Alamat lengkap dirangkai untuk KOP PDF.
     */
    public function fullAddress(): string
    {
        $parts = array_filter([
            $this->address,
            $this->village ? 'Desa '.$this->village : null,
            $this->district ? 'Kec. '.$this->district : null,
            $this->regency ? 'Kab. '.$this->regency : null,
            $this->province,
            $this->postal_code,
        ]);

        return implode(', ', $parts);
    }

    /**
     * Bentuk array data untuk dilewatkan ke view PDF.
     */
    public function toPdfArray(): array
    {
        return [
            'name' => $this->name,
            'npsn' => $this->npsn,
            'nss' => $this->nss,
            'accreditation' => $this->accreditation,
            'government_regency' => $this->government_regency,
            'education_office' => $this->education_office,
            'address' => $this->address,
            'village' => $this->village,
            'district' => $this->district,
            'regency' => $this->regency,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'principal_name' => $this->principal_name,
            'principal_nip' => $this->principal_nip,
            'principal_title' => $this->principal_title ?: 'Kepala Sekolah',
            'principal_rank' => $this->principal_rank,
            'principal_grade' => $this->principal_grade,
            'signature_city' => $this->signature_city ?: $this->district,
            'logo_path' => $this->logo_path,
            'logo_absolute' => $this->logoAbsolutePath(),
            'regency_logo_path' => $this->regency_logo_path,
            'regency_logo_absolute' => $this->regencyLogoAbsolutePath(),
            'full_address' => $this->fullAddress(),
        ];
    }
}
