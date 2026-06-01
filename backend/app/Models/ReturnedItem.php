<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ReturnedItem extends Model
{
    protected $table = 'returned_items';
    protected $fillable = ['return_id', 'product_id', 'quantity', 'condition', 'disposal_reason', 'open_box_price', 'status'];
    protected $casts = [
        'open_box_price' => 'decimal:2',
    ];
    public function returnRelation()
    {
        return $this->belongsTo(ReturnOrder::class, 'return_id');
    }
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
