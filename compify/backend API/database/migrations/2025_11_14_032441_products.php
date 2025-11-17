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
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id');
        $table->foreignId('category_id')
              ->constrained('categories', 'category_id')
              ->onDelete('cascade');

        $table->text('brand');
        $table->text('model');
        $table->string('image_url', 255);
        $table->text('description');

        //Especificaciones dinamicas en formato JSON
        $table->json('specs');

        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
