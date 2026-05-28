<?php
namespace App\Http\Controllers;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Batch;
use App\Models\LoyaltyTransaction;
use App\Services\CartObject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Pipeline;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function calculateCart(Request $request)
    {
        $items = $request->input('items', []);
        $customerId = $request->input('customer_id');
        $cart = new CartObject($items, $customerId);
        try {
            $cart = Pipeline::send($cart)->through([\App\Pipelines\ApplyAllPromotions::class])->thenReturn();
        } catch (\Exception $e) {
            Log::error('Pipeline error: ' . $e->getMessage());
        }
        return response()->json([
            'subtotal' => (float) $cart->subtotal,
            'total' => (float) $cart->total,
            'discounts' => $cart->discounts,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Order store started', $request->all());
        $request->validate([
            'items' => 'required|array',
            'payments' => 'required|array',
            'customer_id' => 'nullable|exists:customers,id',
            'total' => 'required|numeric',
            'discounts' => 'nullable|array',
            'points_discount' => 'nullable|numeric'
        ]);

        try {
            // Start transaction to ensure all changes succeed or rollback
            \DB::beginTransaction();

            $order = Order::create([
                'order_number' => 'ORD-'.Str::upper(Str::random(8)),
                'customer_id' => $request->customer_id,
                'user_id' => auth()->id(),
                'total_amount' => $request->total,
                'status' => 'completed',
                'discounts_applied' => json_encode([
                    'discounts' => $request->discounts ?? [],
                    'points_discount' => $request->points_discount ?? 0
                ])
            ]);

            foreach ($request->items as $item) {
                // Create order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total' => $item['price'] * $item['quantity']
                ]);

                // Deduct stock from product's main quantity
                $product = Product::find($item['product_id']);
                if ($product) {
                    $product->decrement('stock_quantity', $item['quantity']);

                    // Deduct from batches (FIFO)
                    $remaining = $item['quantity'];
                    $batches = Batch::where('product_id', $product->id)
                        ->where('quantity', '>', 0)
                        ->orderBy('expiry_date', 'asc')
                        ->get();

                    foreach ($batches as $batch) {
                        if ($remaining <= 0) break;
                        $deduct = min($batch->quantity, $remaining);
                        $batch->decrement('quantity', $deduct);
                        $remaining -= $deduct;
                    }
                }
            }

            foreach ($request->payments as $payment) {
    $status = 'completed';
    $checkoutRequestId = null;

    // M-Pesa starts as pending — callback will mark it completed
    if ($payment['method'] === 'mpesa') {
        $status = 'pending';
        $checkoutRequestId = $payment['checkout_request_id'] ?? null;
    }

    Payment::create([
        'order_id'            => $order->id,
        'amount'              => $payment['amount'],
        'method'              => $payment['method'],
        'status'              => $status,
        'checkout_request_id' => $checkoutRequestId,
    ]);
}

            if ($request->customer_id) {
                $customer = Customer::find($request->customer_id);
                if ($customer) {
                    $pointsEarned = (int) floor($order->total_amount / 10);
                    if ($pointsEarned > 0) {
                        $customer->points_balance += $pointsEarned;
                        $customer->save(); // triggers observer for tier update
                        LoyaltyTransaction::create([
                            'customer_id' => $customer->id,
                            'points' => $pointsEarned,
                            'type' => 'earn',
                            'order_id' => $order->id,
                            'description' => 'Purchase at POS'
                        ]);
                    }
                }
            }

            \DB::commit();

            return response()->json(['order' => $order, 'message' => 'Sale completed'], 201);
        } catch (\Exception $e) {
            \DB::rollBack();
            Log::error('Order store failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to save order: ' . $e->getMessage()], 500);
        }
    }

    public function index()
    {
        if (auth()->user()->role === 'cashier') {
            return Order::where('user_id', auth()->id())->with('items.product', 'payments')->get();
        }
        return Order::with('items.product', 'payments', 'cashier')->get();
    }
}
