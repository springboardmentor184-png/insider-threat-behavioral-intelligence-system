import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`rounded-[20px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.24)] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;