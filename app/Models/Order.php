<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'order_type',
        'customer_name',
        'customer_phone',
        'table_number',
        'delivery_address',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'payment_method',
        'payment_status',
        'mpesa_reference',
        'order_status',
        'confirmed_at',
        'ready_at',
        'completed_at',
        'estimated_minutes',
        'kitchen_notes',
        'customer_notes',
        'cancellation_reason',
        'created_by_user_id',
        'updated_by_user_id'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'ready_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    // Automatically generate order number
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'K' . str_pad(
                    (static::max('id') ?? 0) + 1, 
                    4, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    // Relationships
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNotIn('order_status', ['completed', 'cancelled']);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('order_status', $status);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('order_type', $type);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeKitchenOrders($query)
    {
        return $query->whereIn('order_status', ['confirmed', 'preparing'])
                    ->whereHas('items.menuItem', function($q) {
                        $q->where('requires_kitchen', true);
                    });
    }

    // Helper methods
    public function calculateTotals()
    {
        $this->subtotal = $this->items->sum('item_total');
        $this->tax_amount = $this->subtotal * 0.16; // 16% VAT
        $this->total_amount = $this->subtotal + $this->tax_amount - $this->discount_amount;
        $this->save();
    }

    public function updateStatus($newStatus, $userId, $notes = null)
    {
        $oldStatus = $this->order_status;
        
        $this->update([
            'order_status' => $newStatus,
            'updated_by_user_id' => $userId,
            $this->getStatusTimestampField($newStatus) => now()
        ]);

        // Log status change
        $this->statusHistory()->create([
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'user_id' => $userId,
            'notes' => $notes
        ]);
    }

    private function getStatusTimestampField($status)
    {
        return match($status) {
            'confirmed' => 'confirmed_at',
            'ready' => 'ready_at',
            'completed' => 'completed_at',
            default => null
        };
    }

    public function requiresKitchen()
    {
        return $this->items->some(function ($item) {
            return $item->menuItem->requires_kitchen;
        });
    }
}