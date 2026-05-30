<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_logs', function (Blueprint $table) {
            $table->id();
            $table->string('to', 20)->index();
            $table->string('type', 32)->default('text');
            $table->string('purpose', 64)->nullable();
            $table->text('message')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status', 16)->default('pending');
            $table->json('response')->nullable();
            $table->string('error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_logs');
    }
};
