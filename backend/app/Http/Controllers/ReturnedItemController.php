<?php
namespace App\Http\Controllers;
use App\Models\ReturnedItem;
use App\Models\Product;
use Illuminate\Http\Request;

class ReturnedItemController extends Controller
{
    public function index()
    {
        return ReturnedItem::with('product')->orderBy('created_at', 'desc')->get();
    }

    public function markOpenBox(Request $request, ReturnedItem $returnedItem)
    {
        $request->validate([
            'open_box_price' => 'required|numeric|min:0',
        ]);
        $returnedItem->update([
            'status' => 'open_box',
            'open_box_price' => $request->open_box_price,
            'condition' => 'open_box',
        ]);
        return response()->json(['message' => 'Item marked as open box', 'item' => $returnedItem]);
    }

    public function dispose(Request $request, ReturnedItem $returnedItem)
    {
        $request->validate([
            'disposal_reason' => 'required|string',
        ]);
        $returnedItem->update([
            'status' => 'disposed',
            'disposal_reason' => $request->disposal_reason,
        ]);
        return response()->json(['message' => 'Item disposed', 'item' => $returnedItem]);
    }
}
