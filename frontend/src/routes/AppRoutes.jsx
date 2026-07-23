import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Landing from '../pages/Landing/Landing';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import Employees from '../pages/Employees/Employees';
import EmployeeDetail from '../pages/Employees/EmployeeDetail';
import Activities from '../pages/Activities/Activities';
import ActivityDetail from '../pages/Activities/ActivityDetail';
import Behavior from '../pages/Behavior/Behavior';
import Threat from '../pages/Threat/Threat';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';
import NotFound from '../pages/NotFound/NotFound';
import { ROUTES } from '../constants/routes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages wrapped in MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Landing />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
      </Route>

      {/* Authenticated Pages wrapped in AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.EMPLOYEES} element={<Employees />} />
          <Route path={`${ROUTES.EMPLOYEES}/:id`} element={<EmployeeDetail />} />
          <Route path={ROUTES.ACTIVITIES} element={<Activities />} />
          <Route path={`${ROUTES.ACTIVITIES}/:id`} element={<ActivityDetail />} />
          <Route path={ROUTES.BEHAVIOR} element={<Behavior />} />
          <Route path={ROUTES.THREATS} element={<Threat />} />
          <Route path={ROUTES.REPORTS} element={<Reports />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;