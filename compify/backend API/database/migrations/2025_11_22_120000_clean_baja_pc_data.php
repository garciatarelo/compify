<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Product;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //A la basura
        $products = Product::whereHas('prices.store', function ($query) {
            $query->where('name_store', 'BajaPC');
        })
        ->where(function ($query) {
            $query->where('description', 'LIKE', '%PC %')
                  ->orWhere('description', 'LIKE', '% PC%')
                  ->orWhere('description', '=', 'PC')
                  ->orWhere('description', 'LIKE', '%Computadora%');
        })
        ->where('component_type', '!=', 'case')
        ->get();

        foreach ($products as $product) {
            $product->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot restore deleted data
    }
};
