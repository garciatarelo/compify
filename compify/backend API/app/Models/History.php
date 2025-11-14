<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    protected $table = 'histories';
    protected $primaryKey = 'history_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'price_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function price()
    {
        return $this->belongsTo(Price::class, 'price_id', 'price_id');
    }
}
