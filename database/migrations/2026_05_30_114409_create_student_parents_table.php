<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['father', 'mother', 'guardian'])->index();
            $table->string('name');
            $table->string('nik', 16)->nullable();
            $table->enum('occupation', [
                'tidak_bekerja', 'nelayan', 'petani', 'peternak', 'pns_tni_polri',
                'karyawan_swasta', 'pedagang_kecil', 'pedagang_besar',
                'wiraswasta', 'wirausaha', 'buruh', 'pensiunan', 'lainnya',
            ])->nullable();
            $table->enum('education', [
                'tidak_sekolah', 'sd', 'smp', 'sma', 'd1', 'd2', 'd3',
                's1', 's2', 's3', 'lainnya',
            ])->nullable();
            $table->enum('monthly_income', [
                '<1jt', '1-2jt', '2-3jt', '3-5jt', '5-20jt', '>20jt', 'tidak_berpenghasilan',
            ])->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_alive')->default(true);
            $table->timestamps();

            $table->unique(['registration_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_parents');
    }
};
