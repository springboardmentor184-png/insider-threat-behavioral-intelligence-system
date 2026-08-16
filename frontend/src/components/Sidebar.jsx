import React from 'react';
import { Shield, LayoutDashboard, Bell, Mail, Zap, Users, History, User, Settings, LogOut } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, onLogout }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', name: 'Employees', icon: Users },
    { id: 'logs', name: 'Activity Logs', icon: History },
    { id: 'alerts', name: 'Alerts', icon: Bell },
    { id: 'inbox', name: 'Mock Email Inbox', icon: Mail },
    { id: 'simulator', name: 'Threat Simulator', icon: Zap },
    { id: 'profile', name: 'Profile', icon: User},
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Shield size={24} fill="#2563eb" />
        <span>Insider AI</span>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => !item.disabled && setCurrentTab(item.id)}
                className={`sidebar-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled-item' : ''}`}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  opacity: item.disabled ? 0.4 : 1,
                  cursor: item.disabled ? 'not-allowed' : 'pointer'
                }}
                disabled={item.disabled}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
