<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuItem;
use App\Models\Category;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $this->createChipsCorner();
        $this->createFriedChicken();
        $this->createWingsLollipops();
        $this->createChickenCombo();
        $this->createWingsCombo();
        $this->createLollipopsCombo();
        $this->createSauteedChips();
        $this->createBhajiaCorner();
        $this->createAccompaniments();
        $this->createBurgers();
        $this->createHotBeverages();
        $this->createColdBeverages();
    }

    private function createChipsCorner()
    {
        $category = Category::where('slug', 'chips-corner')->first();
        
        $items = [
            ['name' => 'Chips Plain', 'price' => 150.00, 'cost_price' => 60.00],
            ['name' => 'Garlic Chips', 'price' => 180.00, 'cost_price' => 70.00],
            ['name' => 'Chips Masala', 'price' => 200.00, 'cost_price' => 75.00],
            ['name' => 'Sauteed Chips', 'price' => 200.00, 'cost_price' => 80.00],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $item['name'],
                'price' => $item['price'],
                'cost_price' => $item['cost_price'],
                'is_available' => true,
                'requires_kitchen' => true,
                'preparation_time_minutes' => 8,
                'sku' => strtoupper(str_replace(' ', '_', $item['name'])),
            ]);
        }
    }

    private function createFriedChicken()
    {
        $category = Category::where('slug', 'fried-chicken')->first();
        
        $items = [
            ['name' => '1/4 Chicken', 'price' => 280.00, 'cost_price' => 120.00],
            ['name' => '1/2 Chicken', 'price' => 550.00, 'cost_price' => 230.00],
            ['name' => 'Full Chicken', 'price' => 1100.00, 'cost_price' => 450.00],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $item['name'],
                'price' => $item['price'],
                'cost_price' => $item['cost_price'],
                'is_available' => true,
                'requires_kitchen' => true,
                'preparation_time_minutes' => 15,
                'sku' => strtoupper(str_replace(['/', ' '], ['_', '_'], $item['name'])),
            ]);
        }
    }

    private function createWingsLollipops()
    {
        $category = Category::where('slug', 'wings-lollipops')->first();
        
        $items = [
            ['name' => '2pcs Wings', 'price' => 160.00, 'cost_price' => 70.00],
            ['name' => '4pcs Wings', 'price' => 320.00, 'cost_price' => 140.00],
            ['name' => '1pc Lollipop', 'price' => 160.00, 'cost_price' => 70.00],
            ['name' => '2pcs Lollipops', 'price' => 320.00, 'cost_price' => 140.00],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $item['name'],
                'price' => $item['price'],
                'cost_price' => $item['cost_price'],
                'is_available' => true,
                'requires_kitchen' => true,
                'preparation_time_minutes' => 12,
                'sku' => strtoupper(str_replace(' ', '_', $item['name'])),
            ]);
        }
    }

    private function createChickenCombo()
    {
        $category = Category::where('slug', 'chicken-combo')->first();
        
        $combos = [
            ['name' => '1/4 Chicken + Chips Plain', 'price' => 350.00, 'cost_price' => 180.00],
            ['name' => '1/4 Chicken + Garlic Chips', 'price' => 400.00, 'cost_price' => 190.00],
            ['name' => '1/4 Chicken + Sauteed Chips', 'price' => 400.00, 'cost_price' => 200.00],
            ['name' => '1/4 Chicken + Chips Masala', 'price' => 450.00, 'cost_price' => 195.00],
            ['name' => '1/4 Chicken + Bhajia', 'price' => 450.00, 'cost_price' => 190.00],
        ];

        foreach ($combos as $combo) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $combo['name'],
                'price' => $combo['price'],
                'cost_price' => $combo['cost_price'],
                'is_available' => true,
                'is_combo' => true,
                'requires_kitchen' => true,
                'preparation_time_minutes' => 18,
                'sku' => strtoupper(str_replace(['/4 ', ' + ', ' '], ['_', '_', '_'], $combo['name'])),
            ]);
        }
    }

    private function createWingsCombo()
    {
        $category = Category::where('slug', 'wings-combo')->first();
        
        $combos = [
            ['name' => '2pcs Wings + Chips Plain', 'price' => 240.00, 'cost_price' => 130.00],
            ['name' => '2pcs Wings + Garlic Chips', 'price' => 260.00, 'cost_price' => 140.00],
            ['name' => '2pcs Wings + Chips Masala', 'price' => 280.00, 'cost_price' => 145.00],
            ['name' => '2pcs Wings + Bhajia', 'price' => 280.00, 'cost_price' => 140.00],
            ['name' => '4pcs Wings + Chips Plain', 'price' => 380.00, 'cost_price' => 200.00],
            ['name' => '4pcs Wings + Garlic Chips', 'price' => 430.00, 'cost_price' => 210.00],
            ['name' => '4pcs Wings + Chips Masala', 'price' => 480.00, 'cost_price' => 215.00],
            ['name' => '4pcs Wings + Bhajia', 'price' => 480.00, 'cost_price' => 210.00],
        ];

        foreach ($combos as $combo) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $combo['name'],
                'price' => $combo['price'],
                'cost_price' => $combo['cost_price'],
                'is_available' => true,
                'is_combo' => true,
                'requires_kitchen' => true,
                'preparation_time_minutes' => 15,
                'sku' => strtoupper(str_replace([' + ', ' '], ['_', '_'], $combo['name'])),
            ]);
        }
    }

    private function createLollipopsCombo()
    {
        $category = Category::where('slug', 'lollipops-combo')->first();
        
        $combos = [
            ['name' => '1pc Lollipop + Chips Plain', 'price' => 240.00, 'cost_price' => 130.00],
            ['name' => '1pc Lollipop + Garlic Chips', 'price' => 260.00, 'cost_price' => 140.00],
            ['name' => '1pc Lollipop + Chips Masala', 'price' => 280.00, 'cost_price' => 145.00],
            ['name' => '1pc Lollipop + Bhajia', 'price' => 280.00, 'cost_price' => 140.00],
            ['name' => '2pcs Lollipop + Chips Plain', 'price' => 380.00, 'cost_price' => 200.00],
            ['name' => '2pcs Lollipop + Garlic Chips', 'price' => 430.00, 'cost_price' => 210.00],
            ['name' => '2pcs Lollipop + Chips Masala', 'price' => 480.00, 'cost_price' => 215.00],
            ['name' => '2pcs Lollipop + Bhajia', 'price' => 480.00, 'cost_price' => 210.00],
        ];

        foreach ($combos as $combo) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $combo['name'],
                'price' => $combo['price'],
                'cost_price' => $combo['cost_price'],
                'is_available' => true,
                'is_combo' => true,
                'requires_kitchen' => true,
                'preparation_time_minutes' => 15,
                'sku' => strtoupper(str_replace([' + ', ' '], ['_', '_'], $combo['name'])),
            ]);
        }
    }

    private function createSauteedChips()
    {
        $category = Category::where('slug', 'sauteed-chips')->first();
        
        $combos = [
            ['name' => 'Sauteed Chips + 2pcs Wings', 'price' => 280.00, 'cost_price' => 150.00],
            ['name' => 'Sauteed Chips + 4pcs Wings', 'price' => 480.00, 'cost_price' => 220.00],
            ['name' => 'Sauteed Chips + 2 Lollipops', 'price' => 480.00, 'cost_price' => 220.00],
        ];

        foreach ($combos as $combo) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $combo['name'],
                'price' => $combo['price'],
                'cost_price' => $combo['cost_price'],
                'is_available' => true,
                'is_combo' => true,
                'requires_kitchen' => true,
                'preparation_time_minutes' => 18,
                'sku' => strtoupper(str_replace([' + ', ' '], ['_', '_'], $combo['name'])),
            ]);
        }
    }

    private function createBhajiaCorner()
    {
        $category = Category::where('slug', 'bhajia-corner')->first();
        
        $items = [
            ['name' => 'Bhajia', 'price' => 200.00, 'cost_price' => 70.00, 'is_combo' => false],
            ['name' => 'Bhajia + 1/4 Chicken', 'price' => 450.00, 'cost_price' => 190.00, 'is_combo' => true],
            ['name' => 'Bhajia + 4 Wings', 'price' => 480.00, 'cost_price' => 210.00, 'is_combo' => true],
            ['name' => 'Bhajia + 2pcs Lollipops', 'price' => 480.00, 'cost_price' => 210.00, 'is_combo' => true],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $item['name'],
                'price' => $item['price'],
                'cost_price' => $item['cost_price'],
                'is_available' => true,
                'is_combo' => $item['is_combo'],
                'requires_kitchen' => true,
                'preparation_time_minutes' => $item['is_combo'] ? 18 : 12,
                'sku' => strtoupper(str_replace([' + ', '/4 ', ' '], ['_', '_', '_'], $item['name'])),
            ]);
        }
    }

    private function createAccompaniments()
    {
        $category = Category::where('slug', 'accompaniments')->first();
        
        $items = [
            ['name' => 'Andazi', 'price' => 30.00, 'cost_price' => 10.00],
            ['name' => 'Boiled Eggs 1pc', 'price' => 40.00, 'cost_price' => 15.00],
            ['name' => 'Smokies', 'price' => 40.00, 'cost_price' => 20.00],
            ['name' => 'Chapati', 'price' => 50.00, 'cost_price' => 15.00],
            ['name' => 'Fried Eggs (2pcs)', 'price' => 60.00, 'cost_price' => 25.00],
            ['name' => 'Beef Samosa', 'price' => 70.00, 'cost_price' => 30.00],
            ['name' => 'Beef Sausage', 'price' => 70.00, 'cost_price' => 35.00],
            ['name' => 'Special Smokie', 'price' => 100.00, 'cost_price' => 45.00],
            ['name' => 'Special Samosa/Sausage', 'price' => 100.00, 'cost_price' => 50.00],
            ['name' => 'Special Eggs', 'price' => 100.00, 'cost_price' => 40.00],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $item['name'],
                'price' => $item['price'],
                'cost_price' => $item['cost_price'],
                'is_available' => true,
                'requires_kitchen' => true,
                'preparation_time_minutes' => 8,
                'sku' => strtoupper(str_replace([' ', '(', ')', '/'], ['_', '', '', '_'], $item['name'])),
            ]);
        }
    }

    private function createBurgers()
    {
        $category = Category::where('slug', 'burgers')->first();
        
        $items = [
            ['name' => 'Hot Dogs', 'price' => 150.00, 'cost_price' => 60.00],
            ['name' => 'House Burger + Few Chips', 'price' => 300.00, 'cost_price' => 120.00],
            ['name' => 'Cheese Burger + Few Chips', 'price' => 450.00, 'cost_price' => 180.00],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $item['name'],
                'price' => $item['price'],
                'cost_price' => $item['cost_price'],
                'is_available' => true,
                'is_combo' => str_contains($item['name'], '+'),
                'requires_kitchen' => true,
                'preparation_time_minutes' => 12,
                'sku' => strtoupper(str_replace([' + ', ' '], ['_', '_'], $item['name'])),
            ]);
        }
    }

    private function createHotBeverages()
    {
        $category = Category::where('slug', 'hot-beverages')->first();
        
        $beverages = [
            ['name' => 'African Tea', 'price' => 50.00, 'cost_price' => 15.00],
            ['name' => 'English Tea', 'price' => 50.00, 'cost_price' => 15.00],
            ['name' => 'Black Coffee', 'price' => 50.00, 'cost_price' => 20.00],
            ['name' => 'White Coffee', 'price' => 80.00, 'cost_price' => 25.00],
        ];

        foreach ($beverages as $beverage) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $beverage['name'],
                'price' => $beverage['price'],
                'cost_price' => $beverage['cost_price'],
                'is_available' => true,
                'requires_kitchen' => false,
                'preparation_time_minutes' => 3,
                'sku' => strtoupper(str_replace(' ', '_', $beverage['name'])),
            ]);
        }
    }

    private function createColdBeverages()
    {
        $category = Category::where('slug', 'cold-beverages')->first();
        
        $beverages = [
            ['name' => 'Soda', 'price' => 80.00, 'cost_price' => 35.00],
            ['name' => 'Minute Maid', 'price' => 100.00, 'cost_price' => 45.00],
            ['name' => 'Fresh Juice', 'price' => 180.00, 'cost_price' => 70.00],
            ['name' => 'Smoothie', 'price' => 180.00, 'cost_price' => 80.00],
            ['name' => 'Milkshake (Oreo, Strawberry, Mango)', 'price' => 300.00, 'cost_price' => 120.00],
        ];

        foreach ($beverages as $beverage) {
            MenuItem::create([
                'category_id' => $category->id,
                'name' => $beverage['name'],
                'price' => $beverage['price'],
                'cost_price' => $beverage['cost_price'],
                'is_available' => true,
                'requires_kitchen' => false,
                'preparation_time_minutes' => 5,
                'sku' => strtoupper(str_replace([' ', '(', ')', ','], ['_', '', '', ''], $beverage['name'])),
            ]);
        }
    }
}