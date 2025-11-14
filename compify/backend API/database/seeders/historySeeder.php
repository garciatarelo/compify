<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class historySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('histories')->insert([
            [
                'history_id' => 1,
                'user_id' => 1,
                'price_id' => 1,
            ],
            [
                'history_id' => 2,
                'user_id' => 2,
                'price_id' => 2,
            ],
        ]);
    }
}
