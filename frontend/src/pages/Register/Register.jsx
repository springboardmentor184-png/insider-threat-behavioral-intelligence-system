import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import InputField from '../../components/auth/InputField';
import PasswordField from '../../components/auth/PasswordField';
import PrimaryButton from '../../components/auth/PrimaryButton';
import SocialButton from '../../components/auth/SocialButton';
import Checkbox from '../../components/auth/Checkbox';
import { ROUTES } from '../../constants/routes';
import axiosClient from '../../services/axiosClient';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    department: '',
    role: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getErrorMessage = (err, fallbackMessage) => {
    const detail = err?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(item => item?.msg || item?.message || JSON.stringify(item)).join(', ');
    }
    if (detail && typeof detail === 'object') {
      return detail.message || JSON.stringify(detail);
    }
    return err?.message || fallbackMessage;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const [first_name, ...remainingName] = formData.fullName.trim().split(' ');
    const last_name = remainingName.join(' ') || 'User';

    try {
      await axiosClient.post('/auth/register', {
        employee_id: formData.employeeId,
        first_name,
        last_name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: formData.role,
      });
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  const MicrosoftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  );

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <AuthLayout>
      <AuthCard title="Create your account" subtitle="Register to access InsiderShield">
        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <InputField
              id="fullName"
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <InputField
              id="employeeId"
              label="Employee ID"
              placeholder="EMP-001"
              value={formData.employeeId}
              onChange={handleChange}
              required
            />
          </div>
          
          <InputField
            id="email"
            label="Organization Email"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mb-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="department" className="text-sm font-semibold text-text-main">Department</label>
              <select
                id="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-[12px] bg-background border border-border-color text-text-main text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all appearance-none"
              >
                <option value="">Select Department</option>
                <option value="engineering">Engineering</option>
                <option value="security">Security / SOC</option>
                <option value="hr">Human Resources</option>
                <option value="it">IT Administration</option>
                <option value="management">Management</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-5 sm:mt-0">
              <label htmlFor="role" className="text-sm font-semibold text-text-main">Role</label>
              <select
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-[12px] bg-background border border-border-color text-text-main text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all appearance-none"
              >
                <option value="">Select Role</option>
                <option value="analyst">Security Analyst</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
                <option value="employee">Standard Employee</option>
              </select>
            </div>
          </div>

          <PasswordField
            id="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className="mb-8 mt-2">
            <Checkbox
              id="agreeToTerms"
              label={<span>I agree to <a href="#" className="text-primary hover:underline transition-colors">Terms</a> and <a href="#" className="text-primary hover:underline transition-colors">Privacy Policy</a></span>}
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
          </div>

          <PrimaryButton className="mb-6">Create Account</PrimaryButton>
        </form>

        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-border-color"></div>
          <span className="px-3 text-xs text-subtext font-medium bg-white uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-border-color"></div>
        </div>

        <div className="space-y-4 mb-8">
          <SocialButton icon={<MicrosoftIcon />} label="Continue with Microsoft" />
          <SocialButton icon={<GoogleIcon />} label="Continue with Google" />
        </div>

        <div className="text-center text-sm text-subtext">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:underline transition-colors">
            Sign In
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;