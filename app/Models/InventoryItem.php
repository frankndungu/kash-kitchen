<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'description',
        'category_id',
        'supplier_id',
        'current_stock',
        'minimum_stock',
        'maximum_stock',
        'unit_of_measure',
        'unit_cost',
        'selling_price',
        'is_active',
        'track_stock',
        'last_restocked',
        'storage_requirements',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'current_stock' => 'decimal:2',
        'minimum_stock' => 'decimal:2',
        'maximum_stock' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_active' => 'boolean',
        'track_stock' => 'boolean',
        'last_restocked' => 'date',
        'storage_requirements' => 'array',
    ];

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function menuItemIngredients(): HasMany
    {
        return $this->hasMany(MenuItemIngredient::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'minimum_stock')
                    ->where('track_stock', true)
                    ->where('is_active', true);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('current_stock', '<=', 0)
                    ->where('track_stock', true)
                    ->where('is_active', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    // Business Logic Methods
    public function isLowStock(): bool
    {
        return $this->track_stock && $this->current_stock <= $this->minimum_stock;
    }

    public function isOutOfStock(): bool
    {
        return $this->track_stock && $this->current_stock <= 0;
    }

    public function getStockPercentage(): float
    {
        if (!$this->maximum_stock || $this->maximum_stock <= 0) {
            return 0;
        }
        
        return ($this->current_stock / $this->maximum_stock) * 100;
    }

    public function getStockValue(): float
    {
        return $this->current_stock * $this->unit_cost;
    }

    /**
     * Add stock to inventory (Stock In)
     */
    public function addStock(float $quantity, array $options = []): StockMovement
    {
        $previousStock = $this->current_stock;
        $this->increment('current_stock', $quantity);
        $this->refresh();
        
        return $this->stockMovements()->create([
            'movement_type' => 'in',
            'quantity' => $quantity,
            'unit_cost' => $options['unit_cost'] ?? $this->unit_cost,
            'total_cost' => $quantity * ($options['unit_cost'] ?? $this->unit_cost),
            'previous_stock' => $previousStock,
            'new_stock' => $this->current_stock,
            'supplier_id' => $options['supplier_id'] ?? $this->supplier_id,
            'reason' => $options['reason'] ?? 'purchase',
            'notes' => $options['notes'] ?? null,
            'reference_type' => $options['reference_type'] ?? null,
            'reference_id' => $options['reference_id'] ?? null,
            'batch_number' => $options['batch_number'] ?? null,
            'expiry_date' => $options['expiry_date'] ?? null,
            'created_by' => $options['created_by'] ?? auth()->id(),
            'movement_date' => $options['movement_date'] ?? now(),
        ]);
    }

    /**
     * Remove stock from inventory (Stock Out)
     * Used for sales, consumption, or general usage
     */
    public function removeStock(float $quantity, array $options = []): StockMovement
    {
        $previousStock = $this->current_stock;
        $this->decrement('current_stock', $quantity);
        $this->refresh();
        
        return $this->stockMovements()->create([
            'movement_type' => 'out',
            'quantity' => $quantity,
            'unit_cost' => $this->unit_cost,
            'total_cost' => $quantity * $this->unit_cost,
            'previous_stock' => $previousStock,
            'new_stock' => $this->current_stock,
            'reason' => $options['reason'] ?? 'usage',
            'notes' => $options['notes'] ?? null,
            'reference_type' => $options['reference_type'] ?? null,
            'reference_id' => $options['reference_id'] ?? null,
            'created_by' => $options['created_by'] ?? auth()->id(),
            'movement_date' => $options['movement_date'] ?? now(),
        ]);
    }

    /**
     * Adjust stock to a specific quantity
     * Properly records as 'in' or 'out' based on whether stock increased or decreased
     */
    public function adjustStock(float $newQuantity, array $options = []): StockMovement
    {
        $previousStock = $this->current_stock;
        $difference = $newQuantity - $previousStock;
        
        // Determine movement type based on whether stock increased or decreased
        if ($difference > 0) {
            // Stock increased (adjustment up)
            $movementType = 'in';
        } elseif ($difference < 0) {
            // Stock decreased (adjustment down)
            $movementType = 'out';
        } else {
            // No change - still record it as adjustment for audit trail
            $movementType = 'adjustment';
        }
        
        $this->update(['current_stock' => $newQuantity]);
        $this->refresh();
        
        return $this->stockMovements()->create([
            'movement_type' => $movementType,
            'quantity' => abs($difference),
            'unit_cost' => $this->unit_cost,
            'total_cost' => abs($difference) * $this->unit_cost,
            'previous_stock' => $previousStock,
            'new_stock' => $newQuantity,
            'reason' => $options['reason'] ?? 'manual_adjustment',
            'notes' => $options['notes'] ?? 'Stock level adjusted manually',
            'created_by' => $options['created_by'] ?? auth()->id(),
            'movement_date' => $options['movement_date'] ?? now(),
        ]);
    }

    // Generate SKU if not provided
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($item) {
            if (empty($item->sku)) {
                $item->sku = static::generateSKU($item->name, $item->category_id);
            }
        });
    }

    private static function generateSKU(string $name, int $categoryId): string
    {
        $category = InventoryCategory::find($categoryId);
        $prefix = $category ? strtoupper(substr($category->slug, 0, 3)) : 'INV';
        $nameCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 3));
        $sequence = str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
        
        return $prefix . '-' . $nameCode . '-' . $sequence;
    }
}