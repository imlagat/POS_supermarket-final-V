<?php
namespace App\Http\Controllers;
use App\Models\Product;
use App\Models\Batch;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function alerts()
    {
        // Low stock alerts (unique product)
        $lowStock = Product::whereColumn('stock_quantity', '<=', 'min_stock_threshold')
            ->get()
            ->map(fn($p) => [
                'product' => $p,
                'type' => 'low_stock',
                'message' => "Below minimum stock"
            ]);
        
        // Expiring alerts: group by product, show only once per product with earliest expiry date
        $expiringBatches = Batch::where('expiry_date', '<=', now()->addDays(7))
            ->where('expiry_date', '>', now())
            ->where('quantity', '>', 0)
            ->with('product')
            ->get();
        
        $expiringProducts = [];
        foreach ($expiringBatches as $batch) {
            $productId = $batch->product_id;
            if (!isset($expiringProducts[$productId])) {
                $expiringProducts[$productId] = [
                    'product' => $batch->product,
                    'type' => 'expiring',
                    'batch' => $batch,
                    'expiry_date' => $batch->expiry_date,
                    'message' => "Expires on " . \Carbon\Carbon::parse($batch->expiry_date)->format('d M Y')
                ];
            } else {
                // Keep the earliest expiry date
                if ($batch->expiry_date < $expiringProducts[$productId]['expiry_date']) {
                    $expiringProducts[$productId]['expiry_date'] = $batch->expiry_date;
                    $expiringProducts[$productId]['batch'] = $batch;
                    $expiringProducts[$productId]['message'] = "Expires on " . \Carbon\Carbon::parse($batch->expiry_date)->format('d M Y');
                }
            }
        }
        
        $expiring = array_values($expiringProducts);
        
        return response()->json($lowStock->merge($expiring));
    }
    
    public function addBatch(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'batch_number' => 'required|string|unique:batches,batch_number',
            'expiry_date' => 'required|date',
            'quantity' => 'required|integer|min:1'
        ]);
        
        // Auto-generate batch number if not provided
        $batchNumber = $request->batch_number ?: 'BATCH-' . $request->product_id . '-' . time();
        
        $batch = Batch::create([
            'product_id' => $request->product_id,
            'batch_number' => $batchNumber,
            'expiry_date' => $request->expiry_date,
            'quantity' => $request->quantity
        ]);
        
        $product = Product::find($request->product_id);
        $product->increment('stock_quantity', $request->quantity);
        
        return response()->json(['message' => 'Batch added successfully', 'batch' => $batch], 201);
    }
}
