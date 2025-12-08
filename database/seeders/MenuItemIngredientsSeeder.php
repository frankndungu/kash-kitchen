<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuItemIngredientsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🚀 Setting up automatic inventory deduction for Kash Kitchen...\n";

        // Get the first user to use as created_by (or create a system user)
        $user = User::first();
        if (!$user) {
            echo "❌ No users found. Please create a user first.\n";
            return;
        }

        echo "Using user: {$user->name} (ID: {$user->id})\n";

        // Check what inventory items already exist
        $existingChicken = InventoryItem::where('name', 'Chicken')->first();
        $existingPotatoes = InventoryItem::where('name', 'Potatoes')->first();

        // Create Chicken if it doesn't exist
        if (!$existingChicken) {
            echo "Creating Chicken inventory item...\n";
            $existingChicken = InventoryItem::create([
                'name' => 'Chicken',
                'sku' => 'CHICKEN_' . rand(1000, 9999),
                'description' => 'Fresh chicken pieces for restaurant use',
                'category_id' => 1, // Assuming category exists
                'current_stock' => 100,
                'minimum_stock' => 10,
                'maximum_stock' => 500,
                'unit_of_measure' => 'pcs',
                'unit_cost' => 250,
                'created_by' => $user->id,
            ]);
            echo "✅ Created Chicken inventory item\n";
        } else {
            echo "✅ Found existing Chicken inventory item\n";
        }

        // Create Potatoes if it doesn't exist
        if (!$existingPotatoes) {
            echo "Creating Potatoes inventory item...\n";
            $existingPotatoes = InventoryItem::create([
                'name' => 'Potatoes',
                'sku' => 'POTATOES_' . rand(1000, 9999),
                'description' => 'Fresh potatoes for chips and sides',
                'category_id' => 1, // Assuming category exists
                'current_stock' => 100,
                'minimum_stock' => 10,
                'maximum_stock' => 500,
                'unit_of_measure' => 'kg',
                'unit_cost' => 80,
                'created_by' => $user->id,
            ]);
            echo "✅ Created Potatoes inventory item\n";
        } else {
            echo "✅ Found existing Potatoes inventory item\n";
        }

        // Now set up the ingredient mappings
        $mappings = [
            ['menu_item' => 'Chips', 'inventory_item' => $existingPotatoes, 'quantity' => 0.75, 'unit' => 'kg'],
            ['menu_item' => '1/4 Chicken', 'inventory_item' => $existingChicken, 'quantity' => 1.0, 'unit' => 'pcs'],
        ];

        foreach ($mappings as $mapping) {
            $menuItem = MenuItem::where('name', 'LIKE', "%{$mapping['menu_item']}%")->first();
            
            if ($menuItem && $mapping['inventory_item']) {
                // Create the relationship
                DB::table('menu_item_ingredients')->updateOrInsert(
                    [
                        'menu_item_id' => $menuItem->id,
                        'inventory_item_id' => $mapping['inventory_item']->id,
                    ],
                    [
                        'quantity_used' => $mapping['quantity'],
                        'unit' => $mapping['unit'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
                
                echo "✅ Linked: {$menuItem->name} -> {$mapping['inventory_item']->name} ({$mapping['quantity']} {$mapping['unit']})\n";
            } else {
                echo "❌ Could not find menu item: {$mapping['menu_item']}\n";
            }
        }

        echo "🎉 Basic automatic deduction setup complete!\n";
        echo "Now when you sell Chips, it will auto-deduct 0.75kg from Potatoes inventory\n";
        echo "When you sell 1/4 Chicken, it will auto-deduct 1.0pcs from Chicken inventory\n";
    }
}