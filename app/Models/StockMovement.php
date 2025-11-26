<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'movement_type',
        'quantity',
        'unit_cost',
        'total_cost',
        'previous_stock',
        'new_stock',
        'reference_type',
        'reference_id',
        'batch_number',
        'expiry_date',
        'reason',
        'notes',
        'supplier_id',
        'created_by',
        'movement_date',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'previous_stock' => 'decimal:2',
        'new_stock' => 'decimal:2',
        'expiry_date' => 'date',
        'movement_date' => 'datetime',
    ];

    // Relationships
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeIncoming($query)
    {
        return $query->where('movement_type', 'in');
    }

    public function scopeOutgoing($query)
    {
        return $query->where('movement_type', 'out');
    }

    public function scopeAdjustments($query)
    {
        return $query->where('movement_type', 'adjustment');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('movement_date', [$startDate, $endDate]);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('movement_date', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('movement_date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('movement_date', [
            now()->startOfMonth(),
            now()->endOfMonth()
        ]);
    }

    // Helper methods
    public function isIncoming(): bool
    {
        return $this->movement_type === 'in';
    }

    public function isOutgoing(): bool
    {
        return $this->movement_type === 'out';
    }

    public function isAdjustment(): bool
    {
        return $this->movement_type === 'adjustment';
    }

    public function getMovementTypeDisplayAttribute(): string
    {
        return match($this->movement_type) {
            'in' => 'Stock In',
            'out' => 'Stock Out',
            'adjustment' => 'Adjustment',
            'transfer' => 'Transfer',
            'waste' => 'Waste',
            default => ucfirst($this->movement_type)
        };
    }

    public function getMovementColorAttribute(): string
    {
        return match($this->movement_type) {
            'in' => 'green',
            'out' => 'red',
            'adjustment' => 'blue',
            'transfer' => 'yellow',
            'waste' => 'gray',
            default => 'gray'
        };
    }
}