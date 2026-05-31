<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();

            // Hierarki pemerintahan untuk KOP
            $table->string('government_province', 100)->nullable();
            $table->string('government_regency', 100)->nullable();
            $table->string('education_office', 150)->nullable();

            // Identitas sekolah
            $table->string('name', 150);
            $table->string('npsn', 20)->nullable();
            $table->string('nss', 20)->nullable();
            $table->string('accreditation', 5)->nullable();
            $table->string('logo_path')->nullable();

            // Alamat
            $table->string('address', 255)->nullable();
            $table->string('village', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('regency', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 10)->nullable();

            // Kontak
            $table->string('phone', 30)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('website', 150)->nullable();

            // Pejabat
            $table->string('principal_name', 100)->nullable();
            $table->string('principal_nip', 30)->nullable();
            $table->string('principal_title', 100)->default('Kepala Sekolah');

            // Kota tanda tangan
            $table->string('signature_city', 100)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
