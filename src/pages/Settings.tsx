import React, { useState, useEffect } from 'react'
import { Settings, Bell, Palette, Database, Download, Upload, Trash2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { api } from '../api'

interface UserSettings {
  notifications: boolean
  emailAlerts: boolean
  darkMode: boolean
  language: string
  timezone: string
  dateFormat: string
  currency: string
  autoBackup: boolean
  dataRetention: number
}

const SettingsPage: React.FC = () => {
  const { isDark, toggleTheme, availableColors, colorPalette, setColorPalette } = useTheme()
  const { currency, setCurrency, supportedCurrencies } = useCurrency()
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    autoBackup: true,
    dataRetention: 365
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'appearance' | 'data'>('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    setSettings(prev => ({ ...prev, darkMode: isDark, currency }))
  }, [isDark, currency])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings')
      setSettings(response.data || settings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await api.put('/api/settings', settings)
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to save settings')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await api.get('/api/export/data', {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `luiflow-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to export data')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      await api.post('/api/import/data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setSuccess('Data imported successfully!')
      setTimeout(() => setSuccess(''), 3000)
      fetchSettings()
    } catch (error) {
      setError('Failed to import data')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete('/api/data/clear')
      setSuccess('Data cleared successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to clear data')
      setTimeout(() => setError(''), 3000)
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your application preferences</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-primary dark:border-primary-light text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Settings className="h-4 w-4 mr-2 inline" />
              General
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-primary dark:border-primary-light text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Bell className="h-4 w-4 mr-2 inline" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'appearance'
                  ? 'border-primary dark:border-primary-light text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Palette className="h-4 w-4 mr-2 inline" />
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'data'
                  ? 'border-primary dark:border-primary-light text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Database className="h-4 w-4 mr-2 inline" />
              Data Management
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => updateSetting('dateFormat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => {
                        updateSetting('currency', e.target.value)
                        setCurrency(e.target.value)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      {supportedCurrencies.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications in your browser</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', !settings.notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.notifications ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Alerts</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications</p>
                    </div>
                    <button
                      onClick={() => updateSetting('emailAlerts', !settings.emailAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.emailAlerts ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        isDark ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          isDark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Color Theme</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(availableColors).map(([key, palette]) => (
                        <button
                          key={key}
                          onClick={() => setColorPalette(key)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            colorPalette === key
                              ? 'border-primary dark:border-primary-light'
                              : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800"
                              style={{ backgroundColor: palette.primary }}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {palette.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Backup & Export</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">Auto Backup</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Automatically backup your data</p>
                        </div>
                        <button
                          onClick={() => updateSetting('autoBackup', !settings.autoBackup)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                            settings.autoBackup ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleExportData}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </button>
                        
                        <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Data
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Data Retention</h4>
                    <div className="flex items-center space-x-4">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Keep data for</label>
                      <select
                        value={settings.dataRetention}
                        onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      >
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                        <option value={0}>Forever</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Danger Zone</h4>
                    <button
                      onClick={handleClearData}
                      className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
