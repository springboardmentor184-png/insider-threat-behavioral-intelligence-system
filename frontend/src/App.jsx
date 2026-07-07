import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EmployeeList from './pages/EmployeeList'
import AddEmployee from './pages/AddEmployee'
import EmployeeDetails from './pages/EmployeeDetails'
import ActivityLogs from './pages/ActivityLogs'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes (Requires Authentication) */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/employees" element={
              <ProtectedRoute>
                <EmployeeList />
              </ProtectedRoute>
            } />
            
            {/* Role-Restricted Protected Route (Requires Admin or Manager) */}
            <Route path="/employees/add" element={
              <ProtectedRoute allowedRoles={['Administrator', 'Security Manager']}>
                <AddEmployee />
              </ProtectedRoute>
            } />
            
            <Route path="/employees/:id" element={
              <ProtectedRoute>
                <EmployeeDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/activities" element={
              <ProtectedRoute>
                <ActivityLogs />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
