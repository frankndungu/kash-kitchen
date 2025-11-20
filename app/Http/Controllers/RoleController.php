<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('admin')) {
            return redirect()->route('dashboard')
                           ->with('error', 'Only administrators can manage user roles.');
        }

        $users = User::with('roles')->get();
        $roles = Role::all();

        return Inertia::render('roles/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function edit(Request $request, Role $role)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return redirect()->route('dashboard')
                           ->with('error', 'Only administrators can edit roles.');
        }

        // Get all available permissions
        $availablePermissions = [
            'manage_users',
            'manage_roles',
            'manage_menu',
            'manage_inventory',
            'view_reports',
            'manage_cash_sessions',
            'system_settings',
            'create_orders',
            'update_order_status',
            'cancel_orders',
            'process_refunds',
            'process_payments',
            'view_own_orders',
            'update_customer_info',
            'view_kitchen_orders',
            'mark_items_ready',
            'view_preparation_queue',
            'view_daily_sales',
            'export_reports'
        ];

        return Inertia::render('roles/edit', [
            'role' => $role,
            'availablePermissions' => $availablePermissions,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return redirect()->route('dashboard')
                           ->with('error', 'Only administrators can update roles.');
        }

        $validated = $request->validate([
            'display_name' => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'permissions' => 'array',
            'permissions.*' => 'string',
            'is_active' => 'boolean'
        ]);

        $role->update($validated);

        return redirect()->route('roles.index')
                       ->with('success', 'Role updated successfully!');
    }

    public function updateUserRoles(Request $request, User $user)
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'role_ids' => 'array',
            'role_ids.*' => 'exists:roles,id'
        ]);

        $user->roles()->sync($validated['role_ids'] ?? []);

        return redirect()->back()
                       ->with('success', 'User roles updated successfully!');
    }
}