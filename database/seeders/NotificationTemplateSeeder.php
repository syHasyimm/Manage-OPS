<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use App\Support\NotificationTemplates;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        foreach (NotificationTemplates::defaultTemplates() as $template) {
            NotificationTemplate::firstOrCreate(
                [
                    'category' => $template['category'],
                    'name' => $template['name'],
                ],
                $template,
            );
        }
    }
}
