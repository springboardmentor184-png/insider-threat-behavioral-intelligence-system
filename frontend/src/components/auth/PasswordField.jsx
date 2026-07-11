import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({ label, placeholder, value, onChange, id, required = false }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 mb-5">
      <label htmlFor={id} className="text-sm font-semibold text-text-main">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-4 pr-12 py-3.5 rounded-[12px] bg-background border border-border-color text-text-main text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-subtext hover:text-text-main transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;