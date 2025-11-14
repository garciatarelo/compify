<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class priceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('prices')->insert([
            [
                'price_id' => 1,
                'product_id' => 1,
                'store_id' => 1,
                'price' => 1499.99,
                'product_url' => 'https://www.amazon.com/dell-xps-15-9530',
            ],
            [
                'price_id' => 2,
                'product_id' => 2,
                'store_id' => 2,
                'price' => 799.99,
                'product_url' => 'https://www.newegg.com/nvidia-rtx-4070-ti',
            ],
        ]);
    }
}
