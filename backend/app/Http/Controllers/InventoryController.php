<?php
namespace App\Http\Controllers;
use App\Models\Product;
use App\Models\Batch;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function alerts()
    {
        $lowStock = Product::whereColumn('stock_quantity', '<=', 'min_stock_threshold')
            ->get()
            ->map(fn($p) => ['product' => $p, 'type' => 'low_stock']);

        $expiring = Batch::where('expiry_date', '<=', now()->addDays(7))
            ->where('quantity', '>', 0)
            ->with('product')
            ->get()
            ->map(fn($b) => ['product' => $b->product, 'type' => 'expiring', 'batch' => $b]);

        return response()->json($lowStock->merge($expiring));
    }

    public function addBatch(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'expiry_date' => 'required|date',
            'quantity' => 'required|integer|min:1'
        ]);

        // Generate batch number automatically
        $batchNumber = 'BATCH-' . $request->product_id . '-' . time();
        $batch = Batch::create([
            'product_id' => $request->product_id,
            'batch_number' => $batchNumber,
            'expiry_date' => $request->expiry_date,
            'quantity' => $request->quantity
        ]);

        // Update product stock_quantity
        $product = Product::find($request->product_id);
        $product->increment('stock_quantity', $request->quantity);

        return response()->json([
            'message' => 'Batch added successfully',
            'batch' => $batch
        ], 201);
    }
}
