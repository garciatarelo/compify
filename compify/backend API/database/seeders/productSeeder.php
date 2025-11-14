<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class productSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('products')->insert([
            [
                'product_id' => 1,
                'category_id' => 1,
                'brand' => 'Dell',
                'model' => 'XPS 15 9530',
                'cpu' => 'Intel Core i7-13700H',
                'ram' => '16GB DDR5',
                'storage' => '512GB NVMe SSD',
                'display' => '15.6" FHD+ (1920x1200)',
                'image_url' => 'https://example.com/dell-xps-15.jpg',
                'description' => 'Laptop Dell XPS 15 con procesador Intel Core i7 de 13va generación, 16GB RAM, pantalla FHD+ ideal para trabajo profesional y creación de contenido',
            ],
            [
                'product_id' => 2,
                'category_id' => 2,
                'brand' => 'NVIDIA',
                'model' => 'GeForce RTX 4070 Ti',
                'cpu' => 'N/A',
                'ram' => '12GB GDDR6X',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://example.com/rtx-4070-ti.jpg',
                'description' => 'Tarjeta gráfica NVIDIA GeForce RTX 4070 Ti con 12GB de memoria GDDR6X, ideal para gaming en 4K y renderizado profesional',
            ],
        ]);
    }
}
