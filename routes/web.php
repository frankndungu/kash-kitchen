<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\RoleController;
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
        Route::resource('pos', POSController::class);
    });

    // Role Management - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::patch('/roles/users/{user}', [RoleController::class, 'updateUserRoles'])->name('roles.users.update');
    });
    
    // Future routes ready for expansion:
    
    // Menu Management - Admin and Manager only
    // Route::middleware('role:admin,manager')->group(function () {
    //     Route::resource('menu', MenuManagementController::class);
    // });
    
    // Reports - Admin and Manager only  
    // Route::middleware('role:admin,manager')->group(function () {
    //     Route::get('reports', [ReportsController::class, 'index'])->name('reports');
    // });
    
    // Kitchen Display - Kitchen Staff, Manager, Admin
    // Route::middleware('role:admin,manager,kitchen_staff')->group(function () {
    //     Route::get('kitchen', [KitchenController::class, 'index'])->name('kitchen');
    // });
    
    // User Management - Admin only
    // Route::middleware('role:admin')->group(function () {
    //     Route::resource('users', UserManagementController::class);
    // });
});

require __DIR__.'/settings.php';