<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class storeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('stores')->insert([
            [
                'store_id' => 1,
                'name_store' => 'Amazon',
                'base_url' => 'https://www.amazon.com',
            ],
            [
                'store_id' => 2,
                'name_store' => 'MercadoLibre',
                'base_url' => 'https://www.mercadolibre.com',
            ],
        ]);
    }
}
