<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'category_id';
    public $timestamps = false;

    protected $fillable = [
        'category_name',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'category_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'category_id', 'category_id');
    }
}
