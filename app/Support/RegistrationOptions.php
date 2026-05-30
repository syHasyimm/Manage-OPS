<?php

namespace App\Support;

/**
 * Single source of truth untuk opsi-opsi enum di formulir pendaftaran.
 * Dipakai oleh Form Requests (validasi) dan dishare ke frontend via Inertia.
 */
class RegistrationOptions
{
    public const GENDERS = [
        'L' => 'Laki-Laki',
        'P' => 'Perempuan',
    ];

    public const RELIGIONS = [
        'islam' => 'Islam',
        'kristen' => 'Kristen',
        'katholik' => 'Katholik',
        'hindu' => 'Hindu',
        'budha' => 'Budha',
        'khonghucu' => 'Khonghucu',
        'kepercayaan' => 'Kepercayaan Kepada Tuhan YME',
        'lainnya' => 'Lainnya',
    ];

    public const SPECIAL_NEEDS = [
        'netra' => 'Netra',
        'rungu' => 'Rungu',
        'grahita_ringan' => 'Grahita Ringan',
        'grahita_sedang' => 'Grahita Sedang',
        'daksa_ringan' => 'Daksa Ringan',
        'daksa_sedang' => 'Daksa Sedang',
        'laras' => 'Laras',
        'wicara' => 'Wicara',
        'hyperaktif' => 'Hyperaktif',
        'cerdas_istimewa' => 'Cerdas Istimewa',
        'kesulitan_belajar' => 'Kesulitan Belajar',
        'autis' => 'Autis',
    ];

    public const RESIDENCE_TYPES = [
        'orang_tua' => 'Bersama Orang Tua',
        'wali' => 'Wali',
        'kost' => 'Kost',
        'asrama' => 'Asrama',
        'panti_asuhan' => 'Panti Asuhan',
        'pesantren' => 'Pesantren',
        'lainnya' => 'Lainnya',
    ];

    public const TRANSPORTATIONS = [
        'jalan_kaki' => 'Jalan Kaki',
        'ojek' => 'Ojek',
        'andong' => 'Andong / Bendi / Sado / Dokar / Delman / Becak',
        'perahu' => 'Perahu Penyebrangan / Rakit / Getek',
        'kuda' => 'Kuda',
        'sepeda' => 'Sepeda',
        'sepeda_motor' => 'Sepeda Motor',
        'mobil_pribadi' => 'Mobil Pribadi',
        'lainnya' => 'Lainnya',
    ];

    public const DISTANCE_CATEGORIES = [
        '<1km' => 'Kurang dari 1 km',
        '>1km' => 'Lebih dari 1 km',
    ];

    public const OCCUPATIONS = [
        'tidak_bekerja' => 'Tidak Bekerja',
        'nelayan' => 'Nelayan',
        'petani' => 'Petani',
        'peternak' => 'Peternak',
        'pns_tni_polri' => 'PNS / TNI / Polri',
        'karyawan_swasta' => 'Karyawan Swasta',
        'pedagang_kecil' => 'Pedagang Kecil',
        'pedagang_besar' => 'Pedagang Besar',
        'wiraswasta' => 'Wiraswasta',
        'wirausaha' => 'Wirausaha',
        'buruh' => 'Buruh',
        'pensiunan' => 'Pensiunan',
        'lainnya' => 'Lainnya',
    ];

    public const EDUCATIONS = [
        'tidak_sekolah' => 'Tidak Sekolah',
        'sd' => 'SD / Sederajat',
        'smp' => 'SMP / Sederajat',
        'sma' => 'SMA / Sederajat',
        'd1' => 'D1',
        'd2' => 'D2',
        'd3' => 'D3',
        's1' => 'S1',
        's2' => 'S2',
        's3' => 'S3',
        'lainnya' => 'Lainnya',
    ];

    public const INCOMES = [
        'tidak_berpenghasilan' => 'Tidak Berpenghasilan',
        '<1jt' => 'Kurang dari Rp 1.000.000',
        '1-2jt' => 'Rp 1.000.000 - Rp 2.000.000',
        '2-3jt' => 'Rp 2.000.000 - Rp 3.000.000',
        '3-5jt' => 'Rp 3.000.000 - Rp 5.000.000',
        '5-20jt' => 'Rp 5.000.000 - Rp 20.000.000',
        '>20jt' => 'Lebih dari Rp 20.000.000',
    ];

    public static function keys(array $assoc): array
    {
        return array_keys($assoc);
    }

    /**
     * Returns all options as nested array suitable for Inertia shared props.
     *
     * @return array<string, array<int, array{value: string, label: string}>>
     */
    public static function all(): array
    {
        return [
            'genders' => self::toList(self::GENDERS),
            'religions' => self::toList(self::RELIGIONS),
            'special_needs' => self::toList(self::SPECIAL_NEEDS),
            'residence_types' => self::toList(self::RESIDENCE_TYPES),
            'transportations' => self::toList(self::TRANSPORTATIONS),
            'distance_categories' => self::toList(self::DISTANCE_CATEGORIES),
            'occupations' => self::toList(self::OCCUPATIONS),
            'educations' => self::toList(self::EDUCATIONS),
            'incomes' => self::toList(self::INCOMES),
        ];
    }

    protected static function toList(array $assoc): array
    {
        $out = [];
        foreach ($assoc as $value => $label) {
            $out[] = ['value' => $value, 'label' => $label];
        }

        return $out;
    }
}
