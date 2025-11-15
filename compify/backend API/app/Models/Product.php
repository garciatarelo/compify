<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'product_id';
    public $timestamps = false;

    protected $fillable = [
        'category_id',
        'brand',
        'model',
        'cpu',
        'ram',
        'storage',
        'display',
        'image_url',
        'description',
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
        'base_price',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function prices()
    {
        return $this->hasMany(Price::class, 'product_id', 'product_id');
    }

    public function buildDetails()
    {
        return $this->hasMany(BuildDetail::class, 'product_id', 'product_id');
    }

    public function compatibilitiesAs1()
    {
        return $this->hasMany(Compatibility::class, 'product_id_1', 'product_id');
    }

    public function compatibilitiesAs2()
    {
        return $this->hasMany(Compatibility::class, 'product_id_2', 'product_id');
    }
}
