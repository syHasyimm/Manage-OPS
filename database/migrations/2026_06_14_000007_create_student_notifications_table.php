<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('notification_templates')->nullOnDelete();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('category', 40)->index();
            $table->string('student_name', 150);
            $table->string('template_name', 100)->nullable();
            $table->json('variables');
            $table->text('final_message');
            $table->string('target_phone', 20);
            $table->string('status', 20)->default('pending')->index();
            $table->text('error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->uuid('batch_id')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_notifications');
    }
};
