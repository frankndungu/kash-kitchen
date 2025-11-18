<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access and configuration',
                'permissions' => [
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
                    'process_refunds'
                ],
                'is_active' => true
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager',
                'description' => 'Reports, inventory, cash reconciliation, menu management',
                'permissions' => [
                    'manage_menu',
                    'manage_inventory',
                    'view_reports',
                    'manage_cash_sessions',
                    'create_orders',
                    'update_order_status',
                    'cancel_orders',
                    'process_refunds',
                    'view_daily_sales',
                    'export_reports'
                ],
                'is_active' => true
            ],
            [
                'name' => 'cashier',
                'display_name' => 'Cashier',
                'description' => 'Order entry, basic functions, payment processing',
                'permissions' => [
                    'create_orders',
                    'update_order_status',
                    'view_menu',
                    'process_payments',
                    'view_own_orders',
                    'update_customer_info'
                ],
                'is_active' => true
            ],
            [
                'name' => 'kitchen_staff',
                'display_name' => 'Kitchen Staff',
                'description' => 'Order viewing, status updates, kitchen operations',
                'permissions' => [
                    'view_kitchen_orders',
                    'update_order_status',
                    'mark_items_ready',
                    'view_preparation_queue'
                ],
                'is_active' => true
            ]
        ];

        foreach ($roles as $roleData) {
            Role::create($roleData);
        }
    }
}
