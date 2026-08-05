import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', disabled = false, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[12px] border border-transparent bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(15,118,110,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#115e59] focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;