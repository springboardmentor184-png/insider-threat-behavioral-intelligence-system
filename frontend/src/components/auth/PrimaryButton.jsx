import React from 'react';

const PrimaryButton = ({ children, onClick, type = 'submit', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full rounded-[12px] bg-primary py-3.5 font-semibold text-white shadow-[0_12px_24px_-14px_rgba(15,118,110,0.75)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#115e59] active:translate-y-0 ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;