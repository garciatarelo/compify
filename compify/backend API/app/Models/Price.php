<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Price extends Model
{
    protected $table = 'prices';
    protected $primaryKey = 'price_id';
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'store_id',
        'price',
        'product_url',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id', 'store_id');
    }

    public function histories()
    {
        return $this->hasMany(History::class, 'price_id', 'price_id');
    }
}
