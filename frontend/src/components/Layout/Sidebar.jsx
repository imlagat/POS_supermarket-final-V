import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  LayoutDashboard, ShoppingCart, Package, Tag, Users, 
  AlertTriangle, Receipt, UserPlus, BarChart3, Settings, LogOut, UserCircle, FileText,
  Truck, RefreshCw
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { name: 'POS', path: '/pos', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
  { name: 'Products', path: '/products', icon: Package, roles: ['admin', 'manager'] },
  { name: 'Discounts', path: '/discounts', icon: Tag, roles: ['admin', 'manager'] },
  { name: 'Customers', path: '/customers', icon: Users, roles: ['admin', 'manager', 'cashier'] },
  { name: 'Inventory & Orders', path: '/inventory-orders', icon: Package, roles: ['admin', 'manager'] },
  { name: 'Transactions', path: '/transactions', icon: Receipt, roles: ['admin', 'manager', 'cashier'] },
  { name: 'Users', path: '/users', icon: UserPlus, roles: ['admin'] },
  { name: 'Audit Logs', path: '/audit-logs', icon: FileText, roles: ['admin'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'manager'] },
  { name: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['admin', 'manager'] },
  { name: 'Returns', path: '/returns', icon: RefreshCw, roles: ['admin', 'manager', 'cashier'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const allowed = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-72 bg-gradient-to-b from-amber-800 to-orange-800 text-white flex flex-col h-full shadow-2xl">
      <div className="p-6 border-b border-amber-700/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
          POS<span className="text-white">_super</span>
        </h1>
        <p className="text-xs text-amber-200/70 mt-1">Supermarket Management</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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
      </nav>

      <div className="p-4 border-t border-amber-700/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{user?.name?.charAt(0)}</span>
            </div>
            <div className="text-sm">
              <p className="font-medium leading-tight">{user?.name}</p>
              <p className="text-xs text-amber-200 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <NavLink to="/profile" className="p-1 text-amber-200 hover:text-white transition-colors" title="Profile">
              <UserCircle size={18} />
            </NavLink>
            <button onClick={() => logout()} className="p-1 text-amber-200 hover:text-white transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
