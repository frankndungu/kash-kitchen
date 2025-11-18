<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'cost_price',
        'sku',
        'is_available',
        'is_combo',
        'combo_items',
        'requires_kitchen',
        'preparation_time_minutes',
        'image_url',
        'sort_order',
        'allergens',
        'special_instructions'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_combo' => 'boolean',
        'requires_kitchen' => 'boolean',
        'combo_items' => 'array',
        'allergens' => 'array'
    ];

    // Automatically generate slug
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($menuItem) {
            if (empty($menuItem->slug)) {
                $menuItem->slug = Str::slug($menuItem->name);
            }
        });
    }

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class)
                    ->withPivot('quantity_required')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeCombo($query)
    {
        return $query->where('is_combo', true);
    }

    public function scopeInCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    // Helper methods
    public function getProfitAttribute()
    {
        if (!$this->cost_price) return null;
        return $this->price - $this->cost_price;
    }

    public function getProfitMarginAttribute()
    {
        if (!$this->cost_price || $this->price == 0) return null;
        return (($this->price - $this->cost_price) / $this->price) * 100;
    }

    public function isLowProfit($threshold = 20)
    {
        return $this->profit_margin !== null && $this->profit_margin < $threshold;
    }
}