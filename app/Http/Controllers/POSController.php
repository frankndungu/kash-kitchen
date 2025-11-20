<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;

class POSController extends Controller
{
    // public function index(Request $request)
    // {
    //     // Check if user can access POS
    //     $user = $request->user();
    //     if (!$user->hasAnyRole(['admin', 'manager', 'cashier'])) {
    //         return redirect()->route('dashboard')
    //                        ->with('error', 'You do not have access to the POS system.');
    //     }

    //     // Get menu data
    //     $categories = Category::active()
    //                          ->ordered()
    //                          ->with(['activeMenuItems' => function ($query) {
    //                              $query->orderBy('sort_order')->orderBy('name');
    //                          }])
    //                          ->get();

    //     // Get current cash session info
    //     $currentCashSession = $this->getCurrentCashSession($user);

    //     return Inertia::render('POS/OrderInterface', [
    //         'user' => $user->load('roles'),
    //         'categories' => $categories,
    //         'currentCashSession' => $currentCashSession,
    //         'orderTypes' => ['dine_in', 'takeaway', 'delivery'],
    //         'paymentMethods' => ['cash', 'mpesa'],
    //     ]);
    // }
public function index(Request $request)
{
    $user = $request->user();
    
    $orders = Order::with(['items', 'creator'])
                   ->latest()
                   ->paginate(20);
    
    return Inertia::render('pos/index', [
        'user' => ['name' => $user->name, 'email' => $user->email],
        'orders' => $orders,
        'filters' => $request->only(['status', 'search']),
    ]);
}

public function create(Request $request)
{
    $user = $request->user();
    $categories = Category::active()->ordered()->with('activeMenuItems')->get();
    
    return Inertia::render('pos/create', [
        'user' => ['name' => $user->name, 'email' => $user->email],
        'categories' => $categories,
        'orderTypes' => ['dine_in', 'takeaway', 'delivery'],
        'paymentMethods' => ['cash', 'mpesa'],
    ]);
}
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'table_number' => 'nullable|string|max:10',
            'payment_method' => 'required|in:cash,mpesa',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string',
        ]);

        try {
            $order = Order::create([
                'order_type' => $validatedData['order_type'],
                'customer_name' => $validatedData['customer_name'],
                'customer_phone' => $validatedData['customer_phone'],
                'table_number' => $validatedData['table_number'],
                'payment_method' => $validatedData['payment_method'],
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'created_by_user_id' => $request->user()->id,
                'subtotal' => 0,
                'total_amount' => 0,
            ]);

            // Add order items
            foreach ($validatedData['items'] as $itemData) {
                $menuItem = MenuItem::find($itemData['menu_item_id']);
                
                $order->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $menuItem->price,
                    'special_instructions' => $itemData['special_instructions'],
                ]);
            }

            // Calculate totals
            $order->calculateTotals();

            return redirect()->back()
                           ->with('success', 'Order created successfully!')
                           ->with('order', $order->load('items.menuItem'));

        } catch (\Exception $e) {
            return redirect()->back()
                           ->with('error', 'Failed to create order: ' . $e->getMessage());
        }
    }

    private function getCurrentCashSession($user)
    {
        // This would check for active cash session
        // For demo, return sample data
        return [
            'id' => 1,
            'start_time' => now()->startOfDay(),
            'starting_cash' => 5000,
            'current_cash' => 8230,
        ];
    }
}