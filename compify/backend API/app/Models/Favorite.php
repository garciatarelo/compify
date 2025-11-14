<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $table = 'favorites';
    protected $primaryKey = 'favorite_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'category_id',
        'reference',
        'saved_at',
    ];

    protected $casts = [
        'saved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
}
