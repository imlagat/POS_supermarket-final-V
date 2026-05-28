import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Save, Store, CreditCard, Receipt, Package, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('store');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/settings', settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading settings...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <SettingsIcon className="text-amber-500" /> System Settings
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'store', label: 'Store Info', icon: Store },
          { id: 'tax', label: 'Tax & Receipt', icon: Receipt },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'mpesa', label: 'M-Pesa', icon: CreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-t-lg transition ${activeTab === tab.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        {/* Store Information */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            <div><label className="block font-medium mb-1">Store Name</label><input type="text" value={settings.store_name || ''} onChange={e => updateSetting('store_name', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
            <div><label className="block font-medium mb-1">Address</label><textarea value={settings.store_address || ''} onChange={e => updateSetting('store_address', e.target.value)} className="w-full border p-2 rounded-xl" rows="2" /></div>
            <div><label className="block font-medium mb-1">Phone</label><input type="text" value={settings.store_phone || ''} onChange={e => updateSetting('store_phone', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
            <div><label className="block font-medium mb-1">Email</label><input type="email" value={settings.store_email || ''} onChange={e => updateSetting('store_email', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
            <div><label className="block font-medium mb-1">Currency Symbol</label><input type="text" value={settings.currency_symbol || 'Ksh'} onChange={e => updateSetting('currency_symbol', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
          </div>
        )}

        {/* Tax & Receipt */}
        {activeTab === 'tax' && (
          <div className="space-y-4">
            <div><label className="block font-medium mb-1">Tax Rate (%)</label><input type="number" step="0.01" value={settings.tax_rate || 16} onChange={e => updateSetting('tax_rate', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
            <div><label className="block font-medium mb-1">Receipt Footer Message</label><textarea value={settings.receipt_footer || ''} onChange={e => updateSetting('receipt_footer', e.target.value)} className="w-full border p-2 rounded-xl" rows="3" /></div>
          </div>
        )}

        {/* Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div><label className="block font-medium mb-1">Global Low Stock Threshold</label><input type="number" value={settings.low_stock_threshold || 10} onChange={e => updateSetting('low_stock_threshold', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
          </div>
        )}

        {/* M-Pesa Settings */}
        {activeTab === 'mpesa' && (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-xl mb-4"><p className="text-sm text-amber-800">⚠️ M-Pesa credentials are used for STK push. Keep them secure. Ask your developer to set them in .env for production. These fields store encrypted values (demo only).</p></div>
            <div><label className="block font-medium mb-1">Consumer Key</label><input type="text" value={settings.mpesa_consumer_key || ''} onChange={e => updateSetting('mpesa_consumer_key', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
            <div><label className="block font-medium mb-1">Consumer Secret</label><input type="password" value={settings.mpesa_consumer_secret || ''} onChange={e => updateSetting('mpesa_consumer_secret', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
            <div><label className="block font-medium mb-1">Shortcode</label><input type="text" value={settings.mpesa_shortcode || ''} onChange={e => updateSetting('mpesa_shortcode', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
            <div><label className="block font-medium mb-1">Passkey</label><input type="password" value={settings.mpesa_passkey || ''} onChange={e => updateSetting('mpesa_passkey', e.target.value)} className="w-full border p-2 rounded-xl" /></div>
          </div>
        )}
      </div>
    </div>
  );
}
