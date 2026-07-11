import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-[12px] bg-primary text-white font-medium hover:opacity-90 transition-opacity shadow-sm ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;