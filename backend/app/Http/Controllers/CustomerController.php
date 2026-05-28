<?php
namespace App\Http\Controllers;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index() { return Customer::all(); }
    public function store(Request $request) { return Customer::create($request->all()); }
    public function show(Customer $customer) { return $customer; }
    public function update(Request $request, Customer $customer) { $customer->update($request->all()); return $customer; }
    public function destroy(Customer $customer) { $customer->delete(); return response()->noContent(); }
    public function redeemPoints(Request $request, Customer $customer)
    {
        $points = $request->points;
        if ($customer->points_balance >= $points) {
            $customer->decrement('points_balance', $points);
            return response()->json(['message' => 'Points redeemed', 'new_balance' => $customer->points_balance]);
        }
        return response()->json(['message' => 'Insufficient points'], 400);
    }
}
