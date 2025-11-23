<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuarios primero
        \Illuminate\Support\Facades\DB::table('users')->insert([
            [
                'user_id' => 1,
                'name' => 'Administrador',
                'lastname_p' => '',
                'lastname_m' => '',
                'username' => 'admin',
                'email' => 'admin@gmail.com',
                'password' => bcrypt('password'),
                'user_type' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'name' => 'María',
                'lastname_p' => 'López',
                'lastname_m' => 'Martínez',
                'username' => 'marialopez',
                'email' => 'maria@gmail.com',
                'password' => bcrypt('password'),
                'user_type' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->call([
            categorySeeder::class,
            storeSeeder::class,
            productSeeder::class,
            priceSeeder::class,
            pc_buildSeeder::class,
            pc_build_itemSeeder::class,
            favoriteSeeder::class,
            historySeeder::class,
            compatibilitySeeder::class,
            LaptopsSeeder::class,
        ]);
    }
}
