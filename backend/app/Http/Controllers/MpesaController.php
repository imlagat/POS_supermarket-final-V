<?php
namespace App\Http\Controllers;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaController extends Controller
{
    public function stkPush(Request $request, MpesaService $mpesa)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'phone' => [
                'required',
                'string',
                'regex:/^(07|01|2547)\d{8}$/'
            ],
            'order_id' => 'required|string'
        ]);
        
        // Normalize phone number to 2547XXXXXXXX
        $phone = preg_replace('/[^0-9]/', '', $request->phone);
        if (substr($phone, 0, 1) === '0') {
            $phone = '254' . substr($phone, 1);
        } elseif (substr($phone, 0, 3) !== '254') {
            $phone = '254' . $phone;
        }
        
        $response = $mpesa->stkPush($request->amount, $phone, $request->order_id);
        
        if (isset($response['error'])) {
            return response()->json(['error' => $response['error']], 500);
        }
        
        if (isset($response['ResponseCode']) && $response['ResponseCode'] == '0') {
            return response()->json(['message' => 'STK push sent', 'checkout_id' => $response['CheckoutRequestID']]);
        }
        
        return response()->json(['error' => 'STK push failed', 'details' => $response], 500);
    }

    public function callback(Request $request)
    {
        Log::info('M-Pesa callback received', $request->all());
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);
    }
}
