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
        Schema::table('graduation_letters', function (Blueprint $table) {
            // First add the new unique index so `student_id` foreign key still has an index
            $table->unique(['student_id', 'academic_year']);

            // Drop foreign key and old unique index
            $table->dropForeign(['period_id']);
            $table->dropUnique(['student_id', 'period_id']);

            // Drop column
            $table->dropColumn('period_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('graduation_letters', function (Blueprint $table) {
            $table->dropUnique(['student_id', 'academic_year']);
            $table->foreignId('period_id')->nullable()->constrained('registration_periods');
            $table->unique(['student_id', 'period_id']);
        });
    }
};
