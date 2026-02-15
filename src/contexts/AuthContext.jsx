import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthContext = createContext()
const TOKEN_STORAGE_KEY = 'token'
const USER_STORAGE_KEY = 'auth_user'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)

  const persistUser = (nextUser) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (token) {
      fetchUserProfile()
    } else {
      persistUser(null)
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile')
      const profileUser = response?.data?.data?.user
      if (profileUser) {
        persistUser(profileUser)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        persistUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token, user } = response.data.data
      
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      persistUser(user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData)
      const { token, user } = response.data.data
      
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      persistUser(user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    persistUser(null)
  }

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/api/auth/profile', userData)
      const updatedUser = response?.data?.data?.user
      if (updatedUser) {
        persistUser(updatedUser)
      }
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
