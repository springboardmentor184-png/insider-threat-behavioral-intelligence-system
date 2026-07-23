import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-[16px] border border-border-color p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;