<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PcBuildItem extends Model
{
    protected $table = 'pc_build_items';
    protected $primaryKey = 'item_id';
    public $timestamps = true;

    protected $fillable = [
        'build_id',
        'product_id',
        'quantity',
        'price_at_purchase',
    ];

    /**
     * Get the pc build that owns the item.
     */
    public function pcBuild()
    {
        return $this->belongsTo(PcBuild::class, 'build_id', 'build_id');
    }

    /**
     * Get the product that owns the item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
