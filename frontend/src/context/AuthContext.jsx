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

  const updateProfile = async (fullName, username, picUrl) => {
    const res = await api.put('/auth/profile', {
      full_name: fullName,
      username: username || null,
      profile_picture: picUrl || null
    })
    setUser(res.data)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithGoogle,
      logout, 
      registerUser, 
      updateProfile,
      theme, 
      toggleTheme, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
