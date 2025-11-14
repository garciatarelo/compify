<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PcBuild extends Model
{
    protected $table = 'pc_builds';
    protected $primaryKey = 'build_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'build_name',
        'total_price',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function buildDetails()
    {
        return $this->hasMany(BuildDetail::class, 'build_id', 'build_id');
    }
}
