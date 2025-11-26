<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItemIngredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_item_id',
        'inventory_item_id',
        'quantity_needed',
        'unit_of_measure',
        'cost_per_serving',
        'preparation_notes',
        'is_critical',
        'is_active',
    ];

    protected $casts = [
        'quantity_needed' => 'decimal:3',
        'cost_per_serving' => 'decimal:2',
        'is_critical' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCritical($query)
    {
        return $query->where('is_critical', true);
    }

    // Helper methods
    public function canMake(int $portions = 1): bool
    {
        $requiredQuantity = $this->quantity_needed * $portions;
        return $this->inventoryItem->current_stock >= $requiredQuantity;
    }

    public function getMaxPortions(): int
    {
        if ($this->quantity_needed <= 0) {
            return 0;
        }
        
        return floor($this->inventoryItem->current_stock / $this->quantity_needed);
    }
}