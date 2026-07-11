import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-cards rounded-[12px] shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;