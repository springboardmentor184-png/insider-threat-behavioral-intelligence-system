import React from 'react';

const PageHeader = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-text-main">{title}</h1>
      {description && <p className="text-subtext mt-1">{description}</p>}
    </div>
  );
};

export default PageHeader;