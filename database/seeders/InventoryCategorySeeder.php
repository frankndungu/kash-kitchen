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
                'name' => 'Proteins & Meat',
                'slug' => 'proteins-meat',
                'description' => 'Chicken, wings, beef, minced meat, sausages, smokies',
                'color' => '#DC2626', // Red
                'sort_order' => 1,
            ],
            [
                'name' => 'Vegetables & Fresh Produce',
                'slug' => 'vegetables-produce',
                'description' => 'Potatoes, onions, tomatoes, garlic, fresh vegetables',
                'color' => '#10B981', // Green
                'sort_order' => 2,
            ],
            [
                'name' => 'Flour & Bakery',
                'slug' => 'flour-bakery',
                'description' => 'Chapati flour, wheat flour, bread, burger buns, andazi flour',
                'color' => '#F59E0B', // Amber
                'sort_order' => 3,
            ],
            [
                'name' => 'Dairy & Eggs',
                'slug' => 'dairy-eggs',
                'description' => 'Milk, cheese, butter, eggs',
                'color' => '#3B82F6', // Blue
                'sort_order' => 4,
            ],
            [
                'name' => 'Cooking Essentials',
                'slug' => 'cooking-essentials',
                'description' => 'Cooking oil, salt, spices mix, black pepper',
                'color' => '#EF4444', // Red-Orange
                'sort_order' => 5,
            ],
            [
                'name' => 'Beverages & Drinks',
                'slug' => 'beverages-drinks',
                'description' => 'Soda bottles, Minute Maid, tea leaves, coffee beans, sugar',
                'color' => '#8B5CF6', // Purple
                'sort_order' => 6,
            ],
            [
                'name' => 'Fresh Fruits & Desserts',
                'slug' => 'fruits-desserts',
                'description' => 'Fresh fruits, ice cream, Oreo, ingredients for smoothies',
                'color' => '#EC4899', // Pink
                'sort_order' => 7,
            ],
            [
                'name' => 'Packaging & Supplies',
                'slug' => 'packaging-supplies',
                'description' => 'Take-away containers, bags, napkins, straws, receipt paper',
                'color' => '#6B7280', // Gray
                'sort_order' => 8,
            ],
        ];

        foreach ($categories as $category) {
            InventoryCategory::create($category);
        }
    }
}