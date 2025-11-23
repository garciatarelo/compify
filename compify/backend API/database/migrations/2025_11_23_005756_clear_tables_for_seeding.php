<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    // Deshabilitar temporalmente las restricciones de clave foránea
    DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    
    // Limpiar las tablas en orden inverso de dependencias
    DB::table('favorites')->truncate();
    DB::table('histories')->truncate();
    DB::table('pc_build_items')->truncate();
    DB::table('pc_builds')->truncate();
    DB::table('prices')->truncate();
    DB::table('products')->truncate();
    DB::table('stores')->truncate();
    DB::table('categories')->truncate();
    DB::table('users')->truncate();
    
    // Volver a habilitar las restricciones
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
