import React from 'react';

const StatCard = ({ title, value, icon, trendIcon, subtitle, colorClass, bgClass }) => {
  return (
    <div className="flex items-start justify-between rounded-[20px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-white p-6 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.24)]">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-subtext">{title}</h3>
        <div className="mb-2 text-3xl font-heading font-bold text-text-main">{value}</div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          {trendIcon}
          <span>{subtitle}</span>
        </div>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgClass} ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;