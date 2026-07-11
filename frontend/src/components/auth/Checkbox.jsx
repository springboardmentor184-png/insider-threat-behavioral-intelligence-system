import React from 'react';

const Checkbox = ({ label, id, checked, onChange, required = false }) => {
  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
          className="w-4 h-4 text-primary bg-background border-border-color rounded focus:ring-primary focus:ring-2 cursor-pointer"
        />
      </div>
      <label htmlFor={id} className="text-sm text-subtext cursor-pointer leading-tight">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;