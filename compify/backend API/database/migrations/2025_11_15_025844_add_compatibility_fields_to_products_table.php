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
        Schema::table('products', function (Blueprint $table) {
            // Tipo de componente (cpu, motherboard, ram, gpu, psu, storage, case)
            $table->string('component_type', 20)->nullable()->after('category_id');
            
            // Campos para CPU
            $table->string('socket', 50)->nullable()->after('component_type');
            $table->integer('tdp')->nullable()->after('socket'); // Thermal Design Power en watts
            $table->integer('cores')->nullable()->after('tdp');
            $table->integer('threads')->nullable()->after('cores');
            $table->decimal('base_clock', 4, 2)->nullable()->after('threads'); // GHz
            $table->decimal('turbo_clock', 4, 2)->nullable()->after('base_clock'); // GHz
            
            // Campos para Motherboard
            $table->string('ram_type', 20)->nullable()->after('turbo_clock'); // ddr4, ddr5
            $table->integer('max_ram')->nullable()->after('ram_type'); // GB máximo soportado
            $table->integer('ram_slots')->nullable()->after('max_ram');
            
            // Campos para RAM
            $table->string('memory_type', 20)->nullable()->after('ram_slots'); // ddr4, ddr5
            $table->integer('capacity')->nullable()->after('memory_type'); // GB
            $table->integer('speed')->nullable()->after('capacity'); // MHz
            
            // Campos para GPU
            $table->integer('vram')->nullable()->after('speed'); // GB
            
            // Campos para PSU (Fuente de Poder)
            $table->integer('wattage')->nullable()->after('vram'); // Watts
            $table->string('efficiency', 20)->nullable()->after('wattage'); // 80+ Bronze, Gold, etc
            
            // Campos para Storage
            $table->string('storage_type', 20)->nullable()->after('efficiency'); // ssd, hdd, nvme
            $table->integer('storage_capacity')->nullable()->after('storage_type'); // GB
            
            // Precio base (opcional, puede venir de la tabla prices)
            $table->decimal('base_price', 10, 2)->nullable()->after('storage_capacity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'component_type',
                'socket',
                'tdp',
                'cores',
                'threads',
                'base_clock',
                'turbo_clock',
                'ram_type',
                'max_ram',
                'ram_slots',
                'memory_type',
                'capacity',
                'speed',
                'vram',
                'wattage',
                'efficiency',
                'storage_type',
                'storage_capacity',
                'base_price'
            ]);
        });
    }
};
