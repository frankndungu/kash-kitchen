<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'supplier_code',
        'description',
        'contact_person',
        'phone',
        'email',
        'address',
        'city',
        'country',
        'tax_number',
        'payment_terms',
        'credit_limit',
        'supplier_type',
        'average_delivery_days',
        'reliability_rating',
        'notes',
        'is_active',
        'last_order_date',
    ];

    protected $casts = [
        'payment_terms' => 'array',
        'credit_limit' => 'decimal:2',
        'average_delivery_days' => 'decimal:2',
        'is_active' => 'boolean',
        'last_order_date' => 'date',
    ];

    // Relationships
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('supplier_type', $type);
    }

    // Helper methods
    public function getTotalOrders(): int
    {
        return $this->stockMovements()->where('movement_type', 'in')->count();
    }

    public function getTotalValue(): float
    {
        return $this->stockMovements()
                    ->where('movement_type', 'in')
                    ->sum('total_cost') ?? 0;
    }
}