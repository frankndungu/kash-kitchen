<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
        public function run(): void
    {
        $categories = [
            [
                'name' => 'Chips Corner',
                'slug' => 'chips-corner',
                'description' => 'Various types of chips and potato preparations',
                'color' => '#f59e0b',
                'icon' => '🍟',
                'sort_order' => 1,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Fried Chicken',
                'slug' => 'fried-chicken',
                'description' => 'Fresh chicken portions cooked to perfection',
                'color' => '#dc2626',
                'icon' => '🍗',
                'sort_order' => 2,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Wings & Lollipops',
                'slug' => 'wings-lollipops',
                'description' => 'Chicken wings and lollipop pieces',
                'color' => '#ea580c',
                'icon' => '🍗',
                'sort_order' => 3,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Chicken Combo',
                'slug' => 'chicken-combo',
                'description' => 'Chicken portions combined with sides',
                'color' => '#dc2626',
                'icon' => '🍽️',
                'sort_order' => 4,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Wings Combo',
                'slug' => 'wings-combo',
                'description' => 'Wings paired with various sides',
                'color' => '#ea580c',
                'icon' => '🍽️',
                'sort_order' => 5,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Lollipops Combo',
                'slug' => 'lollipops-combo',
                'description' => 'Lollipop pieces with side options',
                'color' => '#f59e0b',
                'icon' => '🍽️',
                'sort_order' => 6,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Sauteed Chips',
                'slug' => 'sauteed-chips',
                'description' => 'Sauteed chips with various combinations',
                'color' => '#eab308',
                'icon' => '🍟',
                'sort_order' => 7,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Bhajia Corner',
                'slug' => 'bhajia-corner',
                'description' => 'Traditional bhajia and combinations',
                'color' => '#16a34a',
                'icon' => '🥘',
                'sort_order' => 8,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Accompaniments',
                'slug' => 'accompaniments',
                'description' => 'Side dishes and additional items',
                'color' => '#7c3aed',
                'icon' => '🥚',
                'sort_order' => 9,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Burgers',
                'slug' => 'burgers',
                'description' => 'House burgers and hot dogs',
                'color' => '#dc2626',
                'icon' => '🍔',
                'sort_order' => 10,
                'is_active' => true,
                'requires_kitchen' => true
            ],
            [
                'name' => 'Hot Beverages',
                'slug' => 'hot-beverages',
                'description' => 'Tea, coffee and hot drinks',
                'color' => '#92400e',
                'icon' => '☕',
                'sort_order' => 11,
                'is_active' => true,
                'requires_kitchen' => false
            ],
            [
                'name' => 'Cold Beverages',
                'slug' => 'cold-beverages',
                'description' => 'Sodas, juices and cold drinks',
                'color' => '#0891b2',
                'icon' => '🥤',
                'sort_order' => 12,
                'is_active' => true,
                'requires_kitchen' => false
            ]
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }
    }
}
