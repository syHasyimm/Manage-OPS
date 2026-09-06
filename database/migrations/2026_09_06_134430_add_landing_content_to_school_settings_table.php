<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->string('tagline')->nullable();
            $table->text('short_desc')->nullable();
            $table->text('principal_quote')->nullable();
            $table->string('principal_image_path')->nullable();
            $table->text('vision')->nullable();
            $table->string('operating_hours', 100)->nullable();
            $table->string('office_hours', 100)->nullable();
            $table->string('maps_url', 500)->nullable();
            $table->string('hero_image_path')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn([
                'tagline',
                'short_desc',
                'principal_quote',
                'principal_image_path',
                'vision',
                'operating_hours',
                'office_hours',
                'maps_url',
                'hero_image_path',
            ]);
        });
    }
};
