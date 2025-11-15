<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LaptopsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear categoría Laptops si no existe
        $laptopCategory = DB::table('categories')->updateOrInsert(
            ['category_name' => 'Laptops'],
            ['category_id' => 8]
        );

        $categoryId = DB::table('categories')->where('category_name', 'Laptops')->value('category_id');

        // Crear tiendas si no existen
        $stores = [
            ['name_store' => 'Amazon', 'base_url' => 'https://amazon.com'],
            ['name_store' => 'Best Buy', 'base_url' => 'https://bestbuy.com'],
            ['name_store' => 'Newegg', 'base_url' => 'https://newegg.com'],
        ];

        foreach ($stores as $store) {
            DB::table('stores')->updateOrInsert(
                ['name_store' => $store['name_store']],
                $store
            );
        }

        // Laptops de ejemplo
        $laptops = [
            [
                'brand' => 'Dell',
                'model' => 'XPS 15 9530',
                'cpu' => 'Intel Core i7-13700H',
                'ram' => '16GB DDR5',
                'storage' => '512GB SSD',
                'display' => '15.6" FHD+',
                'description' => 'Potente laptop para profesionales con pantalla InfinityEdge',
                'image_url' => 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
                'prices' => [
                    ['store' => 'Amazon', 'price' => 1299.99],
                    ['store' => 'Best Buy', 'price' => 1349.99],
                ]
            ],
            [
                'brand' => 'HP',
                'model' => 'Pavilion 14',
                'cpu' => 'AMD Ryzen 5 7530U',
                'ram' => '8GB DDR4',
                'storage' => '256GB SSD',
                'display' => '14" FHD',
                'description' => 'Laptop compacta ideal para estudiantes y trabajo remoto',
                'image_url' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                'prices' => [
                    ['store' => 'Amazon', 'price' => 649.99],
                    ['store' => 'Best Buy', 'price' => 679.99],
                ]
            ],
            [
                'brand' => 'Lenovo',
                'model' => 'ThinkPad X1 Carbon Gen 11',
                'cpu' => 'Intel Core i5-1335U',
                'ram' => '16GB LPDDR5',
                'storage' => '512GB SSD',
                'display' => '14" WUXGA',
                'description' => 'Ultraligera y duradera, perfecta para ejecutivos',
                'image_url' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
                'prices' => [
                    ['store' => 'Amazon', 'price' => 1199.99],
                    ['store' => 'Newegg', 'price' => 1249.99],
                ]
            ],
            [
                'brand' => 'ASUS',
                'model' => 'ROG Zephyrus G14',
                'cpu' => 'AMD Ryzen 9 7940HS',
                'ram' => '32GB DDR5',
                'storage' => '1TB SSD',
                'display' => '14" QHD',
                'description' => 'Gaming laptop compacta con gran potencia',
                'image_url' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
                'prices' => [
                    ['store' => 'Amazon', 'price' => 1799.99],
                    ['store' => 'Best Buy', 'price' => 1849.99],
                    ['store' => 'Newegg', 'price' => 1829.99],
                ]
            ],
            [
                'brand' => 'Apple',
                'model' => 'MacBook Pro 14"',
                'cpu' => 'Apple M3 Pro',
                'ram' => '18GB',
                'storage' => '512GB SSD',
                'display' => '14.2" Liquid Retina XDR',
                'description' => 'MacBook Pro con chip M3 Pro para creativos profesionales',
                'image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
                'prices' => [
                    ['store' => 'Amazon', 'price' => 1999.99],
                    ['store' => 'Best Buy', 'price' => 1999.99],
                ]
            ],
            [
                'brand' => 'Acer',
                'model' => 'Aspire 5',
                'cpu' => 'Intel Core i3-1215U',
                'ram' => '8GB DDR4',
                'storage' => '256GB SSD',
                'display' => '15.6" FHD',
                'description' => 'Laptop económica para uso diario y tareas básicas',
                'image_url' => 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400',
                'prices' => [
                    ['store' => 'Amazon', 'price' => 449.99],
                    ['store' => 'Best Buy', 'price' => 479.99],
                ]
            ],
            [
                'brand' => 'MSI',
                'model' => 'GF63 Thin',
                'cpu' => 'Intel Core i5-12450H',
                'ram' => '16GB DDR4',
                'storage' => '512GB SSD',
                'display' => '15.6" FHD 144Hz',
                'description' => 'Gaming laptop asequible con pantalla de 144Hz',
                'image_url' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
                'prices' => [
                    ['store' => 'Amazon', 'price' => 799.99],
                    ['store' => 'Newegg', 'price' => 779.99],
                ]
            ],
            [
                'brand' => 'Samsung',
                'model' => 'Galaxy Book3 Pro',
                'cpu' => 'Intel Core i7-1355U',
                'ram' => '16GB LPDDR5',
                'storage' => '512GB SSD',
                'display' => '15.6" AMOLED',
                'description' => 'Ultraligera con pantalla AMOLED vibrante',
                'image_url' => 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
                'prices' => [
                    ['store' => 'Amazon', 'price' => 949.99],
                    ['store' => 'Best Buy', 'price' => 999.99],
                ]
            ],
        ];

        // Insertar laptops y precios
        foreach ($laptops as $laptopData) {
            $prices = $laptopData['prices'];
            unset($laptopData['prices']);

            // Insertar laptop
            $productId = DB::table('products')->insertGetId([
                'category_id' => $categoryId,
                'brand' => $laptopData['brand'],
                'model' => $laptopData['model'],
                'cpu' => $laptopData['cpu'],
                'ram' => $laptopData['ram'],
                'storage' => $laptopData['storage'],
                'display' => $laptopData['display'],
                'image_url' => $laptopData['image_url'],
                'description' => $laptopData['description'],
            ]);

            // Insertar precios
            foreach ($prices as $priceData) {
                $storeId = DB::table('stores')
                    ->where('name_store', $priceData['store'])
                    ->value('store_id');

                if ($storeId) {
                    DB::table('prices')->insert([
                        'product_id' => $productId,
                        'store_id' => $storeId,
                        'price' => $priceData['price'],
                        'product_url' => '',
                    ]);
                }
            }
        }

        echo "✓ Insertadas 8 laptops con sus precios en múltiples tiendas\n";
    }
}
