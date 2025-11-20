<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\MenuItem;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        return Inertia::render('dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'System Administrator' // We'll make this dynamic later
            ],
            'stats' => [
                'todaySales' => 12450,
                'ordersToday' => 47,
                'pendingOrders' => 3,
                'cashInDrawer' => 8230,
                'mpesaSales' => 4220,
                'lowStockCount' => 2,
            ],
            'recentOrders' => [
                [
                    'id' => 1,
                    'order_number' => 'K0001',
                    'customer_name' => 'John Doe',
                    'total_amount' => 450,
                    'order_status' => 'preparing',
                    'created_at' => now()->subMinutes(15)->toISOString(),
                    'items_summary' => '1/4 Chicken + Chips',
                ],
                [
                    'id' => 2,
                    'order_number' => 'K0002',
                    'customer_name' => null,
                    'total_amount' => 280,
                    'order_status' => 'ready',
                    'created_at' => now()->subMinutes(25)->toISOString(),
                    'items_summary' => '2pcs Wings + Garlic Chips',
                ]
            ],
            'topSellingItems' => [
                ['rank' => 1, 'name' => '1/4 Chicken + Chips Plain', 'orders_count' => 15, 'revenue' => 5250],
                ['rank' => 2, 'name' => 'Chips Masala', 'orders_count' => 12, 'revenue' => 2400],
                ['rank' => 3, 'name' => '2pcs Wings', 'orders_count' => 10, 'revenue' => 1600],
                ['rank' => 4, 'name' => 'African Tea', 'orders_count' => 8, 'revenue' => 400],
                ['rank' => 5, 'name' => 'Soda', 'orders_count' => 7, 'revenue' => 560],
            ]
        ]);
    }
}