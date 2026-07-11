import React from 'react';

const InputField = ({ label, type = 'text', placeholder, value, onChange, id, required = false }) => {
  return (
    <div className="flex flex-col gap-1.5 mb-5">
      <label htmlFor={id} className="text-sm font-semibold text-text-main">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3.5 rounded-[12px] bg-background border border-border-color text-text-main text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all"
      />
    </div>
  );
};

export default InputField;