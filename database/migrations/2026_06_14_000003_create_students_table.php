<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('nis', 30)->unique();
            $table->string('nisn', 10)->unique();
            $table->string('nik', 16)->unique();
            $table->string('birth_place', 100);
            $table->date('birth_date');
            $table->string('religion', 30);
            $table->text('address');
            $table->string('kelas', 5);
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
