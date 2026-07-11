import React from 'react';

const PrimaryButton = ({ children, onClick, type = 'submit', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-primary text-white font-semibold rounded-[12px] py-3.5 transition-all duration-200 hover:bg-opacity-90 hover:-translate-y-[1px] active:translate-y-0 shadow-sm ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;