<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DiscountRuleController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MpesaController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/products/lookup/{barcode}', [ProductController::class, 'lookup']);
    Route::apiResource('products', ProductController::class);

    Route::post('/cart/calculate', [OrderController::class, 'calculateCart']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);

    Route::apiResource('customers', CustomerController::class);
    Route::post('/customers/{customer}/redeem-points', [CustomerController::class, 'redeemPoints']);

    Route::apiResource('discount-rules', DiscountRuleController::class)->middleware('role:admin,manager');
    Route::get('/reports/sales', [ReportController::class, 'sales'])->middleware('role:admin,manager');
    Route::get('/reports/low-stock', [ReportController::class, 'lowStock'])->middleware('role:admin,manager');

    Route::get('/inventory/alerts', [InventoryController::class, 'alerts']);
    Route::post('/mpesa/stkpush', [MpesaController::class, 'stkPush']);

    Route::apiResource('users', UserController::class)->middleware('role:admin');
    Route::post('/batches', [InventoryController::class, 'addBatch'])->middleware('role:admin,manager');
});

Route::middleware('auth:sanctum')->get('/transactions', [App\Http\Controllers\TransactionController::class, 'index']);
Route::middleware('auth:sanctum')->get('/transactions/{id}', [App\Http\Controllers\TransactionController::class, 'show']);


Route::middleware('auth:sanctum')->get('/reports/daily-sales', [App\Http\Controllers\ReportController::class, 'dailySales']);
Route::middleware('auth:sanctum')->get('/reports/weekly-sales', [App\Http\Controllers\ReportController::class, 'weeklySales']);
Route::middleware('auth:sanctum')->get('/reports/monthly-sales', [App\Http\Controllers\ReportController::class, 'monthlySales']);
Route::middleware('auth:sanctum')->get('/reports/top-products', [App\Http\Controllers\ReportController::class, 'topProducts']);
Route::middleware('auth:sanctum')->get('/reports/sales-by-category', [App\Http\Controllers\ReportController::class, 'salesByCategory']);
Route::middleware('auth:sanctum')->get('/reports/daily-sales', [App\Http\Controllers\ReportController::class, 'dailySales']);
Route::middleware('auth:sanctum')->get('/reports/weekly-sales', [App\Http\Controllers\ReportController::class, 'weeklySales']);
Route::middleware('auth:sanctum')->get('/reports/monthly-sales', [App\Http\Controllers\ReportController::class, 'monthlySales']);
Route::middleware('auth:sanctum')->get('/reports/top-products', [App\Http\Controllers\ReportController::class, 'topProducts']);
Route::middleware('auth:sanctum')->get('/reports/sales-by-category', [App\Http\Controllers\ReportController::class, 'salesByCategory']);
Route::middleware('auth:sanctum')->get('/settings', [App\Http\Controllers\SettingsController::class, 'index']);
Route::middleware('auth:sanctum')->post('/settings', [App\Http\Controllers\SettingsController::class, 'update'])->middleware('role:admin');
