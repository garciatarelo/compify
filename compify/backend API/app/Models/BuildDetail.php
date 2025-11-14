<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuildDetail extends Model
{
    protected $table = 'build_details';
    protected $primaryKey = 'detail_id';
    public $timestamps = false;

    protected $fillable = [
        'build_id',
        'product_id',
    ];

    public function pcBuild()
    {
        return $this->belongsTo(PcBuild::class, 'build_id', 'build_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
