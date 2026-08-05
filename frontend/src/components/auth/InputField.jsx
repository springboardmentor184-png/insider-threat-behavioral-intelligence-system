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
        className="w-full rounded-[12px] border border-border-color bg-background px-4 py-3.5 text-sm text-text-main transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
};

export default InputField;