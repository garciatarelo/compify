<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('product_groups')) {
            Schema::create('product_groups', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->string('image_url')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasColumn('products', 'product_group_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreignId('product_group_id')->nullable()->constrained('product_groups')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['product_group_id']);
            $table->dropColumn('product_group_id');
        });

        Schema::dropIfExists('product_groups');
    }
};
