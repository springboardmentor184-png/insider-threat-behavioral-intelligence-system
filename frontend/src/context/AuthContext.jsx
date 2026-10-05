import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    // Apply theme variables globally
    document.documentElement.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/profile')
      setUser(res.data)
    } catch (err) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const sendOtp = async (email) => {
    const res = await api.post('/auth/send-otp', { email })
    return res.data
  }

  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email })
    return res.data
  }

  const verifyOtp = async (email, otp, rememberMe = false) => {
    const res = await api.post('/auth/verify-otp', { 
      email, 
      otp, 
      remember_me: rememberMe 
    })
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    await fetchCurrentUser()
    return res.data
  }

  const login = async (email, password, rememberMe) => {
    const res = await api.post('/auth/login', { 
      email, 
      password, 
      remember_me: rememberMe 
    })
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    await fetchCurrentUser()
  }

  const loginWithGoogle = async (name, email, googleId, picUrl) => {
    const credential = `${name}:${email}:${googleId}:${picUrl}`
    const res = await api.post('/auth/google-login', { credential })
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    await fetchCurrentUser()
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error("Logout request failed on server", err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    }
  }

  const registerUser = async (fullName, email, username, password, confirmPassword, roleName) => {
    await api.post('/auth/register', {
      full_name: fullName,
      email,
      username: username || null,
      password,
      confirm_password: confirmPassword,
      role_name: roleName
    })
  }

  const updateProfile = async (payload) => {
    const res = await api.put('/auth/profile', payload)
    setUser(res.data)
    return res.data
  }

  const deleteAccount = async () => {
    try {
      await api.delete('/auth/account')
    } catch (err) {
      console.error("Account deletion request error", err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      sendOtp,
      resendOtp,
      verifyOtp,
      login, 
      loginWithGoogle,
      logout, 
      registerUser, 
      updateProfile,
      deleteAccount,
      theme, 
      toggleTheme, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
