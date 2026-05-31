<?php

namespace Database\Seeders;

use App\Models\SchoolSetting;
use Illuminate\Database\Seeder;

class SchoolSettingSeeder extends Seeder
{
    public function run(): void
    {
        // Buat row default jika belum ada (singleton id=1).
        SchoolSetting::firstOrCreate(
            ['id' => 1],
            SchoolSetting::defaultsFromConfig(),
        );

        SchoolSetting::bust();
    }
}
