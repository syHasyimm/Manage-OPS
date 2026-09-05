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
        Schema::create('desain_kartu_nisns', function (Blueprint $table) {
            $table->id();
            $table->string('warna_primary', 7)->default('#1d4ed8');
            $table->string('nama_sekolah', 200)->nullable();
            $table->text('alamat_sekolah')->nullable();
            $table->string('logo_sekolah', 500)->nullable();
            $table->string('logo_nisn', 500)->nullable();
            $table->string('logo_dapodik', 500)->nullable();
            $table->string('background_depan', 500)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('desain_kartu_nisns');
    }
};
