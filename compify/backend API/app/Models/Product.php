<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    // Si tu PK no es "id"
    protected $primaryKey = 'product_id';

    protected $fillable = [
        'category_id',
        'brand',
        'model',
        'image_url',
        'description',
        'specs',
        'base_price'
    ];

    protected $hidden = [
        'component_type',
        'socket',
        'tdp',
        'cores',
        'threads',
        'base_clock',
        'turbo_clock',
        'ram_type',
        'max_ram',
        'ram_slots',
        'memory_type',
        'capacity',
        'speed',
        'vram',
        'wattage',
        'efficiency',
        'storage_type',
        'storage_capacity',
        'created_at',
        'updated_at',
    ];

    
    protected $casts = [
        'specs' => 'array',   // ← convierte el JSON a array automáticamente
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
}
