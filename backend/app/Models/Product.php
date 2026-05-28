<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Product extends Model
{
    protected $fillable = [
        'name', 'sku', 'barcode', 'category', 'base_price',
        'stock_quantity', 'min_stock_threshold', 'selling_by_weight',
        'weight_in_grams', 'unit'
    ];

    public function batches() { return $this->hasMany(Batch::class); }
    public function alternativeUnits() { return $this->hasMany(AlternativeUnit::class); }

    public function getCurrentStockAttribute() {
        return $this->batches()->sum('quantity');
    }

    public static function findByBarcode($barcode) {
        return Cache::remember('product_barcode_'.$barcode, 3600, function() use ($barcode) {
            return self::where('barcode', $barcode)->first();
        });
    }
}
