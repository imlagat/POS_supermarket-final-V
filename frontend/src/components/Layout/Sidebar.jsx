import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  LayoutDashboard, ShoppingCart, Package, Tag, Users, 
  AlertTriangle, Receipt, UserPlus, BarChart3, Settings, LogOut 
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { name: 'POS', path: '/pos', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
  { name: 'Products', path: '/products', icon: Package, roles: ['admin', 'manager'] },
  { name: 'Discounts', path: '/discounts', icon: Tag, roles: ['admin', 'manager'] },
  { name: 'Customers', path: '/customers', icon: Users, roles: ['admin', 'manager', 'cashier'] },
  { name: 'Inventory', path: '/inventory', icon: AlertTriangle, roles: ['admin', 'manager'] },
  { name: 'Transactions', path: '/transactions', icon: Receipt, roles: ['admin', 'manager', 'cashier'] },
  { name: 'Users', path: '/users', icon: UserPlus, roles: ['admin'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'manager'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const allowed = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-72 bg-gradient-to-b from-amber-800 to-orange-800 text-white flex flex-col h-screen sticky top-0 shadow-2xl">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-amber-700/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
          POS<span className="text-white">_super</span>
        </h1>
        <p className="text-xs text-amber-200/70 mt-1">Supermarket Management</p>
      </div>

      {/* Navigation - grows to push bottom section down */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {allowed.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'text-amber-100 hover:bg-amber-700/50 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Logout - pinned to bottom */}
      <div className="p-4 border-t border-amber-700/50 mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{user?.name?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-amber-200 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-200 hover:text-white hover:bg-amber-700/50 rounded-lg transition"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
