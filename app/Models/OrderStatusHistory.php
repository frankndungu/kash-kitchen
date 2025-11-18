<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'old_status',
        'new_status',
        'notes',
        'user_id',
        'changed_at'
    ];

    protected $casts = [
        'changed_at' => 'datetime'
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeForOrder($query, $orderId)
    {
        return $query->where('order_id', $orderId)->orderBy('changed_at', 'desc');
    }
}