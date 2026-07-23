import React from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-white border-r border-border-color p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0F766E 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <Link to={ROUTES.LANDING} className="flex items-center gap-3 mb-12 w-fit">
            <Shield size={32} className="text-primary" />
            <div className="flex flex-col">
              <span className="font-heading text-text-main font-bold text-2xl leading-tight">InsiderShield</span>
              <span className="text-[11px] text-subtext font-medium leading-tight tracking-wide">Enterprise Insider Threat Intelligence</span>
            </div>
          </Link>

          <div className="flex-1">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 border border-border-color text-xs font-semibold text-primary mb-6">
              Enterprise Security Platform
            </div>
            
            <h1 className="font-heading text-4xl font-bold text-text-main mb-6 leading-[1.15]">
              Welcome Back
            </h1>
            
            <p className="text-lg text-subtext leading-relaxed max-w-md mb-10">
              Monitor insider threats, analyze behavior, protect enterprise assets.
            </p>

            <div className="space-y-4 mb-12">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={20} />
                <span className="text-text-main font-medium">Behavior Analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={20} />
                <span className="text-text-main font-medium">Threat Detection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={20} />
                <span className="text-text-main font-medium">Risk Monitoring</span>
              </div>
            </div>

            {/* Professional SVG Workflow */}
            <div className="mb-10 p-6 bg-slate-50 rounded-[16px] border border-border-color">
              <div className="flex flex-col space-y-3 relative">
                <div className="absolute left-[15px] top-[24px] bottom-[24px] w-px bg-slate-200"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-subtext"></div>
                  </div>
                  <span className="text-sm font-medium text-text-main">Employee Devices</span>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
                  </div>
                  <span className="text-sm font-medium text-text-main">Behavior Monitoring</span>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-warning"></div>
                  </div>
                  <span className="text-sm font-medium text-text-main">Risk Analysis</span>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-danger"></div>
                  </div>
                  <span className="text-sm font-medium text-text-main">Threat Detection</span>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  </div>
                  <span className="text-sm font-bold text-text-main">Security Operations Center</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-[12px] border border-border-color shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px]">🟢</span>
                  <span className="text-[10px] font-semibold text-subtext uppercase">Secure Access</span>
                </div>
                <div className="text-sm font-bold text-text-main">Always on</div>
              </div>
              <div className="bg-white p-3 rounded-[12px] border border-border-color shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px]">🟡</span>
                  <span className="text-[10px] font-semibold text-subtext uppercase">Enterprise Visibility</span>
                </div>
                <div className="text-sm font-bold text-text-main">Real-time insights</div>
              </div>
              <div className="bg-white p-3 rounded-[12px] border border-border-color shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px]">🔵</span>
                  <span className="text-[10px] font-semibold text-subtext uppercase">Threat Response</span>
                </div>
                <div className="text-sm mt-1 font-bold text-success">Ready</div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Minimal Navigation Top Right */}
        <div className="absolute top-0 right-0 w-full p-6 sm:p-8 flex justify-end z-20">
          <Link to={ROUTES.LANDING} className="text-sm font-medium text-subtext hover:text-text-main flex items-center gap-1.5 transition-colors">
            ← Back to Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 mt-12 md:mt-0">
          <div className="w-full max-w-[440px] my-auto">
            {/* Mobile Logo Only */}
            <Link to={ROUTES.LANDING} className="md:hidden flex items-center gap-3 mb-10 justify-center">
              <Shield size={28} className="text-primary" />
              <span className="font-heading text-text-main font-bold text-2xl">InsiderShield</span>
            </Link>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;