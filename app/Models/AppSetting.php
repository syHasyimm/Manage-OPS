<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class AppSetting extends Model
{
    public const FONNTE_TOKEN = 'fonnte_token';

    public const FONNTE_DEVICE = 'fonnte_device';

    public const CACHE_PREFIX = 'app_setting:';

    protected $fillable = [
        'key',
        'value',
    ];

    protected $hidden = [
        'value',
    ];

    /**
     * Ambil nilai setting yang tersimpan terenkripsi.
     * Nilai default dipakai jika setting belum pernah disimpan atau tidak dapat didekripsi.
     */
    public static function value(string $key, ?string $default = null): ?string
    {
        $encrypted = Cache::rememberForever(
            self::cacheKey($key),
            fn () => self::query()->where('key', $key)->value('value'),
        );

        if (! is_string($encrypted) || $encrypted === '') {
            return $default;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (DecryptException) {
            return $default;
        }
    }

    /**
     * Simpan setting terenkripsi dan hapus cache nilai lamanya.
     */
    public static function set(string $key, ?string $value): void
    {
        if ($value === null || trim($value) === '') {
            self::query()->where('key', $key)->delete();
            Cache::forget(self::cacheKey($key));

            return;
        }

        self::query()->updateOrCreate(
            ['key' => $key],
            ['value' => Crypt::encryptString($value)],
        );

        Cache::forget(self::cacheKey($key));
    }

    public static function cacheKey(string $key): string
    {
        return self::CACHE_PREFIX.$key;
    }

    public static function mask(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return str_repeat('*', max(4, strlen($value) - 4)).substr($value, -4);
    }
}
