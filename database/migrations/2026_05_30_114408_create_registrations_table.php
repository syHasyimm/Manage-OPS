<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('period_id')->constrained('registration_periods')->cascadeOnDelete();
            $table->string('registration_number', 32)->nullable()->unique();
            $table->enum('status', [
                'draft',
                'submitted',
                'verified',
                'accepted',
                'rejected',
                'need_revision',
            ])->default('draft')->index();
            $table->unsignedTinyInteger('current_step')->default(1);
            $table->boolean('has_guardian')->default(false);
            $table->string('contact_email')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('admin_note')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'period_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
