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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('nip', 30)->nullable();
            $table->string('nuptk', 20)->nullable();
            $table->string('nik', 16)->unique();
            $table->string('birth_place', 100);
            $table->date('birth_date');
            $table->string('jabatan', 100);
            $table->string('pangkat', 100)->nullable();
            $table->string('golongan', 20)->nullable();
            $table->enum('jenis', ['guru', 'tendik']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
