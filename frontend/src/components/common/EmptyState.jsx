import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No employees found', description = 'Try adjusting your search or filter criteria.', action = null }) => {
  return (
    <div className="rounded-[16px] border border-border-color bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Inbox size={20} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-text-main">{title}</h3>
      <p className="mt-2 text-sm text-subtext">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
