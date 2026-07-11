import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm text-subtext">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-3 py-2 rounded-[12px] border border-gray-200 bg-cards shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
};

export default Input;