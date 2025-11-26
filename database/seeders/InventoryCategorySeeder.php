<?php

namespace Database\Seeders;

use App\Models\InventoryCategory;
use Illuminate\Database\Seeder;

class InventoryCategorySeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Raw Ingredients',
                'slug' => 'raw-ingredients',
                'description' => 'Basic cooking ingredients like flour, spices, vegetables',
                'color' => '#10B981', // Green
                'sort_order' => 1,
            ],
            [
                'name' => 'Proteins',
                'slug' => 'proteins',
                'description' => 'Meat, chicken, fish, eggs, and other protein sources',
                'color' => '#DC2626', // Red
                'sort_order' => 2,
            ],
            [
                'name' => 'Dairy Products',
                'slug' => 'dairy-products', 
                'description' => 'Milk, cheese, butter, cream, and dairy products',
                'color' => '#3B82F6', // Blue
                'sort_order' => 3,
            ],
            [
                'name' => 'Beverages',
                'slug' => 'beverages',
                'description' => 'Soft drinks, juices, water, and beverage supplies',
                'color' => '#8B5CF6', // Purple
                'sort_order' => 4,
            ],
            [
                'name' => 'Packaging',
                'slug' => 'packaging',
                'description' => 'Take-away containers, bags, napkins, straws',
                'color' => '#F59E0B', // Amber
                'sort_order' => 5,
            ],
            [
                'name' => 'Cooking Oil & Fats',
                'slug' => 'cooking-oil-fats',
                'description' => 'Cooking oils, margarine, and fats for food preparation',
                'color' => '#EF4444', // Red
                'sort_order' => 6,
            ],
            [
                'name' => 'Snacks & Confectionery',
                'slug' => 'snacks-confectionery',
                'description' => 'Ready-to-sell snacks, sweets, and confectionery items',
                'color' => '#EC4899', // Pink
                'sort_order' => 7,
            ],
            [
                'name' => 'Cleaning Supplies',
                'slug' => 'cleaning-supplies',
                'description' => 'Detergents, sanitizers, cleaning equipment',
                'color' => '#6B7280', // Gray
                'sort_order' => 8,
            ],
        ];

        foreach ($categories as $category) {
            InventoryCategory::create($category);
        }
    }
}