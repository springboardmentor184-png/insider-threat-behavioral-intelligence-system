import React from 'react';
import { Database, Brain, Calculator, ShieldAlert, Bell, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    { icon: <Database size={20} />, label: "Collect Employee Activity" },
    { icon: <Brain size={20} />, label: "Behavior Analysis" },
    { icon: <Calculator size={20} />, label: "Risk Score Engine" },
    { icon: <ShieldAlert size={20} />, label: "Threat Detection" },
    { icon: <Bell size={20} />, label: "Security Alert" }
  ];

  return (
    <section className="py-32 bg-white border-y border-border-color">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-24">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-6">Automated Intelligence Pipeline</h2>
          <p className="text-lg text-subtext">A streamlined, automated workflow that turns raw data into actionable security intelligence instantly.</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0 relative max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center bg-white z-10 w-40 hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-[16px] bg-slate-50 border border-border-color flex items-center justify-center text-primary shadow-sm mb-6">
                  {step.icon}
                </div>
                <div className="text-center">
                  <span className="font-heading font-semibold text-text-main text-sm block leading-snug">{step.label}</span>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:flex flex-1 items-center justify-center mx-2">
                  <div className="h-px bg-border-color w-full relative flex items-center justify-end">
                    <ArrowRight size={14} className="text-border-color absolute -right-1" />
                  </div>
                </div>
              )}
              {index < steps.length - 1 && (
                <div className="lg:hidden py-4 text-border-color">
                  <ArrowRight size={24} className="rotate-90" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;