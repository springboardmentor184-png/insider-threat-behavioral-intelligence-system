import React from 'react';

const SocialButton = ({ icon, label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 bg-white border border-border-color rounded-[12px] py-3 hover:bg-slate-50 transition-colors font-medium text-sm text-text-main shadow-sm"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default SocialButton;