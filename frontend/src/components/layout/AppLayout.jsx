import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, LogOut, PieChart, Users, Activity, BarChart3, ShieldCheck, FileText, Settings2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

const navItems = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: <PieChart size={18} /> },
  { name: 'Employees', path: ROUTES.EMPLOYEES, icon: <Users size={18} /> },
  { name: 'Activities', path: ROUTES.ACTIVITIES, icon: <Activity size={18} /> },
  { name: 'Behavior Analytics', path: ROUTES.BEHAVIOR, icon: <BarChart3 size={18} /> },
  { name: 'Threat Detection', path: ROUTES.THREATS, icon: <ShieldCheck size={18} /> },
  { name: 'Reports', path: ROUTES.REPORTS, icon: <FileText size={18} /> },
  { name: 'Settings', path: ROUTES.SETTINGS, icon: <Settings2 size={18} /> },
];


const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate(ROUTES.LOGIN);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith(ROUTES.SETTINGS)) {
      return { title: 'Settings', subtitle: 'Manage account preferences and thresholds' };
    }
    if (path.startsWith(ROUTES.REPORTS)) {
      return { title: 'Reports & Logs', subtitle: 'Organization security reports and recent anomalies' };
    }
    if (path.startsWith(ROUTES.THREATS)) {
      return { title: 'Threat Detection', subtitle: 'Analyze high-risk profiles and AI recommendation updates' };
    }
    if (path.startsWith(ROUTES.BEHAVIOR)) {
      return { title: 'Behavior Analytics', subtitle: 'Inspect employee baseline metrics and activity trends' };
    }
    if (path.startsWith(ROUTES.ACTIVITIES)) {
      return { title: 'Activities', subtitle: 'Audit trial logs across systems and networks' };
    }
    if (path.startsWith(ROUTES.EMPLOYEES)) {
      return { title: 'Employees', subtitle: 'Monitor directory, access levels, and risk parameters' };
    }
    return { title: 'Security Operations Center', subtitle: 'Unified partner dashboard' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-background text-text-main">
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-cards border-r border-border-color transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed lg:shadow-none`}>
        <div className="flex h-full flex-col p-5">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">InsiderShield</p>
              <p className="text-xs text-subtext">Behavioral Intelligence</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium transition-all ${
                    isActive ? 'bg-primary text-white shadow-sm' : 'text-subtext hover:bg-gray-100 hover:text-primary'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-[16px] bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen w-full">
        <header className="sticky top-0 z-20 border-b border-border-color bg-background/95 backdrop-blur-lg w-full">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-border-color bg-white text-text-main lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="text-sm font-semibold text-text-main">{title}</p>
                <p className="text-xs text-subtext">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-border-color bg-white text-text-main">
                <Bell size={18} />
              </button>
              <div className="hidden sm:flex items-center gap-3 rounded-[20px] border border-border-color bg-white px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                  {user?.first_name?.[0] || 'U'}
                </div>
                <div className="text-left max-w-[120px] md:max-w-[160px]">
                  <p className="text-sm font-semibold text-text-main truncate">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'Guest User'}</p>
                  <p className="text-xs text-subtext truncate">{user?.role?.role_name || user?.role || 'Visitor'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1600px] mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
