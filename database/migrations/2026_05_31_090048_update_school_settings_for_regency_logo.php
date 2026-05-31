<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            if (Schema::hasColumn('school_settings', 'government_province')) {
                $table->dropColumn('government_province');
            }
        });

        Schema::table('school_settings', function (Blueprint $table) {
            if (! Schema::hasColumn('school_settings', 'regency_logo_path')) {
                $table->string('regency_logo_path')->nullable()->after('logo_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            if (Schema::hasColumn('school_settings', 'regency_logo_path')) {
                $table->dropColumn('regency_logo_path');
            }
        });

        Schema::table('school_settings', function (Blueprint $table) {
            if (! Schema::hasColumn('school_settings', 'government_province')) {
                $table->string('government_province', 100)->nullable()->after('id');
            }
        });
    }
};
