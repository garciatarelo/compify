<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compatibility extends Model
{
    protected $table = 'compatibilities';
    protected $primaryKey = 'com_id';
    public $timestamps = false;

    protected $fillable = [
        'product_id_1',
        'product_id_2',
        'is_comparable',
    ];

    public function product1()
    {
        return $this->belongsTo(Product::class, 'product_id_1', 'product_id');
    }

    public function product2()
    {
        return $this->belongsTo(Product::class, 'product_id_2', 'product_id');
    }
}
