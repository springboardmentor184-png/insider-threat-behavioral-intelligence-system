import React from 'react';

const AuthCard = ({ children, title, subtitle }) => {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-border-color p-8 sm:p-10">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl font-bold text-text-main mb-2">{title}</h2>
        {subtitle && <p className="text-subtext text-sm">{subtitle}</p>}
      </div>
      {children}
      
      <div className="mt-8 pt-6 border-t border-border-color flex flex-col items-center gap-3">
        <div className="text-[11px] text-slate-400 font-medium">
          Version 1.0 &nbsp;&bull;&nbsp; &copy; {new Date().getFullYear()} InsiderShield
        </div>
        <div className="flex gap-4 text-[11px] text-slate-400 font-medium">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;