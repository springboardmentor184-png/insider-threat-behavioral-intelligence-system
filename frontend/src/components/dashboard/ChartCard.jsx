import React from 'react';

const ChartCard = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white p-5 rounded-[16px] shadow-sm border border-border-color h-full flex flex-col ${className}`.trim()}>
      <h3 className="font-heading font-semibold text-text-main mb-4">{title}</h3>
      <div className="flex-1 w-full min-h-[320px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;