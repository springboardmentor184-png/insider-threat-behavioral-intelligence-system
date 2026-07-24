import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://127.0.0.1:8000/auth/login', {
      username,
      password
    });
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('role', response.data.role);
    localStorage.setItem('username', response.data.username);
    setMessage('✅ Login Successful! Redirecting to Dashboard...');
    
    // Redirect to dashboard after 1 second
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  } catch (error) {
    setMessage('❌ Login Failed. Check your username and password.');
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Insider Threat System Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
        <p 
          className="mt-4 text-center text-blue-500 cursor-pointer hover:underline"
          onClick={() => window.location.href = '/register'}
        >
          Create Security Account
        </p>
        {message && (
          <p className={`mt-4 text-center ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;