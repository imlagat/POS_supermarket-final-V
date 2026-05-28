<?php
namespace App\Http\Controllers;
use App\Models\Order;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        $orders = Order::with(['items.product', 'payments', 'customer', 'cashier'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $discounts = json_decode($order->discounts_applied, true);
                $order->discounts = $discounts['discounts'] ?? [];
                $order->points_discount = $discounts['points_discount'] ?? 0;
                return $order;
            });
        return response()->json($orders);
    }
    public function show($id)
    {
        $order = Order::with(['items.product', 'payments', 'customer', 'cashier'])->findOrFail($id);
        $discounts = json_decode($order->discounts_applied, true);
        $order->discounts = $discounts['discounts'] ?? [];
        $order->points_discount = $discounts['points_discount'] ?? 0;
        return response()->json($order);
    }
}
