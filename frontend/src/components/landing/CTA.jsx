import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const CTA = () => {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="bg-secondary rounded-[24px] p-16 md:p-24 text-center overflow-hidden shadow-sm">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-8 leading-tight">
              Ready to secure your organization?
            </h2>
            <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto font-medium">
              Deploy our behavioral intelligence system today and stop insider threats before data leaves your network.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-4 px-10 font-semibold hover:bg-opacity-90 hover:-translate-y-1 transition-all duration-200 shadow-sm">
                Get Started
              </Link>
              <a href="#contact" className="bg-white/5 text-white border border-white/10 rounded-[16px] py-4 px-10 font-semibold hover:bg-white/10 hover:-translate-y-1 transition-all duration-200">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;