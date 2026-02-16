import React, { useState, useEffect } from 'react'
import { Settings, Database, Shield, Bell, AlertTriangle, X } from 'lucide-react'
import { useCurrency } from '../contexts/CurrencyContext'
import { api, API } from '../api'
import { DATE_FORMAT_OPTIONS, DEFAULT_DATE_FORMAT, DEFAULT_TIME_ZONE, getDatePreferences, saveDatePreferences, formatDateWithPreferences } from '../utils/datePreferences'
import { clearUserData, csvImportStorage } from '../utils/storage'

const SettingsPage = () => {
  const { currency, setCurrency, getCurrencySymbol, formatAmount } = useCurrency()
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [dateFormat, setDateFormat] = useState(DEFAULT_DATE_FORMAT)
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const currencies = [
    { code: 'INR', symbol: 'INR', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
  ]

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value
    setSelectedCurrency(newCurrency)
    setCurrency(newCurrency)

    // Save to localStorage for persistence
    localStorage.setItem('selectedCurrency', newCurrency)
  }

  const handleUpdatePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }

    // Regex validation matching backend
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setPasswordError('Password must contain at least 8 characters including uppercase, lowercase, number, and special character');
      return;
    }

    setIsUpdatingPassword(true)

    try {
      const { data } = await api.put(API.UPDATE_PASSWORD, {
        currentPassword,
        newPassword
      })

      if (data.success) {
        setPasswordSuccess('Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(data.message || 'Failed to update password')
      }

    } catch (err) {
      console.error('Password update error:', err)
      setPasswordError(err.response?.data?.message || 'Failed to update password')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleDateFormatChange = (e) => {
    const newDateFormat = e.target.value
    setDateFormat(newDateFormat)
    saveDatePreferences({ dateFormat: newDateFormat, timeZone })
  }

  const handleTimeZoneChange = (e) => {
    const newTimeZone = e.target.value
    setTimeZone(newTimeZone)
    saveDatePreferences({ dateFormat, timeZone: newTimeZone })
  }

  const handleClearData = async () => {
    setIsClearing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/clear-all-data', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Clear all localStorage data
        clearUserData()
        csvImportStorage.clearState()

        // Clear additional localStorage items
        localStorage.removeItem('selectedCurrency')
        localStorage.removeItem('user_preferences')
        localStorage.removeItem('token')
        localStorage.removeItem('theme')
        localStorage.removeItem('colorPalette')
        localStorage.removeItem('currency_rates_from_inr')
        localStorage.removeItem('currency_rates_updated_at')
        localStorage.removeItem('sidebar_collapsed')
        localStorage.removeItem('USER_DATA')
        localStorage.removeItem('auth_token')

        // Clear any remaining user data
        Object.keys(localStorage).forEach(key => {
          if (key.includes('user') || key.includes('auth') || key.includes('token') || key.includes('currency') || key.includes('theme') || key.includes('import') || key.includes('csv') || key.includes('preferences')) {
            localStorage.removeItem(key)
          }
        })

        // Redirect to login page
        window.location.href = '/login'
      } else {
        const error = await response.json()
        alert('Failed to clear data: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Failed to clear data. Please try again.')
    } finally {
      setIsClearing(false)
      setShowClearDialog(false)
    }
  }

  useEffect(() => {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency')
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency)
      setCurrency(savedCurrency)
    }

    const savedDatePreferences = getDatePreferences()
    setDateFormat(savedDatePreferences.dateFormat)
    setTimeZone(savedDatePreferences.timeZone)
  }, [setCurrency])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select
                value={dateFormat}
                onChange={handleDateFormatChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DATE_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Preview: {formatDateWithPreferences(new Date('2026-02-16T10:30:00Z'), { dateFormat, timeZone })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
              <select
                value={timeZone}
                onChange={handleTimeZoneChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">Clear All Data</p>
                  <p className="text-xs text-red-500">Delete all transactions, debts, budgets, imports, exports, and reset everything</p>
                </div>
              </div>
              <button
                onClick={() => setShowClearDialog(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Budget Alerts</p>
                  <p className="text-xs text-gray-500">Get notified when nearing budget limits</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Weekly Reports</p>
                  <p className="text-xs text-gray-500">Receive weekly spending summaries</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Unusual Spending</p>
                  <p className="text-xs text-gray-500">Alert for abnormal transactions</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
        <div className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              {passwordSuccess}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password (min 8 chars, uppercase, lowercase, number, special)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={isUpdatingPassword}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
          >
            {isUpdatingPassword ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Update Password
          </button>
        </div>
      </div>

      {/* Clear Data Confirmation Dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Clear All Data</h3>
              <button
                onClick={() => setShowClearDialog(false)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>Warning:</strong> This action cannot be undone and will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>All transactions and calendar data</li>
                <li>All debts and payment history</li>
                <li>All budgets and budget tracking</li>
                <li>All salary planner data</li>
                <li>All import history and CSV import state</li>
                <li>All export functionality and saved exports</li>
                <li>All user preferences and settings</li>
                <li>Theme and currency settings</li>
                <li>You will be logged out and need to login again</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Clearing...
                  </>
                ) : (
                  'Clear All Data'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
