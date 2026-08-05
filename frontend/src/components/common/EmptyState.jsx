import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No employees found', description = 'Try adjusting your search or filter criteria.', action = null }) => {
  return (
    <div className="mx-auto max-w-2xl rounded-[24px] border border-slate-200/80 bg-white/80 p-10 text-center shadow-[0_18px_45px_-24px_rgba(15,23,42,0.24)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Inbox size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-text-main">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-subtext">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
