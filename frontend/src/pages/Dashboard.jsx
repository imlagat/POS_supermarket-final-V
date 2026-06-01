import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { TrendingUp, ShoppingBag, Users as UsersIcon, Package, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PromotionsWidget from '../components/Dashboard/PromotionsWidget';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ total_sales: 0, orders: 0, customers: 0, products: 0 });
  const [weeklySales, setWeeklySales] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/reports/sales').then(res => {
      setStats(res.data);
      setWeeklySales(res.data.weekly_sales || []);
    }).catch(() => {});
    api.get('/inventory/alerts').then(res => setAlerts(res.data)).catch(() => {});
  }, []);

  const statCards = [
    { title: 'Total Sales', value: `Ksh ${stats.total_sales?.toLocaleString()}`, icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
    { title: 'Orders', value: stats.orders, icon: ShoppingBag, color: 'from-orange-500 to-red-500' },
    { title: 'Customers', value: stats.customers, icon: UsersIcon, color: 'from-amber-600 to-orange-600' },
    { title: 'Products', value: stats.products, icon: Package, color: 'from-yellow-600 to-amber-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`bg-gradient-to-r ${card.color} p-4 flex justify-between items-center`}>
                <div><p className="text-white/80 text-sm">{card.title}</p><p className="text-white text-2xl font-bold">{card.value}</p></div>
                <Icon className="w-8 h-8 text-white/60" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-amber-500" /> Weekly Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-amber-500" /> Low Stock & Expiry Alerts</h2>
          {alerts.length === 0 ? <p className="text-gray-500 text-center py-8">No alerts – all good! ✅</p> : alerts.map((alert, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border-l-4 border-amber-500 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div><p className="font-medium text-gray-800">{alert.product?.name}</p><p className="text-sm text-amber-600">{alert.type === 'low_stock' ? '⚠️ Below minimum stock' : '⏰ Expires within 7 days'}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <PromotionsWidget />
      </div>
    </div>
  );
}
