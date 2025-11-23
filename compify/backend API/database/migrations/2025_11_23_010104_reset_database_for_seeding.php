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
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    
    // Limpiar tablas en orden inverso de dependencias
    DB::table('favorites')->truncate();
    DB::table('histories')->truncate();
    DB::table('pc_build_items')->truncate();
    DB::table('pc_builds')->truncate();
    DB::table('prices')->truncate();
    DB::table('products')->truncate();
    DB::table('stores')->truncate();
    DB::table('categories')->truncate();
    DB::table('users')->truncate();
    
    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
