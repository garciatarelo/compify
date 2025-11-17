<?php

namespace Database\Seeders;

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
                'build_name' => 'Gaming Beast',
                'total_price' => 1500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'build_id' => 2,
                'user_id' => 2,
                'build_name' => 'Office Workstation',
                'total_price' => 800.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
        ]);
    }
}
