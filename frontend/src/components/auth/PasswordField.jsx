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
          className="w-full rounded-[12px] border border-border-color bg-background pl-4 pr-12 py-3.5 text-sm text-text-main transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
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