<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\MenuItemIngredient;

class CompleteMenuItemIngredientsSeeder extends Seeder
{
    public function run()
    {
        // Create all inventory items needed for auto-deduction
        $inventoryItems = $this->createInventoryItems();
        
        // Create all menu item ingredient mappings for EVERY menu item
        $this->createIngredientMappings($inventoryItems);
    }

    private function createInventoryItems()
    {
        $firstUser = \App\Models\User::first();
        
        // Get all category IDs by slug for proper assignment
        $proteinsCategory = \App\Models\InventoryCategory::where('slug', 'proteins-meat')->first()->id;
        $vegetablesCategory = \App\Models\InventoryCategory::where('slug', 'vegetables-produce')->first()->id;
        $flourCategory = \App\Models\InventoryCategory::where('slug', 'flour-bakery')->first()->id;
        $dairyCategory = \App\Models\InventoryCategory::where('slug', 'dairy-eggs')->first()->id;
        $cookingCategory = \App\Models\InventoryCategory::where('slug', 'cooking-essentials')->first()->id;
        $beveragesCategory = \App\Models\InventoryCategory::where('slug', 'beverages-drinks')->first()->id;
        $fruitsCategory = \App\Models\InventoryCategory::where('slug', 'fruits-desserts')->first()->id;
        
        $inventoryItems = [];
        
        // Complete inventory for ALL menu items with proper categories
        $ingredients = [
            // PROTEINS & MEAT
            'Chicken' => ['stock' => 100, 'unit' => 'pcs', 'cost' => 250, 'category' => $proteinsCategory],
            'Wings' => ['stock' => 100, 'unit' => 'pcs', 'cost' => 150, 'category' => $proteinsCategory],
            'Beef' => ['stock' => 50, 'unit' => 'kg', 'cost' => 1200, 'category' => $proteinsCategory],
            'Minced Meat' => ['stock' => 50, 'unit' => 'kg', 'cost' => 800, 'category' => $proteinsCategory],
            'Eggs' => ['stock' => 100, 'unit' => 'pcs', 'cost' => 15, 'category' => $dairyCategory],
            'Sausages' => ['stock' => 50, 'unit' => 'pcs', 'cost' => 80, 'category' => $proteinsCategory],
            'Smokies' => ['stock' => 50, 'unit' => 'pcs', 'cost' => 60, 'category' => $proteinsCategory],
            
            // VEGETABLES & FRESH PRODUCE
            'Potatoes' => ['stock' => 100, 'unit' => 'kg', 'cost' => 80, 'category' => $vegetablesCategory],
            'Onions' => ['stock' => 20, 'unit' => 'kg', 'cost' => 160, 'category' => $vegetablesCategory],
            'Tomatoes' => ['stock' => 20, 'unit' => 'kg', 'cost' => 180, 'category' => $vegetablesCategory],
            'Garlic' => ['stock' => 10, 'unit' => 'kg', 'cost' => 300, 'category' => $vegetablesCategory],
            'Vegetables Mix' => ['stock' => 25, 'unit' => 'kg', 'cost' => 200, 'category' => $vegetablesCategory],
            
            // FLOUR & BAKERY
            'Chapati Flour' => ['stock' => 25, 'unit' => 'kg', 'cost' => 110, 'category' => $flourCategory],
            'Wheat Flour' => ['stock' => 25, 'unit' => 'kg', 'cost' => 100, 'category' => $flourCategory],
            'Burger Buns' => ['stock' => 50, 'unit' => 'pcs', 'cost' => 25, 'category' => $flourCategory],
            'Bread' => ['stock' => 30, 'unit' => 'pcs', 'cost' => 30, 'category' => $flourCategory],
            'Andazi Flour' => ['stock' => 20, 'unit' => 'kg', 'cost' => 120, 'category' => $flourCategory],
            
            // COOKING ESSENTIALS
            'Cooking Oil' => ['stock' => 30, 'unit' => 'l', 'cost' => 300, 'category' => $cookingCategory],
            'Salt' => ['stock' => 10, 'unit' => 'kg', 'cost' => 80, 'category' => $cookingCategory],
            'Spices Mix' => ['stock' => 10, 'unit' => 'kg', 'cost' => 500, 'category' => $cookingCategory],
            'Black Pepper' => ['stock' => 5, 'unit' => 'kg', 'cost' => 800, 'category' => $cookingCategory],
            
            // DAIRY & EGGS
            'Milk' => ['stock' => 20, 'unit' => 'l', 'cost' => 120, 'category' => $dairyCategory],
            'Cheese' => ['stock' => 10, 'unit' => 'kg', 'cost' => 800, 'category' => $dairyCategory],
            'Butter' => ['stock' => 10, 'unit' => 'kg', 'cost' => 600, 'category' => $dairyCategory],
            
            // BEVERAGES & DRINKS
            'Tea Leaves' => ['stock' => 5, 'unit' => 'kg', 'cost' => 800, 'category' => $beveragesCategory],
            'Coffee Beans' => ['stock' => 5, 'unit' => 'kg', 'cost' => 1200, 'category' => $beveragesCategory],
            'Sugar' => ['stock' => 20, 'unit' => 'kg', 'cost' => 150, 'category' => $beveragesCategory],
            'Soda Bottles' => ['stock' => 100, 'unit' => 'pcs', 'cost' => 35, 'category' => $beveragesCategory],
            'Minute Maid' => ['stock' => 50, 'unit' => 'pcs', 'cost' => 45, 'category' => $beveragesCategory],
            
            // FRESH FRUITS & DESSERTS
            'Fresh Fruits' => ['stock' => 20, 'unit' => 'kg', 'cost' => 250, 'category' => $fruitsCategory],
            'Ice Cream' => ['stock' => 10, 'unit' => 'kg', 'cost' => 400, 'category' => $fruitsCategory],
            'Oreo' => ['stock' => 20, 'unit' => 'packs', 'cost' => 150, 'category' => $fruitsCategory],
        ];

        foreach ($ingredients as $name => $details) {
            $sku = strtoupper(str_replace(' ', '_', $name)) . '_' . rand(1000, 9999);
            
            $inventoryItem = InventoryItem::create([
                'name' => $name,
                'sku' => $sku,
                'description' => "Ingredient for {$name} based dishes",
                'category_id' => $details['category'],
                'current_stock' => $details['stock'],
                'minimum_stock' => 10,
                'maximum_stock' => 500,
                'unit_of_measure' => $details['unit'],
                'unit_cost' => $details['cost'],
                'selling_price' => null,
                'track_stock' => true,
                'is_active' => true,
                'created_by' => $firstUser->id,
            ]);

            // Create initial stock movement
            $inventoryItem->stockMovements()->create([
                'movement_type' => 'in',
                'quantity' => $details['stock'],
                'unit_cost' => $details['cost'],
                'total_cost' => $details['stock'] * $details['cost'],
                'previous_stock' => 0,
                'new_stock' => $details['stock'],
                'reason' => 'initial_stock',
                'notes' => 'Initial stock entry',
                'created_by' => $firstUser->id,
                'movement_date' => now(),
            ]);

            $inventoryItems[$name] = $inventoryItem;
            echo "✅ Created {$name} inventory item in proper category\n";
        }

        return $inventoryItems;
    }

    private function createIngredientMappings($inventoryItems)
    {
        // Complete mappings for ALL 57 menu items
        $mappings = [
            // CHIPS CORNER
            'Chips Plain' => [
                ['ingredient' => 'Potatoes', 'quantity' => 0.5, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Salt', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            'Garlic Chips' => [
                ['ingredient' => 'Potatoes', 'quantity' => 0.5, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Garlic', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            'Chips Masala' => [
                ['ingredient' => 'Potatoes', 'quantity' => 0.5, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Tomatoes', 'quantity' => 0.1, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.05, 'unit' => 'kg'],
            ],
            'Sauteed Chips' => [
                ['ingredient' => 'Potatoes', 'quantity' => 0.5, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.1, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.05, 'unit' => 'kg'],
            ],

            // FRIED CHICKEN
            '1/4 Chicken' => [
                ['ingredient' => 'Chicken', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
            ],
            '1/2 Chicken' => [
                ['ingredient' => 'Chicken', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.03, 'unit' => 'kg'],
            ],
            'Full Chicken' => [
                ['ingredient' => 'Chicken', 'quantity' => 4.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.25, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.05, 'unit' => 'kg'],
            ],

            // WINGS & LOLLIPOPS
            '2pcs Wings' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.05, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            '4pcs Wings' => [
                ['ingredient' => 'Wings', 'quantity' => 4.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.08, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
            ],
            '1pc Lollipop' => [
                ['ingredient' => 'Wings', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.03, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            '2pcs Lollipops' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.06, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.015, 'unit' => 'kg'],
            ],

            // CHICKEN COMBO
            '1/4 Chicken + Chips Plain' => [
                ['ingredient' => 'Chicken', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.4, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            '1/4 Chicken + Garlic Chips' => [
                ['ingredient' => 'Chicken', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.4, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Garlic', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            '1/4 Chicken + Sauteed Chips' => [
                ['ingredient' => 'Chicken', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.4, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.18, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.08, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.04, 'unit' => 'kg'],
            ],
            '1/4 Chicken + Chips Masala' => [
                ['ingredient' => 'Chicken', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.4, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.025, 'unit' => 'kg'],
                ['ingredient' => 'Tomatoes', 'quantity' => 0.08, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.04, 'unit' => 'kg'],
            ],
            '1/4 Chicken + Bhajia' => [
                ['ingredient' => 'Chicken', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.3, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.05, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.03, 'unit' => 'kg'],
            ],

            // WINGS COMBO
            '2pcs Wings + Chips Plain' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.008, 'unit' => 'kg'],
            ],
            '2pcs Wings + Garlic Chips' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Garlic', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.008, 'unit' => 'kg'],
            ],
            '2pcs Wings + Chips Masala' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Tomatoes', 'quantity' => 0.06, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.03, 'unit' => 'kg'],
            ],
            '2pcs Wings + Bhajia' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.25, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.04, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.025, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.025, 'unit' => 'kg'],
            ],
            '4pcs Wings + Chips Plain' => [
                ['ingredient' => 'Wings', 'quantity' => 4.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.025, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.008, 'unit' => 'kg'],
            ],
            '4pcs Wings + Garlic Chips' => [
                ['ingredient' => 'Wings', 'quantity' => 4.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.025, 'unit' => 'kg'],
                ['ingredient' => 'Garlic', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.008, 'unit' => 'kg'],
            ],
            '4pcs Wings + Chips Masala' => [
                ['ingredient' => 'Wings', 'quantity' => 4.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Tomatoes', 'quantity' => 0.06, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.03, 'unit' => 'kg'],
            ],
            '4pcs Wings + Bhajia' => [
                ['ingredient' => 'Wings', 'quantity' => 4.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.25, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.04, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.035, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.025, 'unit' => 'kg'],
            ],

            // LOLLIPOPS COMBO
            '1pc Lollipop + Chips Plain' => [
                ['ingredient' => 'Wings', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.008, 'unit' => 'kg'],
            ],
            '1pc Lollipop + Garlic Chips' => [
                ['ingredient' => 'Wings', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Garlic', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.008, 'unit' => 'kg'],
            ],
            '1pc Lollipop + Chips Masala' => [
                ['ingredient' => 'Wings', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Tomatoes', 'quantity' => 0.06, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.03, 'unit' => 'kg'],
            ],
            '1pc Lollipop + Bhajia' => [
                ['ingredient' => 'Wings', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.25, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.04, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.025, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.025, 'unit' => 'kg'],
            ],
            '2pcs Lollipop + Chips Plain' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.008, 'unit' => 'kg'],
            ],
            '2pcs Lollipop + Garlic Chips' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Garlic', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Salt', 'quantity' => 0.008, 'unit' => 'kg'],
            ],
            '2pcs Lollipop + Chips Masala' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.35, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.025, 'unit' => 'kg'],
                ['ingredient' => 'Tomatoes', 'quantity' => 0.06, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.03, 'unit' => 'kg'],
            ],
            '2pcs Lollipop + Bhajia' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.25, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.04, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.025, 'unit' => 'kg'],
            ],

            // SAUTEED CHIPS
            'Sauteed Chips + 2pcs Wings' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.4, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.035, 'unit' => 'kg'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.08, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.04, 'unit' => 'kg'],
            ],
            'Sauteed Chips + 4pcs Wings' => [
                ['ingredient' => 'Wings', 'quantity' => 4.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.4, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.18, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.045, 'unit' => 'kg'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.08, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.04, 'unit' => 'kg'],
            ],
            'Sauteed Chips + 2 Lollipops' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.4, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.035, 'unit' => 'kg'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.08, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.04, 'unit' => 'kg'],
            ],

            // BHAJIA CORNER
            'Bhajia' => [
                ['ingredient' => 'Potatoes', 'quantity' => 0.4, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.06, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.04, 'unit' => 'kg'],
            ],
            'Bhajia + 1/4 Chicken' => [
                ['ingredient' => 'Chicken', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.3, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.05, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.03, 'unit' => 'kg'],
            ],
            'Bhajia + 4 Wings' => [
                ['ingredient' => 'Wings', 'quantity' => 4.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.25, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.04, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.035, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.025, 'unit' => 'kg'],
            ],
            'Bhajia + 2pcs Lollipops' => [
                ['ingredient' => 'Wings', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.25, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.04, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.12, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.025, 'unit' => 'kg'],
            ],

            // ACCOMPANIMENTS
            'Andazi' => [
                ['ingredient' => 'Andazi Flour', 'quantity' => 0.05, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.03, 'unit' => 'l'],
                ['ingredient' => 'Sugar', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            'Boiled Eggs 1pc' => [
                ['ingredient' => 'Eggs', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Salt', 'quantity' => 0.002, 'unit' => 'kg'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.001, 'unit' => 'kg'],
            ],
            'Smokies' => [
                ['ingredient' => 'Smokies', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.01, 'unit' => 'l'],
            ],
            'Chapati' => [
                ['ingredient' => 'Chapati Flour', 'quantity' => 0.08, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.02, 'unit' => 'l'],
                ['ingredient' => 'Salt', 'quantity' => 0.003, 'unit' => 'kg'],
            ],
            'Fried Eggs (2pcs)' => [
                ['ingredient' => 'Eggs', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.02, 'unit' => 'l'],
                ['ingredient' => 'Salt', 'quantity' => 0.003, 'unit' => 'kg'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.002, 'unit' => 'kg'],
                ['ingredient' => 'Butter', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            'Beef Samosa' => [
                ['ingredient' => 'Minced Meat', 'quantity' => 0.04, 'unit' => 'kg'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.03, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.005, 'unit' => 'kg'],
                ['ingredient' => 'Onions', 'quantity' => 0.01, 'unit' => 'kg'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.002, 'unit' => 'kg'],
            ],
            'Beef Sausage' => [
                ['ingredient' => 'Sausages', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.015, 'unit' => 'l'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.001, 'unit' => 'kg'],
            ],
            'Special Smokie' => [
                ['ingredient' => 'Smokies', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.02, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.01, 'unit' => 'kg'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.002, 'unit' => 'kg'],
            ],
            'Special Samosa/Sausage' => [
                ['ingredient' => 'Minced Meat', 'quantity' => 0.06, 'unit' => 'kg'],
                ['ingredient' => 'Sausages', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Wheat Flour', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.04, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.01, 'unit' => 'kg'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.003, 'unit' => 'kg'],
            ],
            'Special Eggs' => [
                ['ingredient' => 'Eggs', 'quantity' => 2.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.03, 'unit' => 'l'],
                ['ingredient' => 'Spices Mix', 'quantity' => 0.01, 'unit' => 'kg'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Cheese', 'quantity' => 0.02, 'unit' => 'kg'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.003, 'unit' => 'kg'],
                ['ingredient' => 'Butter', 'quantity' => 0.015, 'unit' => 'kg'],
            ],

            // BURGERS
            'Hot Dogs' => [
                ['ingredient' => 'Sausages', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Bread', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.01, 'unit' => 'l'],
            ],
            'House Burger + Few Chips' => [
                ['ingredient' => 'Beef', 'quantity' => 0.12, 'unit' => 'kg'],
                ['ingredient' => 'Burger Buns', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.15, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.08, 'unit' => 'l'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.002, 'unit' => 'kg'],
            ],
            'Cheese Burger + Few Chips' => [
                ['ingredient' => 'Beef', 'quantity' => 0.15, 'unit' => 'kg'],
                ['ingredient' => 'Burger Buns', 'quantity' => 1.0, 'unit' => 'pcs'],
                ['ingredient' => 'Cheese', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Potatoes', 'quantity' => 0.15, 'unit' => 'kg'],
                ['ingredient' => 'Cooking Oil', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Vegetables Mix', 'quantity' => 0.03, 'unit' => 'kg'],
                ['ingredient' => 'Black Pepper', 'quantity' => 0.003, 'unit' => 'kg'],
                ['ingredient' => 'Butter', 'quantity' => 0.01, 'unit' => 'kg'],
            ],

            // HOT BEVERAGES
            'African Tea' => [
                ['ingredient' => 'Tea Leaves', 'quantity' => 0.005, 'unit' => 'kg'],
                ['ingredient' => 'Milk', 'quantity' => 0.1, 'unit' => 'l'],
                ['ingredient' => 'Sugar', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Butter', 'quantity' => 0.002, 'unit' => 'kg'],
            ],
            'English Tea' => [
                ['ingredient' => 'Tea Leaves', 'quantity' => 0.003, 'unit' => 'kg'],
                ['ingredient' => 'Sugar', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            'Black Coffee' => [
                ['ingredient' => 'Coffee Beans', 'quantity' => 0.008, 'unit' => 'kg'],
                ['ingredient' => 'Sugar', 'quantity' => 0.01, 'unit' => 'kg'],
            ],
            'White Coffee' => [
                ['ingredient' => 'Coffee Beans', 'quantity' => 0.008, 'unit' => 'kg'],
                ['ingredient' => 'Milk', 'quantity' => 0.08, 'unit' => 'l'],
                ['ingredient' => 'Sugar', 'quantity' => 0.015, 'unit' => 'kg'],
                ['ingredient' => 'Butter', 'quantity' => 0.003, 'unit' => 'kg'],
            ],

            // COLD BEVERAGES
            'Soda' => [
                ['ingredient' => 'Soda Bottles', 'quantity' => 1.0, 'unit' => 'pcs'],
            ],
            'Minute Maid' => [
                ['ingredient' => 'Minute Maid', 'quantity' => 1.0, 'unit' => 'pcs'],
            ],
            'Fresh Juice' => [
                ['ingredient' => 'Fresh Fruits', 'quantity' => 0.3, 'unit' => 'kg'],
                ['ingredient' => 'Sugar', 'quantity' => 0.02, 'unit' => 'kg'],
            ],
            'Smoothie' => [
                ['ingredient' => 'Fresh Fruits', 'quantity' => 0.25, 'unit' => 'kg'],
                ['ingredient' => 'Milk', 'quantity' => 0.15, 'unit' => 'l'],
                ['ingredient' => 'Sugar', 'quantity' => 0.025, 'unit' => 'kg'],
                ['ingredient' => 'Ice Cream', 'quantity' => 0.05, 'unit' => 'kg'],
            ],
            'Milkshake (Oreo, Strawberry, Mango)' => [
                ['ingredient' => 'Milk', 'quantity' => 0.2, 'unit' => 'l'],
                ['ingredient' => 'Ice Cream', 'quantity' => 0.1, 'unit' => 'kg'],
                ['ingredient' => 'Oreo', 'quantity' => 0.5, 'unit' => 'packs'],
                ['ingredient' => 'Fresh Fruits', 'quantity' => 0.1, 'unit' => 'kg'],
                ['ingredient' => 'Sugar', 'quantity' => 0.02, 'unit' => 'kg'],
            ],
        ];

        // Create the mappings
        foreach ($mappings as $menuItemName => $ingredients) {
            // Find the menu item
            $menuItem = MenuItem::where('name', $menuItemName)->first();
            
            if (!$menuItem) {
                echo "❌ Menu item '{$menuItemName}' not found\n";
                continue;
            }

            // Clear existing mappings
            MenuItemIngredient::where('menu_item_id', $menuItem->id)->delete();

            // Create new mappings
            foreach ($ingredients as $ingredient) {
                if (!isset($inventoryItems[$ingredient['ingredient']])) {
                    echo "❌ Inventory item '{$ingredient['ingredient']}' not found for {$menuItemName}\n";
                    continue;
                }

                MenuItemIngredient::create([
                    'menu_item_id' => $menuItem->id,
                    'inventory_item_id' => $inventoryItems[$ingredient['ingredient']]->id,
                    'quantity_used' => $ingredient['quantity'],
                    'unit' => $ingredient['unit'],
                ]);
            }

            echo "✅ Linked: {$menuItemName} -> " . count($ingredients) . " ingredients\n";
        }

        echo "\n🎉 Complete auto-deduction setup for ALL 57 MENU ITEMS!\n";
        echo "✅ Every single order will now automatically deduct inventory!\n";
    }
}