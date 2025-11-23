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
        Schema::create('pc_builds', function (Blueprint $table) {
            $table->id('build_id');
            $table->unsignedBigInteger('user_id');
            $table->string('build_name', 100);
            $table->decimal('total_price', 10, 2)->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pc_builds');
    }
};
