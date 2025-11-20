<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\MenuItem;

class MenuController extends Controller
{
    public function categories()
    {
        $categories = Category::active()->ordered()->get();
        return response()->json($categories);
    }

    public function items(Request $request)
    {
        $query = MenuItem::with('category')->available();

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $items = $query->orderBy('sort_order')->orderBy('name')->get();

        return response()->json($items);
    }

    public function toggleAvailability(MenuItem $menuItem)
    {
        $menuItem->update([
            'is_available' => !$menuItem->is_available
        ]);

        return response()->json([
            'success' => true,
            'is_available' => $menuItem->is_available,
            'message' => 'Menu item availability updated successfully'
        ]);
    }
}