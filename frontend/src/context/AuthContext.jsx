import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
    } catch (err) {
      localStorage.removeItem('token')
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

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', res.data.access_token)
    await fetchCurrentUser()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const registerUser = async (username, email, password, roleName) => {
    await api.post('/auth/register', {
      username,
      email,
      password,
      role_name: roleName
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
