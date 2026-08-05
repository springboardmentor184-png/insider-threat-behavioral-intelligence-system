import React from 'react';

const AuthCard = ({ children, title, subtitle }) => {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-10">
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