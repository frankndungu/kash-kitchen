<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\Supplier;
use App\Models\StockMovement;
use App\Models\MenuItemIngredient;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get inventory items with enhanced data including stock movements
        $query = InventoryItem::with(['category', 'supplier'])
                              ->where('is_active', true);

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('supplier')) {
            $query->where('supplier_id', $request->supplier);
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'low_stock':
                    $query->whereColumn('current_stock', '<=', 'minimum_stock')
                          ->where('current_stock', '>', 0);
                    break;
                case 'out_of_stock':
                    $query->where('current_stock', '<=', 0);
                    break;
                case 'in_stock':
                    $query->whereColumn('current_stock', '>', 'minimum_stock');
                    break;
                case 'auto_deduct':
                    // Filter items that have linked menu items
                    if (class_exists(MenuItemIngredient::class)) {
                        $query->whereHas('menuItemIngredients');
                    }
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

        // Calculate stock movement data for CSV export format
        $this->addStockMovementData($inventoryItems);

        // Add linked menu items count to each inventory item
        $this->addLinkedMenuItemsCount($inventoryItems);

        // Get comprehensive statistics
        $stats = $this->calculateComprehensiveStats();

        // Get top suppliers by value
        $topSuppliers = $this->getTopSuppliers();

        // Get low stock items for alerts
        $lowStockItems = $this->getLowStockItems();

        // Get all categories and suppliers for filters
        $categories = InventoryCategory::where('is_active', true)->orderBy('name')->get();
        $suppliers = $this->getSuppliersWithCounts();

        return Inertia::render('inventory/index', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'inventoryItems' => $inventoryItems,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'stats' => $stats,
            'topSuppliers' => $topSuppliers,
            'lowStockItems' => $lowStockItems,
            'filters' => $request->only(['category', 'status', 'search', 'supplier']),
        ]);
    }

    /**
     * Add stock movement data for CSV export format
     * Calculates Opening Stock, Received, Used/Sold for current period
     */
    private function addStockMovementData($inventoryItems)
    {
        // Define period for calculations (current month)
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $inventoryItems->getCollection()->transform(function ($item) use ($startOfMonth, $endOfMonth) {
            // Calculate opening stock (stock at beginning of month)
            $openingStock = $this->calculateOpeningStock($item->id, $startOfMonth);
            
            // Calculate received stock (stock in movements this month)
            $stockReceived = $this->calculateStockReceived($item->id, $startOfMonth, $endOfMonth);
            
            // Calculate used/sold stock (stock out movements this month)
            $stockUsed = $this->calculateStockUsed($item->id, $startOfMonth, $endOfMonth);

            $item->opening_stock = $openingStock;
            $item->stock_received = $stockReceived;
            $item->stock_used = $stockUsed;

            return $item;
        });
    }

    /**
     * Calculate opening stock for an item at the beginning of period
     */
    private function calculateOpeningStock($itemId, $startDate)
    {
        // Get the last stock movement before the start date
        $lastMovement = StockMovement::where('inventory_item_id', $itemId)
                                   ->where('movement_date', '<', $startDate)
                                   ->orderBy('movement_date', 'desc')
                                   ->orderBy('id', 'desc')
                                   ->first();

        return $lastMovement ? $lastMovement->new_stock : 0;
    }

    /**
     * Calculate stock received (incoming) for an item in period
     */
    private function calculateStockReceived($itemId, $startDate, $endDate)
    {
        return StockMovement::where('inventory_item_id', $itemId)
                          ->where('movement_type', 'in')
                          ->whereBetween('movement_date', [$startDate, $endDate])
                          ->sum('quantity');
    }

    /**
     * Calculate stock used/sold (outgoing) for an item in period
     */
    private function calculateStockUsed($itemId, $startDate, $endDate)
    {
        return StockMovement::where('inventory_item_id', $itemId)
                          ->where('movement_type', 'out')
                          ->whereBetween('movement_date', [$startDate, $endDate])
                          ->sum('quantity');
    }

    /**
     * Add linked menu items count to inventory items
     */
    private function addLinkedMenuItemsCount($inventoryItems)
    {
        $inventoryItems->getCollection()->transform(function ($item) {
            // Check if MenuItemIngredient model exists and has the relationship
            if (class_exists(MenuItemIngredient::class) && method_exists($item, 'menuItemIngredients')) {
                $item->linked_menu_items = $item->menuItemIngredients()->count();
            } else {
                $item->linked_menu_items = 0;
            }
            return $item;
        });
    }

    /**
     * Calculate comprehensive statistics for dashboard
     */
    private function calculateComprehensiveStats()
    {
        $totalItems = InventoryItem::where('is_active', true)->count();
        $lowStockItems = InventoryItem::where('is_active', true)
                                    ->whereColumn('current_stock', '<=', 'minimum_stock')
                                    ->where('current_stock', '>', 0)
                                    ->count();
        $outOfStockItems = InventoryItem::where('is_active', true)
                                       ->where('current_stock', '<=', 0)
                                       ->count();
        
        // Calculate auto deduct items count
        $autoDeductItems = 0;
        if (class_exists(MenuItemIngredient::class)) {
            $autoDeductItems = InventoryItem::where('is_active', true)
                                           ->whereHas('menuItemIngredients')
                                           ->count();
        }
        
        // Calculate total inventory value
        $totalValue = InventoryItem::where('is_active', true)
                                  ->selectRaw('SUM(current_stock * unit_cost) as total')
                                  ->value('total') ?? 0;

        // Calculate average stock level percentage
        $avgStockLevel = InventoryItem::where('is_active', true)
                                    ->where('maximum_stock', '>', 0)
                                    ->selectRaw('AVG((current_stock / maximum_stock) * 100) as avg')
                                    ->value('avg') ?? 0;

        $totalSuppliers = Supplier::where('is_active', true)->count();

        return [
            'total_items' => $totalItems,
            'low_stock_items' => $lowStockItems,
            'out_of_stock_items' => $outOfStockItems,
            'total_value' => $totalValue,
            'auto_deduct_items' => $autoDeductItems,
            'avg_stock_level' => $avgStockLevel,
            'total_suppliers' => $totalSuppliers,
        ];
    }

    /**
     * Get top suppliers by total inventory value
     */
    private function getTopSuppliers()
    {
        return Supplier::where('is_active', true)
            ->with(['inventoryItems' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get()
            ->map(function ($supplier) {
                $totalValue = $supplier->inventoryItems->sum(function ($item) {
                    return $item->current_stock * $item->unit_cost;
                });

                return [
                    'name' => $supplier->name,
                    'items_count' => $supplier->inventoryItems->count(),
                    'total_value' => $totalValue,
                ];
            })
            ->sortByDesc('total_value')
            ->take(10) // Show more suppliers including those with no items
            ->values()
            ->toArray();
    }

    /**
     * Get suppliers with item counts for filters
     */
    private function getSuppliersWithCounts()
    {
        return Supplier::where('is_active', true)
            ->withCount(['inventoryItems' => function ($query) {
                $query->where('is_active', true);
            }])
            ->orderBy('name')
            ->get()
            ->filter(function ($supplier) {
                return $supplier->inventory_items_count > 0; // Filter in PHP instead of SQL
            })
            ->map(function ($supplier) {
                return [
                    'id' => $supplier->id,
                    'name' => $supplier->name,
                    'items_count' => $supplier->inventory_items_count,
                ];
            });
    }

    /**
     * Get low stock items for alerts with estimated days until stockout
     */
    private function getLowStockItems()
    {
        return InventoryItem::where('is_active', true)
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->where('current_stock', '>', 0)
            ->orderByRaw('(current_stock / minimum_stock) ASC')
            ->take(10)
            ->get()
            ->map(function ($item) {
                // Calculate estimated days until stockout
                $stockRatio = $item->minimum_stock > 0 ? $item->current_stock / $item->minimum_stock : 0;
                
                // Simple estimation: if we're at 50% of minimum stock, assume 7 days
                // This is a basic calculation - could be enhanced with actual consumption data
                $daysUntilStockout = max(1, round($stockRatio * 14));

                return [
                    'name' => $item->name,
                    'current_stock' => $item->current_stock,
                    'minimum_stock' => $item->minimum_stock,
                    'unit_of_measure' => $item->unit_of_measure,
                    'days_until_stockout' => $daysUntilStockout,
                ];
            })
            ->toArray();
    }

    // ... (rest of the controller methods remain the same as in the original)

    public function create(Request $request)
    {
        $user = $request->user();
        
        $categories = InventoryCategory::where('is_active', true)->orderBy('name')->get();
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
                'last_restocked' => $validatedData['current_stock'] > 0 ? now() : null,
            ]);

            // Create initial stock movement if current_stock > 0
            if ($validatedData['current_stock'] > 0) {
                StockMovement::create([
                    'inventory_item_id' => $inventoryItem->id,
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

            // Automatic ingredient mapping creation (if needed)
            $linkedCount = $this->createAutomaticIngredientMappings($inventoryItem);

            $message = "Inventory item '{$inventoryItem->name}' created successfully!";
            if ($linkedCount > 0) {
                $message .= " Auto-linked to {$linkedCount} menu items for automatic deduction.";
            }

            return redirect()->route('inventory.index')
                           ->with('success', $message);

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

    /**
     * Automatically create ingredient mappings for new inventory items
     */
    private function createAutomaticIngredientMappings(InventoryItem $inventoryItem)
    {
        // Check if MenuItemIngredient model exists
        if (!class_exists(MenuItemIngredient::class)) {
            return 0;
        }

        $itemName = strtolower($inventoryItem->name);
        $linkedCount = 0;
        
        // Define ingredient mappings based on item name patterns
        $ingredientMappings = $this->getIngredientMappingsForItem($itemName);
        
        foreach ($ingredientMappings as $menuItemName => $quantity) {
            // Find the menu item
            $menuItem = \App\Models\MenuItem::where('name', $menuItemName)->first();
            
            if ($menuItem) {
                // Check if mapping already exists
                $existingMapping = MenuItemIngredient::where([
                    'menu_item_id' => $menuItem->id,
                    'inventory_item_id' => $inventoryItem->id,
                ])->first();
                
                if (!$existingMapping) {
                    // Create the ingredient mapping
                    MenuItemIngredient::create([
                        'menu_item_id' => $menuItem->id,
                        'inventory_item_id' => $inventoryItem->id,
                        'quantity_used' => $quantity['amount'],
                        'unit' => $quantity['unit'],
                    ]);
                    
                    $linkedCount++;
                    \Log::info("Auto-linked {$inventoryItem->name} to {$menuItemName}");
                }
            }
        }
        
        return $linkedCount;
    }

    /**
     * Get ingredient mappings for a given inventory item name
     */
    private function getIngredientMappingsForItem(string $itemName)
    {
        $mappings = [];
        
        // Chicken mappings
        if (str_contains($itemName, 'chicken')) {
            $mappings = [
                '1/4 Chicken' => ['amount' => 1.0, 'unit' => 'pcs'],
                '1/2 Chicken' => ['amount' => 2.0, 'unit' => 'pcs'],
                'Full Chicken' => ['amount' => 4.0, 'unit' => 'pcs'],
                '1/4 Chicken + Chips Plain' => ['amount' => 1.0, 'unit' => 'pcs'],
                '1/4 Chicken + Garlic Chips' => ['amount' => 1.0, 'unit' => 'pcs'],
                '1/4 Chicken + Sauteed Chips' => ['amount' => 1.0, 'unit' => 'pcs'],
                '1/4 Chicken + Chips Masala' => ['amount' => 1.0, 'unit' => 'pcs'],
                '1/4 Chicken + Bhajia' => ['amount' => 1.0, 'unit' => 'pcs'],
                'Bhajia + 1/4 Chicken' => ['amount' => 1.0, 'unit' => 'pcs'],
            ];
        }
        
        // Potato mappings
        if (str_contains($itemName, 'potato')) {
            $mappings = [
                'Chips Plain' => ['amount' => 0.5, 'unit' => 'kg'],
                'Garlic Chips' => ['amount' => 0.5, 'unit' => 'kg'],
                'Chips Masala' => ['amount' => 0.5, 'unit' => 'kg'],
                'Sauteed Chips' => ['amount' => 0.5, 'unit' => 'kg'],
                'Bhajia' => ['amount' => 0.4, 'unit' => 'kg'],
                '1/4 Chicken + Chips Plain' => ['amount' => 0.4, 'unit' => 'kg'],
                '1/4 Chicken + Garlic Chips' => ['amount' => 0.4, 'unit' => 'kg'],
                '1/4 Chicken + Chips Masala' => ['amount' => 0.4, 'unit' => 'kg'],
                '1/4 Chicken + Sauteed Chips' => ['amount' => 0.4, 'unit' => 'kg'],
                '1/4 Chicken + Bhajia' => ['amount' => 0.3, 'unit' => 'kg'],
            ];
        }
        
        // Add more mappings as needed...
        
        return $mappings;
    }

    public function show(Request $request, InventoryItem $inventoryItem)
    {
        $user = $request->user();
        
        $inventoryItem->load(['category', 'supplier', 'creator']);
        
        // Get linked menu items with their usage quantities
        $linkedMenuItems = collect();
        if (class_exists(MenuItemIngredient::class) && method_exists($inventoryItem, 'menuItemIngredients')) {
            $linkedMenuItems = $inventoryItem->menuItemIngredients()
                                            ->with('menuItem')
                                            ->get()
                                            ->map(function ($ingredient) {
                                                return [
                                                    'id' => $ingredient->menuItem->id,
                                                    'name' => $ingredient->menuItem->name,
                                                    'quantity_used' => $ingredient->quantity_used,
                                                    'unit' => $ingredient->unit,
                                                ];
                                            });
        }

        $inventoryItem->linked_menu_items = $linkedMenuItems;
        
        // Get recent stock movements
        $stockMovements = StockMovement::where('inventory_item_id', $inventoryItem->id)
                                     ->with(['supplier', 'creator'])
                                     ->latest('movement_date')
                                     ->paginate(20);

        // Get stock movement statistics
        $movementStats = [
            'total_movements' => StockMovement::where('inventory_item_id', $inventoryItem->id)->count(),
            'total_stock_in' => StockMovement::where('inventory_item_id', $inventoryItem->id)
                                           ->where('movement_type', 'in')
                                           ->sum('quantity'),
            'total_stock_out' => StockMovement::where('inventory_item_id', $inventoryItem->id)
                                            ->where('movement_type', 'out')
                                            ->sum('quantity'),
            'this_month_movements' => StockMovement::where('inventory_item_id', $inventoryItem->id)
                                                 ->whereBetween('movement_date', [
                                                     Carbon::now()->startOfMonth(),
                                                     Carbon::now()->endOfMonth()
                                                 ])
                                                 ->count(),
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
        
        $categories = InventoryCategory::where('is_active', true)->orderBy('name')->get();
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
            $previousStock = $inventoryItem->current_stock;
            $newStock = $previousStock + $validatedData['quantity'];

            // Create stock movement record
            StockMovement::create([
                'inventory_item_id' => $inventoryItem->id,
                'movement_type' => 'in',
                'quantity' => $validatedData['quantity'],
                'unit_cost' => $validatedData['unit_cost'],
                'total_cost' => $validatedData['quantity'] * $validatedData['unit_cost'],
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reason' => 'purchase',
                'notes' => $validatedData['notes'] ?? null,
                'supplier_id' => $validatedData['supplier_id'] ?? null,
                'batch_number' => $validatedData['batch_number'] ?? null,
                'expiry_date' => $validatedData['expiry_date'] ?? null,
                'created_by' => $request->user()->id,
                'movement_date' => now(),
            ]);

            // Update inventory item
            $inventoryItem->update([
                'current_stock' => $newStock,
                'last_restocked' => now(),
                'updated_by' => $request->user()->id,
            ]);

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
            $previousStock = $inventoryItem->current_stock;
            $newStock = $previousStock - $validatedData['quantity'];

            // Create stock movement record
            StockMovement::create([
                'inventory_item_id' => $inventoryItem->id,
                'movement_type' => 'out',
                'quantity' => $validatedData['quantity'],
                'unit_cost' => $inventoryItem->unit_cost,
                'total_cost' => $validatedData['quantity'] * $inventoryItem->unit_cost,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reason' => $validatedData['reason'],
                'notes' => $validatedData['notes'] ?? null,
                'created_by' => $request->user()->id,
                'movement_date' => now(),
            ]);

            // Update inventory item
            $inventoryItem->update([
                'current_stock' => $newStock,
                'updated_by' => $request->user()->id,
            ]);

            return redirect()->back()
                           ->with('success', "Used {$validatedData['quantity']} {$inventoryItem->unit_of_measure} of '{$inventoryItem->name}'. Remaining: {$newStock} {$inventoryItem->unit_of_measure}");

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
        
        $lowStockItems = InventoryItem::where('is_active', true)
                                    ->whereColumn('current_stock', '<=', 'minimum_stock')
                                    ->with(['category', 'supplier'])
                                    ->orderBy('current_stock', 'asc')
                                    ->get();

        return Inertia::render('inventory/low-stock-report', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'lowStockItems' => $lowStockItems,
        ]);
    }

    /**
     * Get suppliers with item counts for filters
     */
    public function getSuppliers(Request $request)
    {
        $suppliers = Supplier::where('is_active', true)
            ->withCount(['inventoryItems' => function ($query) {
                $query->where('is_active', true);
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($supplier) {
                return [
                    'id' => $supplier->id,
                    'name' => $supplier->name,
                    'items_count' => $supplier->inventory_items_count,
                ];
            });

        return response()->json($suppliers);
    }

    /**
     * Get categories for filters
     */
    public function getCategories(Request $request)
    {
        $categories = InventoryCategory::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'color' => $category->color,
                ];
            });

        return response()->json($categories);
    }

    /**
     * Delete an inventory item and all its associated data
     */
    public function destroy(Request $request, InventoryItem $inventoryItem)
    {
        try {
            // Check if item has any stock movements (for safety)
            $movementCount = StockMovement::where('inventory_item_id', $inventoryItem->id)->count();
            
            // Check if item is linked to menu items (auto-deduction)
            $linkedMenuItems = 0;
            if (class_exists(MenuItemIngredient::class) && method_exists($inventoryItem, 'menuItemIngredients')) {
                $linkedMenuItems = $inventoryItem->menuItemIngredients()->count();
                // Delete the menu item links
                $inventoryItem->menuItemIngredients()->delete();
            }

            // Store item name for success message
            $itemName = $inventoryItem->name;

            // Delete all stock movements
            StockMovement::where('inventory_item_id', $inventoryItem->id)->delete();
            
            // Delete the inventory item itself
            $inventoryItem->delete();

            $message = "Inventory item '{$itemName}' deleted successfully!";
            if ($movementCount > 0) {
                $message .= " ({$movementCount} stock movements removed)";
            }
            if ($linkedMenuItems > 0) {
                $message .= " ({$linkedMenuItems} menu item links removed)";
            }

            return redirect()->route('inventory.index')
                           ->with('success', $message);

        } catch (\Exception $e) {
            \Log::error('Inventory item deletion failed', [
                'inventory_item_id' => $inventoryItem->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()
                           ->withErrors(['error' => 'Failed to delete inventory item: ' . $e->getMessage()]);
        }
    }
}