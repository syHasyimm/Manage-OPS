<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('graduation_letters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('period_id')->constrained('registration_periods');
            $table->string('letter_number', 100);
            $table->string('decree_number', 100);
            $table->date('decree_date');
            $table->string('regulation_number', 20)->default('22');
            $table->year('regulation_year')->default(2024);
            $table->string('academic_year', 20);
            $table->enum('graduation_status', ['LULUS', 'TIDAK LULUS'])->default('LULUS');
            $table->json('grades');
            $table->decimal('average_score', 5, 2)->default(0);
            $table->string('issued_city', 100);
            $table->date('issued_date');
            $table->string('principal_name_snapshot', 150);
            $table->string('principal_nip_snapshot', 50)->nullable();
            $table->enum('document_status', ['draft', 'final'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'period_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graduation_letters');
    }
};
