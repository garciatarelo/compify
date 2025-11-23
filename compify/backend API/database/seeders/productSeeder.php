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
        DB::table('product_groups')->insert([
            [
                'id' => 1,
                'name' => 'Grupo Dell',
                'image_url' => 'https://example.com/images/dell_xps15_9530.jpg',
            ],
            [
                'id' => 2,
                'name' => 'Grupo Apple',
                'image_url' => 'https://example.com/images/macbook_pro_16_m1_max.jpg',
            ]
        ]);
        DB::table('products')->insert([
            [
                'product_id' => 1,
                'category_id' => 1,
                'product_group_id' => 1,
                'brand' => 'Dell',
                'model' => 'XPS 15 9530',
                'image_url' => 'https://example.com/images/dell_xps15_9530.jpg',
                'description' => 'Laptop Dell chida',
                'specs' => json_encode([
                    'cpu' => 'Intel Core i7-12700H',
                    'ram' => '16GB DDR4',
                    'storage' => '512GB SSD',
                    'graphics' => 'NVIDIA GeForce RTX 3050 Ti',
                    'display' => '15.6" FHD+ (1920 x 1200)',
                ]),
            ],
            [
                'product_id' => 2,
                'category_id' => 1,
                'product_group_id' => 2,
                'brand' => 'Apple',
                'model' => 'MacBook Pro 16-inch M1 Max',
                'image_url' => 'https://example.com/images/macbook_pro_16_m1_max.jpg',
                'description' => 'Laptop Apple chida',
                'specs' => json_encode([
                    'cpu' => 'Apple M1 Max',
                    'ram' => '32GB Unified Memory',
                    'storage' => '1TB SSD',
                    'graphics' => 'Integrated 32-core GPU',
                    'display' => '16-inch Retina Display (3456 x 2234)',
                ]),
            ],
            [
                'product_id' => 3,
                'category_id' => 2,
                'product_group_id' => null,
                'brand' => 'AMD',
                'model' => 'Ryzen 9 7950X',
                'image_url' => 'https://example.com/images/amd_ryzen9_7950x.jpg',
                'description' => 'Procesador AMD chido',
                'specs' => json_encode([
                    'cores' => 16,
                    'threads' => 32,
                    'base_clock' => '4.5 GHz',
                    'boost_clock' => '5.7 GHz',
                    'tdp' => '170W',
                ]),
            ],
        ]);
    }
}
