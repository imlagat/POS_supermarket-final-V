import { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, ShoppingBag, Package, AlertCircle, Calendar, DollarSign } from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily');
  const [daily, setDaily] = useState({ sales: 0, orders: 0 });
  const [weekly, setWeekly] = useState({ sales: 0, orders: 0 });
  const [monthly, setMonthly] = useState({ sales: 0, orders: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weeklyTrend, setWeeklyTrend] = useState([]);

  const COLORS = ['#f97316', '#ea580c', '#f59e0b', '#d97706', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [dailyRes, weeklyRes, monthlyRes, topRes, categoryRes, lowStockRes, weeklyTrendRes] = await Promise.all([
        api.get('/reports/daily-sales'),
        api.get('/reports/weekly-sales'),
        api.get('/reports/monthly-sales'),
        api.get('/reports/top-products?limit=5'),
        api.get('/reports/sales-by-category'),
        api.get('/reports/low-stock'),
        api.get('/reports/sales')
      ]);
      setDaily(dailyRes.data);
      setWeekly(weeklyRes.data);
      setMonthly(monthlyRes.data);
      setTopProducts(topRes.data);
      setSalesByCategory(categoryRes.data);
      setLowStock(lowStockRes.data);
      setWeeklyTrend(weeklyTrendRes.data.weekly_sales || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentData = activeTab === 'daily' ? daily : activeTab === 'weekly' ? weekly : monthly;
  const periodLabel = activeTab === 'daily' ? 'Today' : activeTab === 'weekly' ? 'This Week' : 'This Month';

  if (loading) return <div className="flex justify-center items-center h-64">Loading reports...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <TrendingUp className="text-amber-500" /> Sales Reports
      </h1>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['daily', 'weekly', 'monthly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-sm font-semibold rounded-t-lg transition ${activeTab === tab ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {tab === 'daily' ? 'Daily' : tab === 'weekly' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
      </div>

      {/* Period Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Total Sales ({periodLabel})</p><p className="text-2xl font-bold">Ksh {currentData.sales?.toLocaleString()}</p></div>
          <DollarSign className="w-12 h-12 text-amber-500 opacity-50" />
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Orders ({periodLabel})</p><p className="text-2xl font-bold">{currentData.orders}</p></div>
          <ShoppingBag className="w-12 h-12 text-amber-500 opacity-50" />
        </div>
      </div>

      {/* Weekly Sales Trend Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp className="text-amber-500" /> Weekly Sales Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Package className="text-amber-500" /> Top Selling Products</h2>
          {topProducts.length === 0 ? <p className="text-gray-500">No data yet</p> : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">
                  <div><span className="font-medium">{p.name}</span><div className="text-xs text-gray-500">{p.sku}</div></div>
                  <div className="text-right"><span className="font-semibold">{p.total_quantity} units</span><div className="text-sm text-amber-600">Ksh {p.revenue.toLocaleString()}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales by Category (Pie Chart) */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Package className="text-amber-500" /> Sales by Category</h2>
          {salesByCategory.length === 0 ? <p className="text-gray-500">No data yet</p> : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={salesByCategory} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {salesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `Ksh ${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {salesByCategory.map((cat, idx) => (
                  <div key={idx} className="text-xs flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span>{cat.category || 'Uncategorized'}: Ksh {cat.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Low Stock Alert Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertCircle className="text-amber-500" /> Low Stock Products</h2>
        {lowStock.length === 0 ? <p className="text-gray-500">All products have sufficient stock ✅</p> : (
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">SKU</th>
                <th className="text-left p-2">Current Stock</th>
                <th className="text-left p-2">Min Threshold</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.sku}</td>
                  <td className="text-red-600">{p.stock_quantity}</td>
                  <td className="p-2">{p.min_stock_threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
