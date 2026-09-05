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
        Schema::create('academic_calendars', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category'); // Hari Efektif, Libur Nasional, etc
            $table->date('start_date');
            $table->date('end_date');
            $table->string('academic_year')->nullable();
            $table->string('semester')->nullable();
            $table->text('description')->nullable();
            $table->string('target_audience')->default('Semua');
            $table->string('color')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_calendars');
    }
};
