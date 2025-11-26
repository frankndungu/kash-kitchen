<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        try {
            // Calculate date ranges
            $today = Carbon::today();
            $startOfWeek = Carbon::now()->startOfWeek();
            $startOfMonth = Carbon::now()->startOfMonth();
            $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
            $lastWeekEnd = Carbon::now()->subWeek()->endOfWeek();
            $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
            $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

            // Today's stats
            $todayStats = Order::whereDate('created_at', $today)
                ->selectRaw('
                    COALESCE(SUM(total_amount), 0) as revenue,
                    COUNT(*) as orders,
                    COALESCE(AVG(total_amount), 0) as average_order
                ')
                ->first();

            // This week's stats
            $thisWeekStats = Order::where('created_at', '>=', $startOfWeek)
                ->selectRaw('
                    COALESCE(SUM(total_amount), 0) as revenue,
                    COUNT(*) as orders
                ')
                ->first();

            // Last week's stats for comparison
            $lastWeekStats = Order::whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])
                ->selectRaw('COALESCE(SUM(total_amount), 0) as revenue')
                ->first();

            // This month's stats
            $thisMonthStats = Order::where('created_at', '>=', $startOfMonth)
                ->selectRaw('
                    COALESCE(SUM(total_amount), 0) as revenue,
                    COUNT(*) as orders
                ')
                ->first();

            // Last month's stats for comparison
            $lastMonthStats = Order::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
                ->selectRaw('COALESCE(SUM(total_amount), 0) as revenue')
                ->first();

            // Calculate growth percentages
            $weekGrowth = $lastWeekStats->revenue > 0 
                ? (($thisWeekStats->revenue - $lastWeekStats->revenue) / $lastWeekStats->revenue) * 100 
                : 0;
            
            $monthGrowth = $lastMonthStats->revenue > 0 
                ? (($thisMonthStats->revenue - $lastMonthStats->revenue) / $lastMonthStats->revenue) * 100 
                : 0;

            // Sales stats structure
            $salesStats = [
                'today' => [
                    'revenue' => (float) $todayStats->revenue,
                    'orders' => (int) $todayStats->orders,
                    'average_order' => (float) $todayStats->average_order,
                ],
                'week' => [
                    'revenue' => (float) $thisWeekStats->revenue,
                    'orders' => (int) $thisWeekStats->orders,
                    'growth' => (float) $weekGrowth,
                ],
                'month' => [
                    'revenue' => (float) $thisMonthStats->revenue,
                    'orders' => (int) $thisMonthStats->orders,
                    'growth' => (float) $monthGrowth,
                ],
            ];

            // Top selling items (this month)
            $topItems = OrderItem::select([
                    'menu_items.name',
                    DB::raw('SUM(order_items.quantity) as quantity_sold'),
                    DB::raw('SUM(order_items.item_total) as revenue'),
                    'menu_items.price'
                ])
                ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.created_at', '>=', $startOfMonth)
                ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.price')
                ->orderByDesc('quantity_sold')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->name,
                        'quantity_sold' => (int) $item->quantity_sold,
                        'revenue' => (float) $item->revenue,
                        'price' => (float) $item->price,
                    ];
                });

            // Payment method breakdown (this month)
            $paymentStats = Order::where('created_at', '>=', $startOfMonth)
                ->selectRaw('
                    payment_method,
                    COUNT(*) as count,
                    SUM(total_amount) as amount
                ')
                ->groupBy('payment_method')
                ->get();

            $totalRevenue = $paymentStats->sum('amount');
            $cashStats = $paymentStats->where('payment_method', 'cash')->first();
            $mpesaStats = $paymentStats->where('payment_method', 'mpesa')->first();

            $paymentBreakdown = [
                'cash' => [
                    'amount' => (float) ($cashStats->amount ?? 0),
                    'count' => (int) ($cashStats->count ?? 0),
                    'percentage' => $totalRevenue > 0 ? (($cashStats->amount ?? 0) / $totalRevenue) * 100 : 0,
                ],
                'mpesa' => [
                    'amount' => (float) ($mpesaStats->amount ?? 0),
                    'count' => (int) ($mpesaStats->count ?? 0),
                    'percentage' => $totalRevenue > 0 ? (($mpesaStats->amount ?? 0) / $totalRevenue) * 100 : 0,
                ],
            ];

            // Recent orders (last 20)
            $recentOrders = Order::with('creator')
                ->select([
                    'id',
                    'order_number',
                    'customer_name',
                    'total_amount',
                    'payment_method',
                    'order_status',
                    'created_at'
                ])
                ->orderByDesc('created_at')
                ->limit(20)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'customer_name' => $order->customer_name,
                        'total_amount' => (float) $order->total_amount,
                        'payment_method' => $order->payment_method,
                        'order_status' => $order->order_status,
                        'created_at' => $order->created_at->toISOString(),
                    ];
                });

            return Inertia::render('sales-analytics', [
                'user' => ['name' => $user->name, 'email' => $user->email],
                'salesStats' => $salesStats,
                'topItems' => $topItems,
                'paymentBreakdown' => $paymentBreakdown,
                'recentOrders' => $recentOrders,
            ]);

        } catch (\Exception $e) {
            \Log::error('Sales analytics failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return empty data structure on error
            return Inertia::render('sales-analytics', [
                'user' => ['name' => $user->name, 'email' => $user->email],
                'salesStats' => [
                    'today' => ['revenue' => 0, 'orders' => 0, 'average_order' => 0],
                    'week' => ['revenue' => 0, 'orders' => 0, 'growth' => 0],
                    'month' => ['revenue' => 0, 'orders' => 0, 'growth' => 0],
                ],
                'topItems' => [],
                'paymentBreakdown' => [
                    'cash' => ['amount' => 0, 'count' => 0, 'percentage' => 0],
                    'mpesa' => ['amount' => 0, 'count' => 0, 'percentage' => 0],
                ],
                'recentOrders' => [],
            ]);
        }
    }
}