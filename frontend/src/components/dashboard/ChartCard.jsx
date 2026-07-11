import React from 'react';

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-[16px] shadow-sm border border-border-color h-full flex flex-col">
      <h3 className="font-heading font-semibold text-text-main mb-6">{title}</h3>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;