<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class pc_buildSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('pc_builds')->insert([
            [
                'build_id' => 1,
                'user_id' => 1,
                'build_name' => 'PC Gaming Alta Gama',
                'total_price' => 1599.98,
            ],
            [
                'build_id' => 2,
                'user_id' => 2,
                'build_name' => 'Workstation Profesional',
                'total_price' => 2199.99,
            ],
        ]);
    }
}
