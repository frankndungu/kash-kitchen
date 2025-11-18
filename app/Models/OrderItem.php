<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'menu_item_id',
        'quantity',
        'unit_price',
        'item_total',
        'special_instructions',
        'status',
        'started_at',
        'ready_at'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'item_total' => 'decimal:2',
        'started_at' => 'datetime',
        'ready_at' => 'datetime'
    ];

    // Automatically calculate item total
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($orderItem) {
            $orderItem->item_total = $orderItem->quantity * $orderItem->unit_price;
        });

        static::updating(function ($orderItem) {
            $orderItem->item_total = $orderItem->quantity * $orderItem->unit_price;
        });
    }

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePreparing($query)
    {
        return $query->where('status', 'preparing');
    }
}