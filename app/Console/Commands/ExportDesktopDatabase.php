<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Throwable;

class ExportDesktopDatabase extends Command
{
    protected $signature = 'desktop:export-database {path : Lokasi database SQLite hasil ekspor} {--force : Timpa hasil ekspor yang sudah ada}';

    protected $description = 'Membuat database SQLite desktop dari database aplikasi yang aktif';

    public function handle(): int
    {
        if (! extension_loaded('pdo_sqlite')) {
            $this->error('Extension pdo_sqlite belum aktif pada PHP yang menjalankan perintah ini.');

            return self::FAILURE;
        }

        $path = $this->absolutePath((string) $this->argument('path'));
        $directory = dirname($path);

        if (! is_dir($directory) && ! mkdir($directory, 0775, true) && ! is_dir($directory)) {
            throw new RuntimeException("Tidak dapat membuat direktori {$directory}");
        }

        if (file_exists($path)) {
            if (! $this->option('force')) {
                $this->error("File {$path} sudah ada. Gunakan --force untuk menggantinya.");

                return self::FAILURE;
            }

            unlink($path);
        }

        touch($path);

        $sourceName = DB::getDefaultConnection();
        $source = DB::connection($sourceName);

        config(['database.connections.desktop_export' => [
            'driver' => 'sqlite',
            'database' => $path,
            'prefix' => '',
            'foreign_key_constraints' => true,
            'busy_timeout' => 5000,
            'journal_mode' => 'WAL',
            'synchronous' => 'NORMAL',
            'transaction_mode' => 'IMMEDIATE',
        ]]);

        DB::purge('desktop_export');

        try {
            $exitCode = Artisan::call('migrate', [
                '--database' => 'desktop_export',
                '--force' => true,
            ]);

            if ($exitCode !== self::SUCCESS) {
                throw new RuntimeException(Artisan::output());
            }

            $target = DB::connection('desktop_export');
            $target->statement('PRAGMA foreign_keys = OFF');

            $excluded = [
                'migrations', 'cache', 'cache_locks', 'sessions',
                'password_reset_tokens', 'otp_codes', 'jobs',
                'job_batches', 'failed_jobs',
            ];

            $tables = collect(Schema::connection($sourceName)->getTableListing())
                ->map(fn (string $table) => $this->plainTableName($table))
                ->unique()
                ->values();

            foreach ($tables as $table) {

                if (in_array($table, $excluded, true) || ! Schema::connection('desktop_export')->hasTable($table)) {
                    continue;
                }

                $query = $source->table($table);
                if (Schema::connection($sourceName)->hasColumn($table, 'id')) {
                    $query->orderBy('id');
                }

                $count = 0;
                foreach ($query->get()->chunk(250) as $chunk) {
                    $rows = $chunk->map(fn (object $row) => (array) $row)->all();
                    if ($rows !== []) {
                        $target->table($table)->insert($rows);
                        $count += count($rows);
                    }
                }

                $this->line("{$table}: {$count} baris");
            }

            $target->statement('PRAGMA foreign_keys = ON');
            $violations = $target->select('PRAGMA foreign_key_check');

            if ($violations !== []) {
                throw new RuntimeException('Hasil ekspor memiliki pelanggaran foreign key.');
            }
        } catch (Throwable $exception) {
            DB::disconnect('desktop_export');
            @unlink($path);
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        DB::disconnect('desktop_export');
        $this->info("Database desktop berhasil dibuat: {$path}");

        return self::SUCCESS;
    }

    private function absolutePath(string $path): string
    {
        if (preg_match('/^[A-Za-z]:[\\\\\/]/', $path) === 1 || str_starts_with($path, DIRECTORY_SEPARATOR)) {
            return $path;
        }

        return base_path($path);
    }

    private function plainTableName(string $table): string
    {
        $parts = explode('.', $table);

        return end($parts) ?: $table;
    }
}
