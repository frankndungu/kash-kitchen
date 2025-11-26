<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        try {
            $today = Carbon::today();
            
            // Today's operational stats
            $todayStats = [
                'sales' => Order::whereDate('created_at', $today)->sum('total_amount') ?? 0,
                'orders' => Order::whereDate('created_at', $today)->count(),
                'cashTotal' => Order::whereDate('created_at', $today)
                                   ->where('payment_method', 'cash')
                                   ->sum('total_amount') ?? 0,
                'mpesaTotal' => Order::whereDate('created_at', $today)
                                     ->where('payment_method', 'mpesa')
                                     ->sum('total_amount') ?? 0,
            ];

            // Active orders (not completed)
            $activeOrders = Order::whereIn('order_status', ['confirmed', 'preparing', 'ready'])
                                 ->orderBy('created_at', 'asc')
                                 ->limit(10)
                                 ->get()
                                 ->map(function ($order) {
                                     $timeElapsed = Carbon::parse($order->created_at)->diffInMinutes(now());
                                     return [
                                         'id' => $order->id,
                                         'order_number' => $order->order_number,
                                         'customer_name' => $order->customer_name,
                                         'total_amount' => (float) $order->total_amount,
                                         'order_status' => $order->order_status,
                                         'created_at' => $order->created_at->toISOString(),
                                         'items_count' => $order->items()->count(),
                                         'time_elapsed' => $timeElapsed,
                                     ];
                                 });

            // Critical operational alerts
            $criticalAlerts = [
                'lowStockCount' => InventoryItem::lowStock()->count(),
                'outOfStockCount' => InventoryItem::outOfStock()->count(),
                'pendingOrders' => Order::where('order_status', 'confirmed')->count(),
                'longWaitOrders' => $activeOrders->where('time_elapsed', '>', 30)->count(),
            ];

            // Quick operational stats
            $quickStats = [
                'averageOrderTime' => 15, // You can calculate this from historical data
                'peakHourSales' => Order::whereDate('created_at', $today)
                                       ->whereBetween('created_at', [
                                           $today->copy()->setHour(12),
                                           $today->copy()->setHour(14)
                                       ])
                                       ->sum('total_amount') ?? 0,
                'staffOnDuty' => 4, // You can get this from user sessions or staff table
                'inventoryValue' => InventoryItem::active()
                                                ->selectRaw('SUM(current_stock * unit_cost) as total')
                                                ->value('total') ?? 0,
            ];

            return Inertia::render('dashboard', [
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => ucfirst($user->roles->first()->name ?? 'User'),
                ],
                'todayStats' => $todayStats,
                'activeOrders' => $activeOrders,
                'criticalAlerts' => $criticalAlerts,
                'quickStats' => $quickStats,
            ]);

        } catch (\Exception $e) {
            \Log::error('Dashboard failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);

            // Return safe defaults on error
            return Inertia::render('dashboard', [
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'User',
                ],
                'todayStats' => [
                    'sales' => 0,
                    'orders' => 0,
                    'cashTotal' => 0,
                    'mpesaTotal' => 0,
                ],
                'activeOrders' => [],
                'criticalAlerts' => [
                    'lowStockCount' => 0,
                    'outOfStockCount' => 0,
                    'pendingOrders' => 0,
                    'longWaitOrders' => 0,
                ],
                'quickStats' => [
                    'averageOrderTime' => 0,
                    'peakHourSales' => 0,
                    'staffOnDuty' => 0,
                    'inventoryValue' => 0,
                ],
            ]);
        }
    }
}