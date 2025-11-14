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
        Schema::create('compatibilities', function (Blueprint $table) {
            $table->id('com_id');
            $table->foreignId('product_id_1')->constrained('products', 'product_id')->onDelete('cascade');
            $table->foreignId('product_id_2')->constrained('products', 'product_id')->onDelete('cascade');
            $table->tinyInteger('is_comparable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compatibilities');
    }
};
