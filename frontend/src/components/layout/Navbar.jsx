import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-cards shadow-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to={ROUTES.LANDING} className="flex items-center gap-3">
          <Shield size={28} className="text-primary" />
          <div className="flex flex-col">
            <span className="font-heading text-text-main font-bold text-xl leading-tight">InsiderShield</span>
            <span className="text-[10px] text-subtext font-medium leading-tight">Enterprise Insider Threat Intelligence</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-subtext font-medium text-sm">
          <a href="#platform" className="hover:text-primary transition-colors">Platform</a>
          <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#documentation" className="hover:text-primary transition-colors">Documentation</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to={ROUTES.LOGIN} className="text-text-main hover:text-primary transition-colors py-2 px-4 font-medium text-sm">Login</Link>
          <Link to={ROUTES.REGISTER} className="bg-primary text-white rounded-[16px] py-2 px-5 hover:opacity-90 hover:-translate-y-[1px] transition-all duration-200 font-medium text-sm shadow-sm">Get Started</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;