import React from 'react';
import { ArrowRight, Monitor, Activity, Brain, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Metrics from './Metrics';

const Hero = () => {
  return (
    <>
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 container mx-auto flex flex-col lg:flex-row items-center gap-16">
      <div className="flex-1 space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-main leading-[1.15]">
          Protect Your Organization from <span className="text-primary">Insider Threats</span> Before They Become Incidents.
        </h1>
        <p className="text-lg text-subtext leading-relaxed max-w-2xl">
          Enterprise-grade behavioral analytics, threat detection, and risk scoring to monitor activity and secure your workforce seamlessly.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-3 px-8 font-medium hover:bg-opacity-90 hover:-translate-y-[1px] transition-all duration-200 flex items-center gap-2 shadow-sm">
            Get Started <ArrowRight size={18} />
          </Link>
          <a href="#dashboard" className="bg-white text-text-main border border-border-color rounded-[16px] py-3 px-8 font-medium shadow-sm hover:bg-gray-50 hover:-translate-y-[1px] transition-all duration-200">
            View Dashboard
          </a>
        </div>
      </div>
      
      <div className="flex-1 w-full flex justify-center">
        <div className="w-full max-w-[600px] p-6 bg-white border border-border-color rounded-[24px] shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-border-color pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger"></div>
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
            </div>
            <div className="text-xs text-subtext font-medium uppercase tracking-wider">InsiderShield Pipeline</div>
          </div>
          
          <div className="space-y-4">
            {/* Flow Step 1 */}
            <div className="flex items-center p-4 bg-slate-50 rounded-[16px] border border-slate-100 transition-colors hover:bg-slate-100">
              <div className="bg-white p-3 rounded-[12px] shadow-sm border border-slate-100 mr-4">
                <Monitor className="text-subtext" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-text-main text-sm">Employee Devices</h4>
                <p className="text-xs text-subtext">Continuous telemetry collection</p>
              </div>
              <div className="text-success text-xs font-semibold bg-green-50 px-2 py-1 rounded-md">Active</div>
            </div>

            {/* Flow Step 2 */}
            <div className="flex items-center p-4 bg-slate-50 rounded-[16px] border border-slate-100 ml-6 transition-colors hover:bg-slate-100">
              <div className="bg-white p-3 rounded-[12px] shadow-sm border border-slate-100 mr-4">
                <Activity className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-text-main text-sm">Behavior Monitoring</h4>
                <p className="text-xs text-subtext">Pattern baseline establishment</p>
              </div>
              <div className="text-xs text-subtext font-medium border border-border-color px-2 py-1 rounded-md bg-white">Real-time</div>
            </div>

            {/* Flow Step 3 */}
            <div className="flex items-center p-4 bg-slate-50 rounded-[16px] border border-slate-100 ml-12 transition-colors hover:bg-slate-100">
              <div className="bg-white p-3 rounded-[12px] shadow-sm border border-slate-100 mr-4">
                <Brain className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-text-main text-sm">AI Risk Analysis</h4>
                <p className="text-xs text-subtext">Anomaly detection & scoring</p>
              </div>
              <div className="text-warning text-xs font-semibold bg-orange-50 px-2 py-1 rounded-md">99.8% Acc</div>
            </div>

            {/* Flow Step 4 */}
            <div className="flex items-center p-4 bg-primary text-white rounded-[16px] shadow-md ml-16 hover:-translate-y-1 transition-transform">
              <div className="bg-white/10 p-3 rounded-[12px] mr-4">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-semibold text-white text-sm">Threat Alert Dashboard</h4>
                <p className="text-xs text-white/80">Security team notification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Metrics />
    </>
  );
};

export default Hero;