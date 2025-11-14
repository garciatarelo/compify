<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class favoriteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('favorites')->insert([
            [
                'favorite_id' => 1,
                'user_id' => 1,
                'category_id' => 1,
                'reference' => 1,
                'saved_at' => now(),
            ],
            [
                'favorite_id' => 2,
                'user_id' => 2,
                'category_id' => 2,
                'reference' => 2,
                'saved_at' => now(),
            ],
        ]);
    }
}
