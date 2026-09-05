<?php

namespace App\Support;

use InvalidArgumentException;

class NotificationTemplates
{
    public const CATEGORY_INVITATION = 'undangan';

    public const CATEGORY_PARENT_CALL = 'pemanggilan_ortu';

    public const CATEGORY_ANNOUNCEMENT = 'pengumuman';

    public const AUTO_VARIABLES = [
        'nama_siswa' => ['label' => 'Nama Siswa'],
        'kelas' => ['label' => 'Kelas'],
        'nama_ortu' => ['label' => 'Nama Ortu'],
        'nama_sekolah' => ['label' => 'Nama Sekolah'],
    ];

    public const MANUAL_VARIABLES = [
        self::CATEGORY_INVITATION => [
            'nama_acara' => ['label' => 'Nama Acara', 'type' => 'text'],
            'tanggal' => ['label' => 'Tanggal', 'type' => 'text'],
            'jam' => ['label' => 'Waktu', 'type' => 'text'],
            'tempat' => ['label' => 'Tempat', 'type' => 'text'],
        ],
        self::CATEGORY_PARENT_CALL => [
            'alasan' => ['label' => 'Perihal / Alasan', 'type' => 'textarea'],
            'tanggal' => ['label' => 'Tanggal', 'type' => 'text'],
            'jam' => ['label' => 'Waktu', 'type' => 'text'],
            'tempat' => ['label' => 'Tempat', 'type' => 'text'],
        ],
        self::CATEGORY_ANNOUNCEMENT => [
            'judul_pengumuman' => ['label' => 'Judul Pengumuman', 'type' => 'text'],
            'isi_pengumuman' => ['label' => 'Isi Pengumuman', 'type' => 'textarea'],
        ],
    ];

    public static function categories(): array
    {
        return [
            self::CATEGORY_INVITATION => 'Undangan',
            self::CATEGORY_PARENT_CALL => 'Pemanggilan Ortu',
            self::CATEGORY_ANNOUNCEMENT => 'Pengumuman',
        ];
    }

    public static function categoryLabel(string $category): string
    {
        return self::categories()[$category] ?? $category;
    }

    public static function manualVariables(string $category): array
    {
        return self::MANUAL_VARIABLES[$category] ?? [];
    }

    public static function variableDefinitions(): array
    {
        $definitions = [];

        foreach (self::categories() as $category => $label) {
            $definitions[$category] = [
                'auto' => self::AUTO_VARIABLES,
                'manual' => self::manualVariables($category),
            ];
        }

        return $definitions;
    }

    public static function allowedVariables(string $category): array
    {
        return array_merge(
            array_keys(self::AUTO_VARIABLES),
            array_keys(self::manualVariables($category)),
        );
    }

    public static function extractVariables(string $body): array
    {
        preg_match_all('/{{\s*([a-zA-Z0-9_]+)\s*}}/', $body, $matches);

        return array_values(array_unique($matches[1] ?? []));
    }

    /**
     * Reject placeholders that cannot be populated for the selected category.
     */
    public static function assertValidBody(string $category, string $body): void
    {
        $unknown = array_diff(self::extractVariables($body), self::allowedVariables($category));

        if ($unknown) {
            throw new InvalidArgumentException('Variabel tidak dikenal: '.implode(', ', $unknown).'.');
        }
    }

    /**
     * Replace placeholders and reject values that would leave an incomplete message.
     *
     * @param  array<string, mixed>  $variables
     */
    public static function render(string $category, string $body, array $variables): string
    {
        self::assertValidBody($category, $body);
        $missing = [];

        foreach (self::extractVariables($body) as $variable) {
            if (! array_key_exists($variable, $variables) || trim((string) $variables[$variable]) === '') {
                $missing[] = $variable;
            }
        }

        if ($missing) {
            throw new InvalidArgumentException('Variabel wajib belum diisi: '.implode(', ', $missing).'.');
        }

        return preg_replace_callback(
            '/{{\s*([a-zA-Z0-9_]+)\s*}}/',
            fn (array $match) => trim((string) $variables[$match[1]]),
            $body,
        );
    }

    public static function defaultTemplates(): array
    {
        return [
            [
                'category' => self::CATEGORY_INVITATION,
                'name' => 'Undangan Orang Tua',
                'body' => "Yth. Bapak/Ibu {{nama_ortu}},\n\nKami mengundang Bapak/Ibu untuk hadir dalam acara berikut terkait ananda {{nama_siswa}} ({{kelas}}):\n\nAcara: {{nama_acara}}\nHari/Tanggal: {{tanggal}}\nWaktu: {{jam}}\nTempat: {{tempat}}\n\nMohon konfirmasi kehadiran Bapak/Ibu. Terima kasih.\n\n{{nama_sekolah}}",
            ],
            [
                'category' => self::CATEGORY_PARENT_CALL,
                'name' => 'Pemanggilan Orang Tua',
                'body' => "Yth. Bapak/Ibu {{nama_ortu}},\n\nKami mohon kehadiran Bapak/Ibu di sekolah terkait ananda {{nama_siswa}} ({{kelas}}).\n\nPerihal: {{alasan}}\nHari/Tanggal: {{tanggal}}\nWaktu: {{jam}}\nTempat: {{tempat}}\n\nMohon kehadiran Bapak/Ibu tepat waktu. Terima kasih atas perhatiannya.\n\n{{nama_sekolah}}",
            ],
            [
                'category' => self::CATEGORY_ANNOUNCEMENT,
                'name' => 'Pengumuman Sekolah',
                'body' => "Yth. Bapak/Ibu {{nama_ortu}},\n\nBerikut pengumuman dari sekolah:\n\n{{judul_pengumuman}}\n{{isi_pengumuman}}\n\nTerima kasih atas perhatiannya.\n\n{{nama_sekolah}}",
            ],
        ];
    }
}
