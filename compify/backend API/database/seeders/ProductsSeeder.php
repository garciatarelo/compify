<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Primero, asegurarse de que existen las categorías
        $categories = [
            ['category_id' => 1, 'category_name' => 'CPU'],
            ['category_id' => 2, 'category_name' => 'Motherboard'],
            ['category_id' => 3, 'category_name' => 'RAM'],
            ['category_id' => 4, 'category_name' => 'GPU'],
            ['category_id' => 5, 'category_name' => 'PSU'],
            ['category_id' => 6, 'category_name' => 'Storage'],
            ['category_id' => 7, 'category_name' => 'Case'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['category_id' => $category['category_id']],
                $category
            );
        }

        // Productos - CPUs
        $products = [
            // ===== CPUs =====
            [
                'category_id' => 1,
                'component_type' => 'cpu',
                'brand' => 'Intel',
                'model' => 'Core i5-13600K',
                'cpu' => '14 Núcleos, 20 Hilos',
                'ram' => 'DDR5',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Procesador Intel de 13va generación con excelente rendimiento',
                'socket' => 'LGA1700',
                'tdp' => 125,
                'cores' => 14,
                'threads' => 20,
                'base_clock' => 3.5,
                'turbo_clock' => 5.1,
                'base_price' => 320.00
            ],
            [
                'category_id' => 1,
                'component_type' => 'cpu',
                'brand' => 'AMD',
                'model' => 'Ryzen 7 7800X3D',
                'cpu' => '8 Núcleos, 16 Hilos, 3D V-Cache',
                'ram' => 'DDR5',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Procesador AMD con tecnología 3D V-Cache para gaming',
                'socket' => 'AM5',
                'tdp' => 120,
                'cores' => 8,
                'threads' => 16,
                'base_clock' => 4.2,
                'turbo_clock' => 5.0,
                'base_price' => 449.00
            ],
            [
                'category_id' => 1,
                'component_type' => 'cpu',
                'brand' => 'Intel',
                'model' => 'Core i9-13900K',
                'cpu' => '24 Núcleos, 32 Hilos',
                'ram' => 'DDR5',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Procesador tope de línea Intel para máximo rendimiento',
                'socket' => 'LGA1700',
                'tdp' => 253,
                'cores' => 24,
                'threads' => 32,
                'base_clock' => 3.0,
                'turbo_clock' => 5.8,
                'base_price' => 589.00
            ],
            [
                'category_id' => 1,
                'component_type' => 'cpu',
                'brand' => 'AMD',
                'model' => 'Ryzen 5 7600X',
                'cpu' => '6 Núcleos, 12 Hilos',
                'ram' => 'DDR5',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Procesador AMD de gama media con gran eficiencia',
                'socket' => 'AM5',
                'tdp' => 105,
                'cores' => 6,
                'threads' => 12,
                'base_clock' => 4.7,
                'turbo_clock' => 5.3,
                'base_price' => 249.00
            ],

            // ===== Motherboards =====
            [
                'category_id' => 2,
                'component_type' => 'motherboard',
                'brand' => 'ASUS',
                'model' => 'ROG STRIX Z790-E',
                'cpu' => 'Intel LGA1700',
                'ram' => 'DDR5',
                'storage' => 'Multiple M.2',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Placa base premium para procesadores Intel de 13va gen',
                'socket' => 'LGA1700',
                'ram_type' => 'ddr5',
                'max_ram' => 128,
                'ram_slots' => 4,
                'base_price' => 399.00
            ],
            [
                'category_id' => 2,
                'component_type' => 'motherboard',
                'brand' => 'MSI',
                'model' => 'MAG B650 TOMAHAWK',
                'cpu' => 'AMD AM5',
                'ram' => 'DDR5',
                'storage' => 'Multiple M.2',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Placa base de gran valor para procesadores AMD Ryzen 7000',
                'socket' => 'AM5',
                'ram_type' => 'ddr5',
                'max_ram' => 128,
                'ram_slots' => 4,
                'base_price' => 259.00
            ],
            [
                'category_id' => 2,
                'component_type' => 'motherboard',
                'brand' => 'Gigabyte',
                'model' => 'B760M DS3H',
                'cpu' => 'Intel LGA1700',
                'ram' => 'DDR5',
                'storage' => '2x M.2',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Placa base económica compatible con Intel 13va gen',
                'socket' => 'LGA1700',
                'ram_type' => 'ddr5',
                'max_ram' => 64,
                'ram_slots' => 4,
                'base_price' => 139.00
            ],

            // ===== RAM =====
            [
                'category_id' => 3,
                'component_type' => 'ram',
                'brand' => 'Corsair',
                'model' => 'Vengeance DDR5 32GB',
                'cpu' => 'N/A',
                'ram' => '32GB (2x16GB)',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Kit de memoria DDR5 de alto rendimiento',
                'memory_type' => 'ddr5',
                'capacity' => 32,
                'speed' => 6000,
                'base_price' => 149.00
            ],
            [
                'category_id' => 3,
                'component_type' => 'ram',
                'brand' => 'G.Skill',
                'model' => 'Trident Z5 RGB 32GB',
                'cpu' => 'N/A',
                'ram' => '32GB (2x16GB)',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Memoria DDR5 con RGB y excelente rendimiento',
                'memory_type' => 'ddr5',
                'capacity' => 32,
                'speed' => 6400,
                'base_price' => 169.00
            ],
            [
                'category_id' => 3,
                'component_type' => 'ram',
                'brand' => 'Kingston',
                'model' => 'Fury Beast DDR5 16GB',
                'cpu' => 'N/A',
                'ram' => '16GB (2x8GB)',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Memoria DDR5 económica pero confiable',
                'memory_type' => 'ddr5',
                'capacity' => 16,
                'speed' => 5200,
                'base_price' => 79.00
            ],
            [
                'category_id' => 3,
                'component_type' => 'ram',
                'brand' => 'Corsair',
                'model' => 'Vengeance DDR4 32GB',
                'cpu' => 'N/A',
                'ram' => '32GB (2x16GB)',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Kit de memoria DDR4 para sistemas anteriores',
                'memory_type' => 'ddr4',
                'capacity' => 32,
                'speed' => 3200,
                'base_price' => 89.00
            ],

            // ===== GPUs =====
            [
                'category_id' => 4,
                'component_type' => 'gpu',
                'brand' => 'NVIDIA',
                'model' => 'RTX 4070 Ti',
                'cpu' => 'N/A',
                'ram' => '12GB GDDR6X',
                'storage' => 'N/A',
                'display' => '3x DisplayPort, 1x HDMI',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Tarjeta gráfica de alto rendimiento para gaming y creación',
                'tdp' => 285,
                'vram' => 12,
                'base_price' => 799.00
            ],
            [
                'category_id' => 4,
                'component_type' => 'gpu',
                'brand' => 'AMD',
                'model' => 'RX 7900 XT',
                'cpu' => 'N/A',
                'ram' => '20GB GDDR6',
                'storage' => 'N/A',
                'display' => '2x DisplayPort, 2x HDMI',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'GPU AMD de última generación con gran memoria',
                'tdp' => 315,
                'vram' => 20,
                'base_price' => 849.00
            ],
            [
                'category_id' => 4,
                'component_type' => 'gpu',
                'brand' => 'NVIDIA',
                'model' => 'RTX 4060',
                'cpu' => 'N/A',
                'ram' => '8GB GDDR6',
                'storage' => 'N/A',
                'display' => '3x DisplayPort, 1x HDMI',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'GPU de gama media perfecta para 1080p',
                'tdp' => 115,
                'vram' => 8,
                'base_price' => 299.00
            ],

            // ===== PSUs =====
            [
                'category_id' => 5,
                'component_type' => 'psu',
                'brand' => 'Corsair',
                'model' => 'RM850x',
                'cpu' => 'N/A',
                'ram' => 'N/A',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Fuente modular de 850W con certificación 80+ Gold',
                'wattage' => 850,
                'efficiency' => '80+ Gold',
                'base_price' => 139.00
            ],
            [
                'category_id' => 5,
                'component_type' => 'psu',
                'brand' => 'EVGA',
                'model' => 'SuperNOVA 750 G6',
                'cpu' => 'N/A',
                'ram' => 'N/A',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Fuente compacta de 750W con gran eficiencia',
                'wattage' => 750,
                'efficiency' => '80+ Gold',
                'base_price' => 119.00
            ],
            [
                'category_id' => 5,
                'component_type' => 'psu',
                'brand' => 'Seasonic',
                'model' => 'FOCUS GX-650',
                'cpu' => 'N/A',
                'ram' => 'N/A',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Fuente confiable de 650W para sistemas eficientes',
                'wattage' => 650,
                'efficiency' => '80+ Gold',
                'base_price' => 99.00
            ],
            [
                'category_id' => 5,
                'component_type' => 'psu',
                'brand' => 'Thermaltake',
                'model' => 'Toughpower GF1 1000W',
                'cpu' => 'N/A',
                'ram' => 'N/A',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Fuente de alta potencia para sistemas entusiastas',
                'wattage' => 1000,
                'efficiency' => '80+ Gold',
                'base_price' => 189.00
            ],

            // ===== Storage =====
            [
                'category_id' => 6,
                'component_type' => 'storage',
                'brand' => 'Samsung',
                'model' => '990 PRO 1TB',
                'cpu' => 'N/A',
                'ram' => 'N/A',
                'storage' => '1TB NVMe',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'SSD NVMe PCIe 4.0 de alto rendimiento',
                'storage_type' => 'nvme',
                'storage_capacity' => 1000,
                'base_price' => 129.00
            ],
            [
                'category_id' => 6,
                'component_type' => 'storage',
                'brand' => 'WD',
                'model' => 'Black SN850X 2TB',
                'cpu' => 'N/A',
                'ram' => 'N/A',
                'storage' => '2TB NVMe',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'SSD NVMe con gran capacidad para gaming',
                'storage_type' => 'nvme',
                'storage_capacity' => 2000,
                'base_price' => 219.00
            ],

            // ===== Cases =====
            [
                'category_id' => 7,
                'component_type' => 'case',
                'brand' => 'NZXT',
                'model' => 'H510 Flow',
                'cpu' => 'N/A',
                'ram' => 'N/A',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Case ATX con excelente flujo de aire',
                'base_price' => 89.00
            ],
            [
                'category_id' => 7,
                'component_type' => 'case',
                'brand' => 'Corsair',
                'model' => '4000D Airflow',
                'cpu' => 'N/A',
                'ram' => 'N/A',
                'storage' => 'N/A',
                'display' => 'N/A',
                'image_url' => 'https://via.placeholder.com/150',
                'description' => 'Case mid-tower optimizado para enfriamiento',
                'base_price' => 104.00
            ],
        ];

        foreach ($products as $product) {
            DB::table('products')->insert($product);
        }

        echo "✓ Productos con datos de compatibilidad insertados correctamente\n";
    }
}

