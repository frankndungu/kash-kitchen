<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\MenuManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard - All authenticated users can access
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // POS System - Only Admin, Manager, and Cashier can access
    Route::middleware('role:admin,manager,cashier')->group(function () {
        Route::get('pos', [POSController::class, 'index'])->name('pos.index');
        Route::get('pos/create', [POSController::class, 'create'])->name('pos.create');
        Route::post('pos', [POSController::class, 'store'])->name('pos.store');
        Route::get('pos/{order}', [POSController::class, 'show'])->name('pos.show');
        Route::get('pos/{order}/edit', [POSController::class, 'edit'])->name('pos.edit');
        Route::put('pos/{order}', [POSController::class, 'update'])->name('pos.update');
        Route::delete('pos/{order}', [POSController::class, 'destroy'])->name('pos.destroy');
        Route::get('pos/menu-items/{categoryId}', [POSController::class, 'getMenuItems'])->name('pos.menu-items');
        Route::post('pos/{order}/payment', [POSController::class, 'processPayment'])->name('pos.payment');

        // Quick status update - PATCH route for form submission
        Route::patch('pos/{order}/status', [POSController::class, 'updateOrderStatus'])->name('pos.updateStatus');
    });

    // Role Management - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::patch('/roles/users/{user}', [RoleController::class, 'updateUserRoles'])->name('roles.users.update');
    });

    // Inventory Management - Admin and Manager only
    Route::middleware('role:admin,manager')->group(function () {
        Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::get('inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
        Route::post('inventory', [InventoryController::class, 'store'])->name('inventory.store');
        Route::get('inventory/{inventoryItem}', [InventoryController::class, 'show'])->name('inventory.show');
        Route::get('inventory/{inventoryItem}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');
        Route::put('inventory/{inventoryItem}', [InventoryController::class, 'update'])->name('inventory.update');
        
        // Stock Management Actions
        Route::post('inventory/{inventoryItem}/add-stock', [InventoryController::class, 'addStock'])->name('inventory.add-stock');
        Route::post('inventory/{inventoryItem}/use-stock', [InventoryController::class, 'useStock'])->name('inventory.use-stock');

        // Reports
        Route::get('inventory/reports/low-stock', [InventoryController::class, 'lowStockReport'])->name('inventory.low-stock-report');

        // AJAX Endpoints for dynamic data fetching
        Route::post('/inventory/create-category', [InventoryController::class, 'createCategory'])->name('inventory.create-category');
        Route::get('/inventory/categories', [InventoryController::class, 'getCategories'])->name('inventory.get-categories');
        
        // Ingredient mapping management
        Route::post('/inventory/{inventoryItem}/ingredient-mappings', [InventoryController::class, 'updateIngredientMappings'])->name('inventory.update-ingredient-mappings');
        Route::get('/inventory/menu-items-for-mapping', [InventoryController::class, 'getMenuItemsForMapping'])->name('inventory.menu-items-for-mapping');
        Route::post('/inventory/suggested-mappings', [InventoryController::class, 'getSuggestedMappings'])->name('inventory.suggested-mappings');

        // Delete inventory item
        Route::delete('/inventory/{inventoryItem}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    });
    
    // Future routes ready for expansion:
    
    // Menu Management - Admin and Manager only
    Route::middleware('role:admin,manager')->group(function () {
        // Menu index page
        Route::get('/menu', [MenuManagementController::class, 'index'])->name('menu.index');
        
        // Create new menu item
        Route::get('/menu/create', [MenuManagementController::class, 'create'])->name('menu.create');
        Route::post('/menu', [MenuManagementController::class, 'store'])->name('menu.store');
        
        // Show, edit, update, delete specific menu item
        Route::get('/menu/{id}', [MenuManagementController::class, 'show'])->name('menu.show');
        Route::get('/menu/{id}/edit', [MenuManagementController::class, 'edit'])->name('menu.edit');
        Route::patch('/menu/{id}', [MenuManagementController::class, 'update'])->name('menu.update');
        Route::delete('/menu/{id}', [MenuManagementController::class, 'destroy'])->name('menu.destroy');
        
        // Toggle availability
        Route::patch('/menu/{id}/toggle', [MenuManagementController::class, 'toggleAvailability'])
             ->name('menu.toggle');
        
        Route::get('sales-analytics', [SalesController::class, 'index'])->name('sales-analytics');
    });
    
    // Reports - Admin and Manager only  
    Route::middleware('role:admin,manager')->group(function () {
        Route::get('reports', [ReportsController::class, 'index'])->name('reports');
    });
    
    // Kitchen Display - Kitchen Staff, Manager, Admin
    Route::middleware('role:admin,manager,kitchen_staff')->group(function () {
        Route::get('kitchen', [KitchenController::class, 'index'])->name('kitchen');
    });
    
    // User Management - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserManagementController::class);
    });
});

require __DIR__.'/settings.php';