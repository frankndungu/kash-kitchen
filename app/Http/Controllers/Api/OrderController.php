<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items.menuItem', 'creator'])
                     ->latest();

        // Role-based filtering
        $user = $request->user();
        if ($user->hasRole('cashier')) {
            $query->where('created_by_user_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('order_status', $request->status);
        }

        $orders = $query->paginate(20);

        return response()->json($orders);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled',
            'notes' => 'nullable|string'
        ]);

        $order->updateStatus(
            $request->status,
            $request->user()->id,
            $request->notes
        );

        return response()->json([
            'success' => true,
            'order' => $order->fresh(['items.menuItem', 'statusHistory.user']),
            'message' => 'Order status updated successfully'
        ]);
    }
}