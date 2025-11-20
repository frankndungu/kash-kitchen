<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\MenuItem;

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

        return Inertia::render('Management/MenuManagement', [
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
        
        return Inertia::render('Management/CreateMenuItem', [
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
        ]);

        MenuItem::create($validatedData);

        return redirect()->route('menu.index')
                       ->with('success', 'Menu item created successfully!');
    }

    public function edit(MenuItem $menuItem)
    {
        $categories = Category::active()->ordered()->get();
        
        return Inertia::render('Management/EditMenuItem', [
            'menuItem' => $menuItem,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, MenuItem $menuItem)
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
        ]);

        $menuItem->update($validatedData);

        return redirect()->route('menu.index')
                       ->with('success', 'Menu item updated successfully!');
    }
}