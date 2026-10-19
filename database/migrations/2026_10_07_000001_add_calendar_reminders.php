<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_calendars', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
            // Historical events require an explicit opt-in before sending WhatsApp.
            $table->boolean('notification_enabled')->default(false);
            $table->string('start_time', 5)->nullable();
            $table->string('location', 200)->nullable();
            $table->index(['is_active', 'notification_enabled', 'start_date', 'end_date'], 'calendar_reminder_dates');
        });

        Schema::create('teacher_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->nullable()->unique()->constrained('staff')->nullOnDelete();
            $table->string('name', 150);
            $table->string('phone', 20)->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->boolean('notification_enabled')->default(true);
            $table->timestamps();
        });

        // Preserve the old staff records; only carry teacher names into the contact list.
        DB::table('staff')->where('jenis', 'guru')->orderBy('id')->chunkById(100, function ($teachers) {
            foreach ($teachers as $teacher) {
                DB::table('teacher_contacts')->insert([
                    'staff_id' => $teacher->id,
                    'name' => $teacher->name,
                    'phone' => null,
                    'is_active' => true,
                    'notification_enabled' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        Schema::create('calendar_reminder_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_calendar_id')->constrained('academic_calendars')->restrictOnDelete();
            $table->foreignId('teacher_contact_id')->nullable()->constrained('teacher_contacts')->nullOnDelete();
            $table->date('event_date');
            $table->string('timezone', 64);
            $table->string('event_title');
            $table->string('recipient_name', 150);
            $table->string('phone', 20);
            $table->text('message')->nullable();
            $table->string('status', 20)->default('queued');
            $table->unsignedInteger('attempts')->default(0);
            $table->uuid('claim_token')->nullable();
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('gateway_response')->nullable();
            $table->string('error', 500)->nullable();
            $table->timestamps();
            $table->unique(['academic_calendar_id', 'event_date', 'phone'], 'calendar_recipient_day_unique');
            $table->index(['status', 'queued_at']);
            $table->index(['status', 'claimed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_reminder_deliveries');
        Schema::dropIfExists('teacher_contacts');
        Schema::table('academic_calendars', function (Blueprint $table) {
            $table->dropIndex('calendar_reminder_dates');
            $table->dropColumn(['is_active', 'notification_enabled', 'start_time', 'location']);
        });
    }
};
