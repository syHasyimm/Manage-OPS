<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_periodics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('height_cm');
            $table->unsignedSmallInteger('weight_kg');
            $table->string('hobby')->nullable();
            $table->string('aspiration')->nullable();
            $table->string('birth_certificate_number')->nullable();
            $table->enum('distance_category', ['<1km', '>1km']);
            $table->decimal('distance_km', 6, 2)->nullable();
            $table->unsignedSmallInteger('travel_time_minutes')->nullable();
            $table->unsignedTinyInteger('siblings_count')->default(0);
            $table->timestamps();

            $table->unique('registration_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_periodics');
    }
};
