import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ROUTES } from '../../constants/routes';

const MainLayout = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER;

  if (isAuthRoute) {
    return (
      <main className="min-h-screen bg-background">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;