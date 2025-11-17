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
                'component_id_1' => 1,
                'component_id_2' => 2,
                'is_compatible' => true,
            ],
            [
                'component_id_1' => 1,
                'component_id_2' => 3,
                'is_compatible' => false,
            ],
        ]);
    }
}
