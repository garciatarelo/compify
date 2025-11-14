<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class build_detailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('build_details')->insert([
            [
                'detail_id' => 1,
                'build_id' => 1,
                'product_id' => 1,
            ],
            [
                'detail_id' => 2,
                'build_id' => 1,
                'product_id' => 2,
            ],
        ]);
    }
}
