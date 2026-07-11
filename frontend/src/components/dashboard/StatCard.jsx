import React from 'react';

const StatCard = ({ title, value, icon, trendIcon, subtitle, colorClass, bgClass }) => {
  return (
    <div className="bg-white p-6 rounded-[16px] shadow-sm border border-border-color flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium text-subtext mb-1">{title}</h3>
        <div className="text-3xl font-heading font-bold text-text-main mb-2">{value}</div>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {trendIcon}
          <span>{subtitle}</span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;