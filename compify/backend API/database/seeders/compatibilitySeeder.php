<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class compatibilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('compatibilities')->insert([
            [
                'com_id' => 1,
                'product_id_1' => 1,
                'product_id_2' => 2,
                'is_comparable' => 0,
            ],
            [
                'com_id' => 2,
                'product_id_1' => 2,
                'product_id_2' => 1,
                'is_comparable' => 0,
            ],
        ]);
    }
}
