<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained()->cascadeOnDelete();
            $table->string('school_name')->default('SD Negeri 001 Kepenuhan');
            $table->string('district')->default('Kepenuhan');
            $table->string('full_name');
            $table->enum('gender', ['L', 'P']);
            $table->string('nik', 16)->index();
            $table->string('kk_number', 16)->index();
            $table->string('previous_kindergarten')->nullable();
            $table->string('birth_place');
            $table->date('birth_date');
            $table->boolean('has_special_needs')->default(false);
            $table->json('special_needs_types')->nullable();
            $table->enum('religion', [
                'islam', 'kristen', 'katholik', 'hindu', 'budha',
                'khonghucu', 'kepercayaan', 'lainnya',
            ]);
            $table->string('dusun_name');
            $table->string('kelurahan_name');
            $table->text('address');
            $table->string('rt', 4);
            $table->string('rw', 4);
            $table->string('postal_code', 6);
            $table->enum('residence_type', [
                'orang_tua', 'wali', 'kost', 'asrama',
                'panti_asuhan', 'pesantren', 'lainnya',
            ]);
            $table->enum('transportation', [
                'jalan_kaki', 'ojek', 'andong', 'perahu', 'kuda',
                'sepeda', 'sepeda_motor', 'mobil_pribadi', 'lainnya',
            ]);
            $table->unsignedTinyInteger('child_order');
            $table->string('phone_wa', 20);
            $table->boolean('is_kps_kph_recipient')->default(false);
            $table->boolean('has_kip')->default(false);
            $table->timestamps();

            $table->unique('registration_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_identities');
    }
};
