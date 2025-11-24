<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;

class POSController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $orders = Order::with(['items.menuItem', 'creator'])
                       ->withCount('items')
                       ->select([
                           'id',
                           'order_number',
                           'customer_name',
                           'total_amount',
                           'order_status',
                           'order_type',
                           'payment_method',
                           'payment_status',
                           'mpesa_reference',
                           'created_at'
                       ])
                       ->latest()
                       ->paginate(20);
        
        $orders->getCollection()->transform(function ($order) {
            $order->items_count = $order->items_count;
            return $order;
        });
        
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

    public function getMenuItems(Request $request, $categoryId)
    {
        $menuItems = MenuItem::where('category_id', $categoryId)
                            ->where('is_available', true)
                            ->orderBy('sort_order')
                            ->orderBy('name')
                            ->get([
                                'id',
                                'name', 
                                'price',
                                'description',
                                'is_combo',
                                'preparation_time_minutes',
                                'image_url'
                            ]);

        return response()->json([
            'menu_items' => $menuItems
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        
        $order->load(['items.menuItem', 'creator', 'updater']);
        
        return Inertia::render('pos/show', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'order' => $order,
        ]);
    }

    public function edit(Request $request, Order $order)
    {
        $user = $request->user();
        
        // Load all necessary relationships
        $order->load(['items.menuItem', 'creator', 'updater']);
        
        // Transform the order to ensure all fields are present
        $orderData = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'order_type' => $order->order_type,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'subtotal' => (float) $order->subtotal,
            'tax_amount' => (float) $order->tax_amount,
            'discount_amount' => (float) $order->discount_amount,
            'total_amount' => (float) $order->total_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'mpesa_reference' => $order->mpesa_reference,
            'order_status' => $order->order_status,
            'kitchen_notes' => $order->kitchen_notes,
            'customer_notes' => $order->customer_notes,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'item_total' => (float) $item->item_total,
                    'special_instructions' => $item->special_instructions,
                    'menu_item' => [
                        'id' => $item->menuItem->id,
                        'name' => $item->menuItem->name,
                        'price' => (float) $item->menuItem->price,
                        'description' => $item->menuItem->description,
                    ]
                ];
            })
        ];
        
        \Log::info('Edit order data', ['order' => $orderData]);
        
        return Inertia::render('pos/edit', [
            'user' => ['name' => $user->name, 'email' => $user->email],
            'order' => $orderData,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validatedData = $request->validate([
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,mpesa',
            'payment_status' => 'required|in:pending,paid,failed,refunded',
            'mpesa_reference' => 'nullable|string|max:50',
            'order_status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled',
            'kitchen_notes' => 'nullable|string',
            'customer_notes' => 'nullable|string',
        ]);

        try {
            // If payment status is being changed to paid and no transaction ID exists
            if ($validatedData['payment_status'] === 'paid' && empty($validatedData['mpesa_reference'])) {
                $transactionId = $validatedData['payment_method'] === 'cash' 
                    ? 'CASH-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 8))
                    : 'MPESA-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 8));
                $validatedData['mpesa_reference'] = $transactionId;
            }

            $order->update([
                ...$validatedData,
                'updated_by_user_id' => $request->user()->id,
            ]);

            \Log::info('Order updated', [
                'order_id' => $order->id,
                'updated_by' => $request->user()->id,
                'changes' => $validatedData
            ]);

            return redirect()->route('pos.show', $order)
                           ->with('success', 'Order updated successfully!');

        } catch (\Exception $e) {
            \Log::error('Order update failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                           ->withErrors(['error' => 'Failed to update order: ' . $e->getMessage()])
                           ->withInput();
        }
    }

    public function store(Request $request)
    {
        \Log::info('Order creation attempt', [
            'user_id' => $request->user()->id,
            'request_data' => $request->all()
        ]);

        $validatedData = $request->validate([
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,mpesa',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string',
        ]);

        \Log::info('Validation passed', $validatedData);

        try {
            $order = Order::create([
                'order_type' => $validatedData['order_type'],
                'customer_name' => $validatedData['customer_name'],
                'customer_phone' => $validatedData['customer_phone'],
                'payment_method' => $validatedData['payment_method'],
                'payment_status' => 'paid',
                'order_status' => 'confirmed',
                'created_by_user_id' => $request->user()->id,
                'subtotal' => 0,
                'total_amount' => 0,
            ]);

            \Log::info('Order created', ['order_id' => $order->id]);

            foreach ($validatedData['items'] as $itemData) {
                $menuItem = MenuItem::find($itemData['menu_item_id']);
                
                $orderItem = $order->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $menuItem->price,
                    'special_instructions' => $itemData['special_instructions'] ?? null,
                ]);

                \Log::info('Order item created', ['order_item_id' => $orderItem->id]);
            }

            $order->calculateTotals();
            \Log::info('Order totals calculated', ['total' => $order->total_amount]);

            $transactionId = $validatedData['payment_method'] === 'cash' 
                ? 'CASH-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 8))
                : 'MPESA-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 8));

            $order->update(['mpesa_reference' => $transactionId]);

            return redirect()->route('pos.index')
                           ->with('success', "Order {$order->order_number} created successfully! Transaction ID: {$transactionId}")
                           ->with('order', $order->fresh()->load('items.menuItem'));

        } catch (\Exception $e) {
            \Log::error('Order creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                           ->withErrors(['error' => 'Failed to create order: ' . $e->getMessage()]);
        }
    }

    private function getCurrentCashSession($user)
    {
        return [
            'id' => 1,
            'start_time' => now()->startOfDay(),
            'starting_cash' => 5000,
            'current_cash' => 8230,
        ];
    }
}