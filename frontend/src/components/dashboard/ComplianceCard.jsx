import React from 'react';
import { ShieldCheck } from 'lucide-react';

const ComplianceCard = () => {
  const frameworks = ['SOC 2', 'GDPR', 'ISO 27001'];

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-border-color p-6 h-full">
      <h3 className="font-heading font-semibold text-text-main flex items-center gap-2 mb-6">
        <ShieldCheck size={18} className="text-success" />
        Compliance Status
      </h3>
      <div className="space-y-4">
        {frameworks.map((fw, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-[12px] bg-slate-50 border border-slate-100">
            <span className="font-semibold text-sm text-text-main">{fw}</span>
            <div className="flex items-center gap-1.5 text-success">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-xs font-bold uppercase tracking-wider">Compliant</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceCard;