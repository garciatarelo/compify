<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class pc_build_itemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('pc_build_items')->insert([
            // Gaming Beast (build_id = 1)
            [
                'item_id' => 1,
                'build_id' => 1,
                'product_id' => 1,
                'quantity' => 1,
                'price_at_purchase' => 299.99
            ],
            // Office Workstation (build_id = 2)
            [
                'item_id' => 2,
                'build_id' => 2,
                'product_id' => 2,
                'quantity' => 1,
                'price_at_purchase' => 499.99
            ],
        ]);
    }
}
