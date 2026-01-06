<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        try {
            // Check if user has admin/manager role
            $canViewSales = $user->hasAnyRole(['admin', 'manager']);
            
            // Set proper timezone and date ranges
            $today = Carbon::now()->startOfDay();
            $todayEnd = Carbon::now()->endOfDay();
            
            Log::info('Dashboard loading', [
                'user_id' => $user->id,
                'can_view_sales' => $canViewSales,
                'today_start' => $today->toDateTimeString(),
                'today_end' => $todayEnd->toDateTimeString(),
            ]);

            // Get today's basic stats with proper date filtering
            $todaySales = Order::whereBetween('created_at', [$today, $todayEnd])
                             ->sum('total_amount') ?? 0;
                             
            $ordersToday = Order::whereBetween('created_at', [$today, $todayEnd])
                              ->count();
                              
            $pendingOrders = Order::whereIn('order_status', ['pending', 'confirmed', 'preparing'])
                                  ->count();

            // Payment method breakdowns for today
            $cashTotal = Order::whereBetween('created_at', [$today, $todayEnd])
                             ->where('payment_method', 'cash')
                             ->sum('total_amount') ?? 0;
                             
            $mpesaTotal = Order::whereBetween('created_at', [$today, $todayEnd])
                              ->where('payment_method', 'mpesa')
                              ->sum('total_amount') ?? 0;

            // Low stock count
            $lowStockCount = InventoryItem::whereColumn('current_stock', '<=', 'minimum_stock')
                                        ->where('track_stock', true)
                                        ->where('is_active', true)
                                        ->count();

            // Peak hour calculation
            $peakHour = $this->getPeakHour($today, $todayEnd);

            // Build stats object - hide sales data from cashiers
            $stats = [
                'todaySales' => $canViewSales ? (float) $todaySales : null,
                'ordersToday' => (int) $ordersToday,
                'pendingOrders' => (int) $pendingOrders,
                'cashInDrawer' => $canViewSales ? (float) $cashTotal : null,
                'mpesaSales' => $canViewSales ? (float) $mpesaTotal : null,
                'lowStockCount' => (int) $lowStockCount,
                'averageOrderTime' => 15, // Static for now
                'peakHour' => $peakHour,
                'canViewSales' => $canViewSales,
            ];

            Log::info('Stats calculated', $stats);

            // Get active orders (limited to 5)
            $activeOrders = Order::with(['items.menuItem'])
                                 ->whereIn('order_status', ['pending', 'confirmed', 'preparing', 'ready'])
                                 ->orderBy('created_at', 'asc')
                                 ->limit(5)
                                 ->get()
                                 ->map(function ($order) {
                                     // FIXED: Proper time elapsed calculation
                                     $timeElapsed = $this->formatTimeElapsed($order->created_at);
                                     
                                     // Create items summary
                                     $itemsSummary = '';
                                     if ($order->items && $order->items->count() > 0) {
                                         $itemNames = $order->items->take(2)->pluck('menuItem.name')->filter()->toArray();
                                         $itemsSummary = implode(', ', $itemNames);
                                         if ($order->items->count() > 2) {
                                             $itemsSummary .= ' +' . ($order->items->count() - 2) . ' more';
                                         }
                                     }
                                     
                                     return [
                                         'id' => $order->id,
                                         'order_number' => $order->order_number,
                                         'customer_name' => $order->customer_name ?? 'Walk-in Customer',
                                         'total_amount' => (float) $order->total_amount,
                                         'order_status' => $order->order_status,
                                         'created_at' => $order->created_at->toISOString(),
                                         'items_summary' => $itemsSummary ?: 'No items',
                                         'time_elapsed' => Carbon::parse($order->created_at)->diffInMinutes(now()), // Minutes for priority calculation
                                         'time_elapsed_display' => $timeElapsed, // Human readable format
                                     ];
                                 });

            Log::info('Active orders fetched', ['count' => $activeOrders->count()]);

            // Get recent orders (last 10 regardless of date)
            $recentOrders = Order::with(['items.menuItem'])
                                 ->orderBy('created_at', 'desc')
                                 ->limit(10)
                                 ->get()
                                 ->map(function ($order) {
                                     // FIXED: Proper time elapsed calculation
                                     $timeElapsed = $this->formatTimeElapsed($order->created_at);
                                     
                                     // Create items summary
                                     $itemsSummary = '';
                                     if ($order->items && $order->items->count() > 0) {
                                         $itemNames = $order->items->take(2)->pluck('menuItem.name')->filter()->toArray();
                                         $itemsSummary = implode(', ', $itemNames);
                                         if ($order->items->count() > 2) {
                                             $itemsSummary .= ' +' . ($order->items->count() - 2) . ' more';
                                         }
                                     }
                                     
                                     return [
                                         'id' => $order->id,
                                         'order_number' => $order->order_number,
                                         'customer_name' => $order->customer_name ?? 'Walk-in Customer',
                                         'total_amount' => (float) $order->total_amount,
                                         'order_status' => $order->order_status,
                                         'created_at' => $order->created_at->toISOString(),
                                         'items_summary' => $itemsSummary ?: 'No items',
                                         'time_elapsed' => Carbon::parse($order->created_at)->diffInMinutes(now()),
                                         'time_elapsed_display' => $timeElapsed, // Human readable format
                                     ];
                                 });

            Log::info('Recent orders fetched', ['count' => $recentOrders->count()]);

            // Calculate critical alerts (but won't display them in UI)
            $longWaitOrders = $activeOrders->where('time_elapsed', '>', 30)->count();
            $urgentOrders = $activeOrders->where('time_elapsed', '>', 20)->count();
            $firstLongWaitOrder = $activeOrders->where('time_elapsed', '>', 30)->first();

            $criticalAlerts = [
                'longWaitOrders' => (int) $longWaitOrders,
                'urgentOrders' => (int) $urgentOrders,
                'firstLongWaitOrderId' => $firstLongWaitOrder ? $firstLongWaitOrder['id'] : null,
                'lowStockItems' => (int) $lowStockCount,
                'systemIssues' => 0,
            ];

            // Get top selling items - try today first, then expand if no data
            $topSellingItems = collect();
            
            // First try today's data
            $todayTopSelling = DB::table('order_items')
                                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                                ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
                                ->whereBetween('orders.created_at', [$today, $todayEnd])
                                ->select(
                                    'menu_items.name',
                                    DB::raw('SUM(order_items.quantity) as total_quantity'),
                                    DB::raw('COUNT(DISTINCT orders.id) as orders_count'),
                                    DB::raw('SUM(order_items.item_total) as revenue')
                                )
                                ->groupBy('menu_items.id', 'menu_items.name')
                                ->orderBy('revenue', 'desc')
                                ->limit(5)
                                ->get();

            if ($todayTopSelling->count() > 0) {
                $topSellingItems = $todayTopSelling;
            } else {
                // Fallback to last 7 days if no sales today
                $weekAgo = Carbon::now()->subDays(7);
                $topSellingItems = DB::table('order_items')
                                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                                    ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
                                    ->where('orders.created_at', '>=', $weekAgo)
                                    ->select(
                                        'menu_items.name',
                                        DB::raw('SUM(order_items.quantity) as total_quantity'),
                                        DB::raw('COUNT(DISTINCT orders.id) as orders_count'),
                                        DB::raw('SUM(order_items.item_total) as revenue')
                                    )
                                    ->groupBy('menu_items.id', 'menu_items.name')
                                    ->orderBy('revenue', 'desc')
                                    ->limit(5)
                                    ->get();
            }

            // Format top selling items
            $formattedTopSelling = $topSellingItems->map(function ($item, $index) {
                return [
                    'rank' => $index + 1,
                    'name' => $item->name,
                    'orders_count' => (int) $item->orders_count,
                    'revenue' => (float) $item->revenue,
                ];
            });

            Log::info('Top selling items fetched', ['count' => $formattedTopSelling->count()]);

            Log::info('Dashboard data prepared successfully');

            return Inertia::render('dashboard', [
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => ucfirst($user->roles->first()->name ?? 'User'),
                ],
                'stats' => $stats,
                'activeOrders' => $activeOrders->values()->toArray(),
                'recentOrders' => $recentOrders->values()->toArray(),
                'criticalAlerts' => $criticalAlerts,
                'topSellingItems' => $formattedTopSelling->values()->toArray(),
            ]);

        } catch (\Exception $e) {
            Log::error('Dashboard data fetch failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return safe defaults with error handling
            return Inertia::render('dashboard', [
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'User',
                ],
                'stats' => [
                    'todaySales' => null,
                    'ordersToday' => 0,
                    'pendingOrders' => 0,
                    'cashInDrawer' => null,
                    'mpesaSales' => null,
                    'lowStockCount' => 0,
                    'averageOrderTime' => 0,
                    'peakHour' => 'N/A',
                    'canViewSales' => false,
                ],
                'activeOrders' => [],
                'recentOrders' => [],
                'criticalAlerts' => [
                    'longWaitOrders' => 0,
                    'urgentOrders' => 0,
                    'firstLongWaitOrderId' => null,
                    'lowStockItems' => 0,
                    'systemIssues' => 1, // Indicate there's a system issue
                ],
                'topSellingItems' => [],
                'error' => $e->getMessage(), // Add error for debugging
            ]);
        }
    }

    /**
     * Format time elapsed in a human-readable way
     */
    private function formatTimeElapsed($createdAt)
    {
        $diffInMinutes = Carbon::parse($createdAt)->diffInMinutes(now());
        
        if ($diffInMinutes < 1) {
            return 'Just now';
        } elseif ($diffInMinutes < 60) {
            return $diffInMinutes . 'm ago';
        } elseif ($diffInMinutes < 1440) { // Less than 24 hours
            $hours = floor($diffInMinutes / 60);
            return $hours . 'h ago';
        } else { // More than 24 hours
            $days = floor($diffInMinutes / 1440);
            return $days . 'd ago';
        }
    }

    private function getPeakHour($today, $todayEnd)
    {
        try {
            $hourlyStats = Order::whereBetween('created_at', [$today, $todayEnd])
                               ->select(DB::raw('HOUR(created_at) as hour, COUNT(*) as orders_count'))
                               ->groupBy('hour')
                               ->orderBy('orders_count', 'desc')
                               ->first();

            if ($hourlyStats && $hourlyStats->orders_count > 0) {
                return sprintf('%02d:00', $hourlyStats->hour);
            }

            return 'N/A';
        } catch (\Exception $e) {
            Log::error('Peak hour calculation failed', ['error' => $e->getMessage()]);
            return 'N/A';
        }
    }
}