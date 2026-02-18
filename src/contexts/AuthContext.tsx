import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../api'
import { clearUserData } from '../utils/storage'

interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (userData: any) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  isAuthenticated: boolean
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const TOKEN_STORAGE_KEY = 'token'
const USER_STORAGE_KEY = 'auth_user'

const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY)

const clearStoredAuth = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  sessionStorage.removeItem(USER_STORAGE_KEY)
}

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [loading, setLoading] = useState(true)

  const persistUser = (nextUser: User | null, rememberMe = true) => {
    setUser(nextUser)
    if (nextUser) {
      if (rememberMe) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
        sessionStorage.removeItem(USER_STORAGE_KEY)
      } else {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
      sessionStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  useEffect(() => {
    const token = getStoredToken()
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
        const isRememberedSession = !!localStorage.getItem(TOKEN_STORAGE_KEY)
        persistUser(profileUser, isRememberedSession)
      }
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error)
      if ([401, 403, 404].includes(error.response?.status)) {
        clearStoredAuth()
        persistUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token, user } = response.data.data

      if (rememberMe) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token)
        sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      } else {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
      persistUser(user, rememberMe)
      
      return { success: true }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after']
        const suffix = retryAfter ? ` Retry after ${retryAfter} seconds.` : ''
        return {
          success: false,
          error: `Too many login attempts.${suffix}`
        }
      }
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await api.post('/api/auth/register', userData)
      const { token, user } = response.data.data
      
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      persistUser(user)
      
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    clearStoredAuth()
    persistUser(null)
    // Clear all user-related data from storage
    clearUserData()
  }

  const updateProfile = async (userData: any) => {
    try {
      const response = await api.put('/api/auth/profile', userData)
      const updatedUser = response?.data?.data?.user
      if (updatedUser) {
        persistUser(updatedUser)
      }
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      }
    }
  }

  const value: AuthContextType = {
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
