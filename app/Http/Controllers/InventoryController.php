<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\Supplier;
use App\Models\StockMovement;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get inventory items with filtering
        $query = InventoryItem::with(['category', 'supplier'])
                              ->where('is_active', true);

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'low_stock':
                    $query->whereColumn('current_stock', '<=', 'minimum_stock');
                    break;
                case 'out_of_stock':
                    $query->where('current_stock', '<=', 0);
                    break;
                case 'in_stock':
                    $query->whereColumn('current_stock', '>', 'minimum_stock');
                    break;
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $inventoryItems = $query->orderBy('name')->paginate(20);

        // Get summary statistics
        $stats = [
            'total_items' => InventoryItem::active()->count(),
            'low_stock_items' => InventoryItem::lowStock()->count(),
            'out_of_stock_items' => InventoryItem::outOfStock()->count(),
            'total_value' => InventoryItem::active()
                                        ->selectRaw('SUM(current_stock * unit_cost) as total')
                                        ->value('total') ?? 0,
        ];

        // Get categories for filtering
        $categories = InventoryCategory::active()->ordered()->get();

        return Inertia::render('inventory/index', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'inventoryItems' => $inventoryItems,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['category', 'status', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        
        $categories = InventoryCategory::active()->ordered()->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('inventory/create', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:inventory_items,sku',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:inventory_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'current_stock' => 'required|numeric|min:0',
            'minimum_stock' => 'required|numeric|min:0',
            'maximum_stock' => 'nullable|numeric|min:0',
            'unit_of_measure' => 'required|string|max:20',
            'unit_cost' => 'required|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'track_stock' => 'boolean',
            'storage_requirements' => 'nullable|array',
        ]);

        try {
            $inventoryItem = InventoryItem::create([
                ...$validatedData,
                'created_by' => $request->user()->id,
                'is_active' => true,
            ]);

            // Create initial stock movement if current_stock > 0
            if ($validatedData['current_stock'] > 0) {
                $inventoryItem->stockMovements()->create([
                    'movement_type' => 'in',
                    'quantity' => $validatedData['current_stock'],
                    'unit_cost' => $validatedData['unit_cost'],
                    'total_cost' => $validatedData['current_stock'] * $validatedData['unit_cost'],
                    'previous_stock' => 0,
                    'new_stock' => $validatedData['current_stock'],
                    'reason' => 'initial_stock',
                    'notes' => 'Initial stock entry',
                    'supplier_id' => $validatedData['supplier_id'] ?? null,
                    'created_by' => $request->user()->id,
                    'movement_date' => now(),
                ]);
            }

            return redirect()->route('inventory.index')
                           ->with('success', "Inventory item '{$inventoryItem->name}' created successfully!");

        } catch (\Exception $e) {
            \Log::error('Inventory item creation failed', [
                'error' => $e->getMessage(),
                'data' => $validatedData
            ]);

            return redirect()->back()
                           ->withErrors(['error' => 'Failed to create inventory item: ' . $e->getMessage()])
                           ->withInput();
        }
    }

    public function show(Request $request, InventoryItem $inventoryItem)
    {
        $user = $request->user();
        
        $inventoryItem->load(['category', 'supplier', 'creator']);
        
        // Get recent stock movements
        $stockMovements = $inventoryItem->stockMovements()
                                       ->with(['supplier', 'creator'])
                                       ->latest('movement_date')
                                       ->paginate(20);

        // Get stock movement statistics
        $movementStats = [
            'total_movements' => $inventoryItem->stockMovements()->count(),
            'total_stock_in' => $inventoryItem->stockMovements()->incoming()->sum('quantity'),
            'total_stock_out' => $inventoryItem->stockMovements()->outgoing()->sum('quantity'),
            'this_month_movements' => $inventoryItem->stockMovements()->thisMonth()->count(),
        ];

        return Inertia::render('inventory/show', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'inventoryItem' => $inventoryItem,
            'stockMovements' => $stockMovements,
            'movementStats' => $movementStats,
        ]);
    }

    public function edit(Request $request, InventoryItem $inventoryItem)
    {
        $user = $request->user();
        
        $categories = InventoryCategory::active()->ordered()->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('inventory/edit', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'inventoryItem' => $inventoryItem->load(['category', 'supplier']),
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:inventory_items,sku,' . $inventoryItem->id,
            'description' => 'nullable|string',
            'category_id' => 'required|exists:inventory_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'minimum_stock' => 'required|numeric|min:0',
            'maximum_stock' => 'nullable|numeric|min:0',
            'unit_of_measure' => 'required|string|max:20',
            'unit_cost' => 'required|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'track_stock' => 'boolean',
            'storage_requirements' => 'nullable|array',
        ]);

        try {
            $inventoryItem->update([
                ...$validatedData,
                'updated_by' => $request->user()->id,
            ]);

            return redirect()->route('inventory.show', $inventoryItem)
                           ->with('success', "Inventory item '{$inventoryItem->name}' updated successfully!");

        } catch (\Exception $e) {
            \Log::error('Inventory item update failed', [
                'inventory_item_id' => $inventoryItem->id,
                'error' => $e->getMessage(),
                'data' => $validatedData
            ]);

            return redirect()->back()
                           ->withErrors(['error' => 'Failed to update inventory item: ' . $e->getMessage()])
                           ->withInput();
        }
    }

    /**
     * Add stock to inventory (Stock In)
     * For purchases, deliveries, or receiving new inventory
     */
    public function addStock(Request $request, InventoryItem $inventoryItem)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'unit_cost' => 'required|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'batch_number' => 'nullable|string|max:50',
            'expiry_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $stockMovement = $inventoryItem->addStock(
                $validatedData['quantity'],
                [
                    'unit_cost' => $validatedData['unit_cost'],
                    'supplier_id' => $validatedData['supplier_id'] ?? null,
                    'batch_number' => $validatedData['batch_number'] ?? null,
                    'expiry_date' => $validatedData['expiry_date'] ?? null,
                    'notes' => $validatedData['notes'] ?? null,
                    'reason' => 'purchase',
                    'created_by' => $request->user()->id,
                ]
            );

            $newStock = $inventoryItem->fresh()->current_stock;

            return redirect()->back()
                           ->with('success', "Added {$validatedData['quantity']} {$inventoryItem->unit_of_measure} to '{$inventoryItem->name}'. New stock: {$newStock} {$inventoryItem->unit_of_measure}");

        } catch (\Exception $e) {
            \Log::error('Add stock failed', [
                'inventory_item_id' => $inventoryItem->id,
                'error' => $e->getMessage(),
                'data' => $validatedData
            ]);

            return redirect()->back()
                           ->withErrors(['error' => 'Failed to add stock: ' . $e->getMessage()]);
        }
    }

    /**
     * Use/Remove stock from inventory (Stock Out)
     * For daily consumption, cooking, waste, or general usage
     */
    public function useStock(Request $request, InventoryItem $inventoryItem)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        // Check if there's enough stock
        if ($validatedData['quantity'] > $inventoryItem->current_stock) {
            return redirect()->back()
                           ->withErrors(['quantity' => "Insufficient stock. Available: {$inventoryItem->current_stock} {$inventoryItem->unit_of_measure}"]);
        }

        try {
            $stockMovement = $inventoryItem->removeStock(
                $validatedData['quantity'],
                [
                    'reason' => $validatedData['reason'],
                    'notes' => $validatedData['notes'] ?? null,
                    'created_by' => $request->user()->id,
                ]
            );

            $remainingStock = $inventoryItem->fresh()->current_stock;

            return redirect()->back()
                           ->with('success', "Used {$validatedData['quantity']} {$inventoryItem->unit_of_measure} of '{$inventoryItem->name}'. Remaining: {$remainingStock} {$inventoryItem->unit_of_measure}");

        } catch (\Exception $e) {
            \Log::error('Use stock failed', [
                'inventory_item_id' => $inventoryItem->id,
                'error' => $e->getMessage(),
                'data' => $validatedData
            ]);

            return redirect()->back()
                           ->withErrors(['error' => 'Failed to use stock: ' . $e->getMessage()]);
        }
    }

    public function lowStockReport(Request $request)
    {
        $user = $request->user();
        
        $lowStockItems = InventoryItem::lowStock()
                                    ->with(['category', 'supplier'])
                                    ->orderBy('current_stock', 'asc')
                                    ->get();

        return Inertia::render('inventory/low-stock-report', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'lowStockItems' => $lowStockItems,
        ]);
    }
}