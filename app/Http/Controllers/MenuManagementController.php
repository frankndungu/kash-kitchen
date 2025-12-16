<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Support\Str;

class MenuManagementController extends Controller
{
    public function index(Request $request)
    {
        // Check permissions
        $user = $request->user();
        if (!$user->hasAnyRole(['admin', 'manager'])) {
            return redirect()->route('dashboard')
                           ->with('error', 'You do not have access to menu management.');
        }

        $categories = Category::with(['menuItems' => function ($query) {
                                 $query->orderBy('sort_order')->orderBy('name');
                             }])
                             ->ordered()
                             ->get();

        return Inertia::render('menu/index', [
            'user' => $user->load('roles'),
            'categories' => $categories,
            'stats' => [
                'totalItems' => MenuItem::count(),
                'activeItems' => MenuItem::where('is_available', true)->count(),
                'comboItems' => MenuItem::where('is_combo', true)->count(),
                'categoriesCount' => Category::where('is_active', true)->count(),
            ],
        ]);
    }

    public function create()
    {
        $categories = Category::active()->ordered()->get();
        
        return Inertia::render('menu/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
            'is_combo' => 'boolean',
            'preparation_time_minutes' => 'required|integer|min:1',
            'allergens' => 'nullable|array',
            'special_instructions' => 'nullable|string',
        ]);

        // Auto-generate SKU if not provided
        if (empty($validatedData['sku'])) {
            $validatedData['sku'] = strtoupper(str_replace(' ', '_', $validatedData['name']));
        }

        // Generate slug from name for the MenuItem
        $validatedData['slug'] = Str::slug($validatedData['name']);

        MenuItem::create($validatedData);

        return redirect()->route('menu.index')
                       ->with('success', 'Menu item created successfully!');
    }

    public function show(Request $request, $id)
    {
        // Check permissions
        $user = $request->user();
        if (!$user->hasAnyRole(['admin', 'manager'])) {
            return redirect()->route('dashboard')
                           ->with('error', 'You do not have access to menu management.');
        }

        // Find the menu item with category relationship
        $menuItem = MenuItem::with('category')->findOrFail($id);
        
        // Debug: Log what we're sending to the view
        \Log::info('Menu item data being sent to view:', [
            'id' => $menuItem->id,
            'name' => $menuItem->name,
            'price' => $menuItem->price,
            'category_id' => $menuItem->category_id,
            'category_name' => $menuItem->category ? $menuItem->category->name : 'No category',
            'is_available' => $menuItem->is_available,
            'full_data' => $menuItem->toArray()
        ]);

        return Inertia::render('menu/show', [
            'menuItem' => $menuItem->load('category'),
        ]);
    }

    public function edit(Request $request, $id)
    {
        // Check permissions
        $user = $request->user();
        if (!$user->hasAnyRole(['admin', 'manager'])) {
            return redirect()->route('dashboard')
                           ->with('error', 'You do not have access to menu management.');
        }

        $menuItem = MenuItem::findOrFail($id);
        $categories = Category::active()->ordered()->get();
        
        return Inertia::render('menu/edit', [
            'menuItem' => $menuItem,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, $id)
    {
        $menuItem = MenuItem::findOrFail($id);
        
        $validatedData = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
            'is_combo' => 'boolean',
            'preparation_time_minutes' => 'required|integer|min:1',
            'allergens' => 'nullable|array',
            'special_instructions' => 'nullable|string',
        ]);

        // Update slug if name changed
        if ($validatedData['name'] !== $menuItem->name) {
            $validatedData['slug'] = Str::slug($validatedData['name']);
        }

        $menuItem->update($validatedData);

        return redirect()->route('menu.index')
                       ->with('success', 'Menu item updated successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->delete();

        return redirect()->route('menu.index')
                       ->with('success', 'Menu item deleted successfully!');
    }

    // Additional helper method to toggle availability
    public function toggleAvailability(Request $request, $id)
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->update(['is_available' => !$menuItem->is_available]);

        $status = $menuItem->is_available ? 'available' : 'unavailable';
        
        return redirect()->route('menu.index')
                       ->with('success', "Menu item marked as {$status}!");
    }
}