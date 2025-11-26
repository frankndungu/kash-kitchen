<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class InventoryCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'category_id');
    }

    public function activeInventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'category_id')
                    ->where('is_active', true);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Auto-generate slug
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    // Helper methods
    public function getTotalItems(): int
    {
        return $this->activeInventoryItems()->count();
    }

    public function getLowStockItems(): int
    {
        return $this->activeInventoryItems()
                    ->whereColumn('current_stock', '<=', 'minimum_stock')
                    ->where('track_stock', true)
                    ->count();
    }

    public function getTotalValue(): float
    {
        return $this->activeInventoryItems()
                    ->selectRaw('SUM(current_stock * unit_cost) as total_value')
                    ->value('total_value') ?? 0;
    }
}