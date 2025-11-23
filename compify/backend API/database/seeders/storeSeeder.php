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
        $stores = [
            [
                'name_store' => 'Amazon',
                'base_url' => 'https://www.amazon.com',
            ],
            [
                'name_store' => 'MercadoLibre',
                'base_url' => 'https://www.mercadolibre.com',
            ],
        ];

        foreach ($stores as $store) {
            DB::table('stores')->updateOrInsert(
                ['name_store' => $store['name_store']],
                array_merge($store, [
                    'created_at' => now(),
                    'updated_at' => now()
                ])
            );
        }
    }
}
