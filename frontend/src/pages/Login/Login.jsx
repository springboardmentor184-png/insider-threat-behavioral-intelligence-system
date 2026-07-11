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
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
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

  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formDataPayload = new URLSearchParams();
      formDataPayload.append('username', formData.email);
      formDataPayload.append('password', formData.password);

      const response = await axiosClient.post('/auth/login', formDataPayload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, employee } = response.data;
      localStorage.setItem('access_token', access_token);
      setUser(employee);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
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
      <AuthCard title="Sign in to your account" subtitle="Use your organization credentials">
        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          <InputField
            id="email"
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <PasswordField
            id="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="flex items-center justify-between mb-8">
            <Checkbox
              id="rememberMe"
              label="Remember Me"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <a href="#" className="text-sm font-semibold text-[#2563EB] hover:underline transition-colors">
              Forgot Password
            </a>
          </div>

          <PrimaryButton className="mb-6">Sign In</PrimaryButton>
        </form>

        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-border-color"></div>
          <span className="px-3 text-xs text-subtext font-medium bg-white uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-border-color"></div>
        </div>

        <div className="space-y-4 mb-8">
          <SocialButton icon={<MicrosoftIcon />} label="Continue with Microsoft" />
          <SocialButton icon={<GoogleIcon />} label="Continue with Google" />
        </div>

        <div className="text-center text-sm text-subtext">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-primary hover:underline transition-colors">
            Create Account
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;