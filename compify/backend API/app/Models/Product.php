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
        'base_price',
        // Campos específicos que el usuario quiere llenar
        'ram_type',
        'capacity',
        'storage_type',
        'storage_capacity',
        'component_type',
        'socket',
        'tdp',
        'cores',
        'threads',
        'base_clock',
        'turbo_clock',
        'max_ram',
        'ram_slots',
        'memory_type',
        'speed',
        'vram',
        'wattage',
        'efficiency',
    ];

    protected $hidden = [
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

    public function prices()
    {
        return $this->hasMany(Price::class, 'product_id', 'product_id');
    }
}
