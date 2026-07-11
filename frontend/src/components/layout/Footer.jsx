import React from 'react';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border-color pt-20 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={28} className="text-primary" />
              <div className="flex flex-col">
                <span className="font-heading text-text-main font-bold text-xl leading-tight">InsiderShield</span>
                <span className="text-[10px] text-subtext font-medium leading-tight">Enterprise Insider Threat Intelligence</span>
              </div>
            </div>
            <p className="text-subtext text-sm leading-relaxed">
              Enterprise-grade behavioral intelligence and insider threat detection platform for modern organizations.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Solutions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border-color pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-subtext text-sm">
            &copy; {new Date().getFullYear()} InsiderShield Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-subtext">
            <a href="#" className="hover:text-text-main transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-main transition-colors">Terms</a>
            <a href="#" className="hover:text-text-main transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;