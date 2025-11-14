<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class categorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categories')->insert([
            [
                'category_id' => 1,
                'category_name' => 'Laptops',
            ],
            [
                'category_id' => 2,
                'category_name' => 'Componentes de PC',
            ],
        ]);
    }
}
