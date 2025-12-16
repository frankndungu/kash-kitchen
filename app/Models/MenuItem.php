<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'slug',
        'sku',
        'price',
        'cost_price',
        'is_available',
        'is_combo',
        'preparation_time_minutes',
        'allergens',
        'special_instructions',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_combo' => 'boolean',
        'allergens' => 'array',
        'preparation_time_minutes' => 'integer',
    ];

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeOrderBySort($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Accessors
    public function getProfitAttribute()
    {
        if (!$this->cost_price) {
            return null;
        }
        
        return $this->price - $this->cost_price;
    }

    public function getProfitMarginAttribute()
    {
        if (!$this->cost_price || $this->price <= 0) {
            return null;
        }
        
        return (($this->price - $this->cost_price) / $this->price) * 100;
    }

    public function getFormattedPriceAttribute()
    {
        return 'KES ' . number_format($this->price, 2);
    }

    public function getFormattedCostPriceAttribute()
    {
        return $this->cost_price ? 'KES ' . number_format($this->cost_price, 2) : null;
    }

    public function getPreparationTimeFormattedAttribute()
    {
        $minutes = $this->preparation_time_minutes;
        if ($minutes >= 60) {
            $hours = floor($minutes / 60);
            $remainingMinutes = $minutes % 60;
            return $hours . 'h' . ($remainingMinutes > 0 ? ' ' . $remainingMinutes . 'm' : '');
        }
        return $minutes . ' min';
    }

    // Business Logic Methods
    public function canBeOrdered(): bool
    {
        return $this->is_available;
    }

    public function markAsUnavailable(): bool
    {
        return $this->update(['is_available' => false]);
    }

    public function markAsAvailable(): bool
    {
        return $this->update(['is_available' => true]);
    }

    public function hasAllergen(string $allergen): bool
    {
        return $this->allergens && in_array($allergen, $this->allergens);
    }

    public function getAllergensAsString(): string
    {
        return $this->allergens ? implode(', ', $this->allergens) : 'None';
    }

    /**
     * Get the ingredients used by this menu item
     */
    public function ingredients(): HasMany
    {
        return $this->hasMany(MenuItemIngredient::class);
    }

    /**
     * Deduct ingredients from inventory when this menu item is sold
     */
    public function deductFromInventory(int $quantity = 1): array
    {
        $deductions = [];
        
        foreach ($this->ingredients as $ingredient) {
            $inventoryItem = $ingredient->inventoryItem;
            $quantityToDeduct = $ingredient->quantity_used * $quantity;
            
            // Check if we have enough stock
            if ($inventoryItem->current_stock >= $quantityToDeduct) {
                // Deduct from inventory
                $inventoryItem->decrement('current_stock', $quantityToDeduct);
                
                $deductions[] = [
                    'inventory_item' => $inventoryItem->name,
                    'quantity_deducted' => $quantityToDeduct,
                    'unit' => $ingredient->unit,
                    'remaining_stock' => $inventoryItem->fresh()->current_stock,
                ];
            } else {
                // Log insufficient stock
                $deductions[] = [
                    'inventory_item' => $inventoryItem->name,
                    'quantity_deducted' => 0,
                    'unit' => $ingredient->unit,
                    'error' => 'Insufficient stock',
                    'required' => $quantityToDeduct,
                    'available' => $inventoryItem->current_stock,
                ];
            }
        }
        
        return $deductions;
    }
}