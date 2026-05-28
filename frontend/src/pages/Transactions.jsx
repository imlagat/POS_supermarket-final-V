import { useEffect, useState } from 'react';
import api from '../services/api';
import { Receipt, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import ReceiptModal from '../components/POS/ReceiptModal';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      toast.error('Failed to load transactions');
    }
  };

  const filtered = transactions.filter(t =>
    t.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cashier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewReceipt = (transaction) => {
    setSelectedTransaction(transaction);
    setShowReceipt(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-amber-500" /> Transactions
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer, cashier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Order #</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Cashier</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Payment</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{t.order_number}</td>
                  <td className="p-4">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="p-4">{t.customer?.name || 'Walk-in'}</td>
                  <td className="p-4">{t.cashier?.name}</td>
                  <td className="p-4 text-amber-600 font-bold">Ksh {t.total_amount}</td>
                  <td className="p-4">
                    {t.payments.map(p => `${p.method.toUpperCase()} (Ksh ${p.amount})`).join(', ')}
                  </td>
                  <td className="p-4">
                    <button onClick={() => viewReceipt(t)} className="text-blue-600 hover:text-blue-800">
                      <Eye size={18} /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="text-center p-8 text-gray-400">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showReceipt && selectedTransaction && (
        <ReceiptModal
          order={selectedTransaction}
          changeAmount={0} // Change is not stored; we can omit
          discounts={[]}   // No discount breakdown stored in transaction
          pointsDiscount={0}
          customer={selectedTransaction.customer}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
