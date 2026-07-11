import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <aside className="w-64 bg-cards border-r border-gray-100 hidden md:block h-[calc(100vh-64px)] sticky top-16">
      <div className="p-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${
              location.pathname === item.path
                ? 'bg-primary text-white shadow-sm'
                : 'text-subtext hover:bg-gray-50 hover:text-primary'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;