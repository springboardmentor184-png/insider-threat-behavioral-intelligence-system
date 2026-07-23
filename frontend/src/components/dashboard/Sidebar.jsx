import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../services/axiosClient';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Activity, 
  ShieldAlert, 
  FileText, 
  BarChart2, 
  Search, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch {
      // Ignore logout errors and continue clearing local state
    }
    localStorage.removeItem('access_token');
    setUser(null);
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: ROUTES.DASHBOARD },
    { label: 'Employees', icon: <Users size={20} />, path: '#' },
    { label: 'Behavior Analytics', icon: <Activity size={20} />, path: '#' },
    { label: 'Threat Detection', icon: <ShieldAlert size={20} />, path: '#' },
    { label: 'Activity Logs', icon: <FileText size={20} />, path: '#' },
    { label: 'Risk Assessment', icon: <BarChart2 size={20} />, path: '#' },
    { label: 'Investigations', icon: <Search size={20} />, path: '#' },
    { label: 'Reports', icon: <FileText size={20} />, path: '#' }
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-border-color transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-border-color">
        <div className="flex items-center gap-2">
          <Shield size={24} className="text-primary" />
          <span className="font-heading font-bold text-text-main text-lg">InsiderShield</span>
        </div>
        <button className="lg:hidden text-subtext" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-medium text-sm transition-colors ${
                  isActive && item.path === ROUTES.DASHBOARD
                    ? 'bg-primary/5 text-primary' 
                    : 'text-subtext hover:bg-slate-50 hover:text-text-main'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border-color space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-medium text-sm text-subtext hover:bg-slate-50 hover:text-text-main transition-colors">
          <Settings size={20} />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-medium text-sm text-danger hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;