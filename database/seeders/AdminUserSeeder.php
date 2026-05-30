<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $phone = config('spmb.admin.phone');
        $password = config('spmb.admin.password');
        $name = config('spmb.admin.name', 'Administrator SPMB');

        if (empty($phone) || empty($password)) {
            $this->command?->warn('ADMIN_PHONE / ADMIN_PASSWORD belum di-set di .env, AdminUserSeeder dilewati.');

            return;
        }

        User::updateOrCreate(
            ['phone' => $phone],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => User::ROLE_ADMIN,
                'phone_verified_at' => now(),
            ],
        );

        $this->command?->info("Admin user disiapkan untuk nomor {$phone}.");
    }
}
