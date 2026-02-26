import React, { useState, ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, Check, X } from 'lucide-react'

// --- Interfaces ---
interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

interface PasswordStrength {
  strength: number;
  checks: PasswordChecks;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getPasswordStrength = (password: string): PasswordStrength => {
    const checks: PasswordChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    const strength = Object.values(checks).filter(Boolean).length
    
    return { strength, checks }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const getStrengthColor = (strength: number): string => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number): string => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (passwordStrength.strength < 3) {
      setError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    })
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'An error occurred during registration')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Start your financial journey today
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8 border border-transparent dark:border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-300">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength <= 2 ? 'text-red-600' :
                      passwordStrength.strength <= 3 ? 'text-yellow-600' :
                      passwordStrength.strength <= 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStrengthText(passwordStrength.strength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.length ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={passwordStrength.checks.length ? 'text-green-700' : 'text-red-700'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.uppercase ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={passwordStrength.checks.uppercase ? 'text-green-700' : 'text-red-700'}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.lowercase ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={passwordStrength.checks.lowercase ? 'text-green-700' : 'text-red-700'}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.number ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={passwordStrength.checks.number ? 'text-green-700' : 'text-red-700'}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.checks.special ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={passwordStrength.checks.special ? 'text-green-700' : 'text-red-700'}>
                        One special character
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || passwordStrength.strength < 3}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register