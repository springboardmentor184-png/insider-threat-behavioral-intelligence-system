import React from 'react';
import { Menu, Search, Bell, Moon } from 'lucide-react';

const Topbar = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-white border-b border-border-color flex items-center justify-between px-4 lg:px-8 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-subtext hover:text-text-main" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center relative max-w-md w-full">
          <Search size={18} className="absolute left-3 text-subtext" />
          <input 
            type="text" 
            placeholder="Search employees, alerts, or logs..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-border-color rounded-[12px] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button className="text-subtext hover:text-text-main transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full border border-white"></span>
        </button>
        <button className="text-subtext hover:text-text-main transition-colors">
          <Moon size={20} />
        </button>
        <div className="h-6 w-px bg-border-color mx-1"></div>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
            AR
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-text-main leading-tight">Alex Rivera</div>
            <div className="text-[11px] text-subtext font-medium leading-tight">Security Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;