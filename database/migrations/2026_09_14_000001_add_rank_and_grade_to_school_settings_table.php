<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->string('principal_rank', 100)->nullable()->after('principal_title');
            $table->string('principal_grade', 30)->nullable()->after('principal_rank');
        });
    }

    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn(['principal_rank', 'principal_grade']);
        });
    }
};
