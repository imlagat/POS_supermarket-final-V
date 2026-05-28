import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ReceiptModal({ order, changeAmount, discounts = [], pointsDiscount = 0, customer = null, onClose }) {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/transactions/${order.id}`);
        setOrderDetails(res.data);
      } catch (err) {
        setOrderDetails(order);
      }
    };
    fetchDetails();
  }, [order]);

  const printReceipt = () => window.print();

  if (!orderDetails) return <div className="p-6">Loading receipt...</div>;

  const toFixedSafe = (value, digits = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(digits);
  };

  // Use the passed discounts (from cart calculation) – they are already applied
  const subtotalBeforeDiscounts = parseFloat(orderDetails.total_amount) + discounts.reduce((sum, d) => sum + parseFloat(d.amount), 0) + parseFloat(pointsDiscount);
  const vat = subtotalBeforeDiscounts * 0.16;
  const finalTotal = parseFloat(orderDetails.total_amount);
  const mpesaPayment = orderDetails.payments?.find(p => p.method === 'mpesa');
  const mpesaCode = mpesaPayment?.reference || mpesaPayment?.checkout_request_id;
  const customerPhone = orderDetails.customer?.phone || (customer?.phone) || 'Walk-in';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto font-mono text-sm">
        {/* Remove the extra header bar – no "Receipt" title, just a close button */}
        <div className="sticky top-0 bg-white z-10 flex justify-end p-2 border-b">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">✖</button>
        </div>

        <div className="px-4 pb-4" id="receipt-content">
          {/* Header - SUPER POS */}
          <div className="text-center border-b pb-3 mb-3">
            <h1 className="text-xl font-bold text-amber-600">SUPER POS</h1>
            <p className="text-xs text-gray-500">P.O Box 20100 Nakuru</p>
            <p className="text-xs text-gray-500">Kenyatta Avenue</p>
            <p className="text-xs text-gray-500">Tel: +254 700 123 456</p>
            <p className="text-xs font-mono mt-2">RECEIPT # {orderDetails.order_number}</p>
            <p className="text-xs">DATE: {new Date(orderDetails.created_at).toLocaleDateString()}</p>
            <p className="text-xs">TIME: {new Date(orderDetails.created_at).toLocaleTimeString()}</p>
            <p className="text-xs">CASHIER: {orderDetails.cashier?.name}</p>
            <p className="text-xs">TERMINAL: POS-01</p>
          </div>

          {/* Customer info */}
          <div className="mb-3 text-xs border-b pb-2">
            <p><strong>Customer:</strong> {customerPhone}</p>
            {orderDetails.customer?.points_balance !== undefined && (
              <p><strong>Points:</strong> {orderDetails.customer.points_balance} pts</p>
            )}
          </div>

          {/* Items table */}
          <table className="w-full text-xs mb-4">
            <thead className="border-b">
              <tr><th className="text-left">QTY</th><th className="text-left">ITEM</th><th className="text-right">UNIT</th><th className="text-right">TOTAL</th></tr>
            </thead>
            <tbody>
              {orderDetails.items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">{item.quantity}</td>
                  <td className="py-1">{item.product?.name}</td>
                  <td className="text-right">Ksh {toFixedSafe(item.unit_price)}</td>
                  <td className="text-right">Ksh {toFixedSafe(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals with promotions */}
          <div className="border-t pt-2 space-y-1 text-xs">
            <div className="flex justify-between"><span>SUBTOTAL</span><span>Ksh {toFixedSafe(subtotalBeforeDiscounts)}</span></div>
            {discounts.map((d, idx) => (
              <div key={idx} className="flex justify-between text-green-600">
                <span>{d.name}</span>
                <span>- Ksh {toFixedSafe(d.amount)}</span>
              </div>
            ))}
            {pointsDiscount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Points redeemed</span>
                <span>- Ksh {toFixedSafe(pointsDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between"><span>VAT @ 16%</span><span>Ksh {toFixedSafe(vat)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>TOTAL DUE</span>
              <span>Ksh {toFixedSafe(finalTotal)}</span>
            </div>
            {orderDetails.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>PAYMENT METHOD: {p.method.toUpperCase()}</span>
                <span>Ksh {toFixedSafe(p.amount)}</span>
              </div>
            ))}
            {mpesaCode && <div className="flex justify-between text-xs"><span>TRANSACTION ID:</span><span>{mpesaCode}</span></div>}
            {changeAmount > 0 && <div className="flex justify-between text-green-600"><span>CHANGE</span><span>Ksh {toFixedSafe(changeAmount)}</span></div>}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4 mt-4">
            <p>THANK YOU FOR SHOPPING WITH SUPER POS!</p>
            <p className="mt-1">Goods once sold are non-refundable.</p>
            <p>Keep this for your records.</p>
          </div>
        </div>

        <div className="p-3 border-t flex gap-3 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2 border rounded-xl">Close</button>
          <button onClick={printReceipt} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-xl">Print Receipt</button>
        </div>
      </div>
    </div>
  );
}
