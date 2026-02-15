import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Menu,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  IndianRupee
} from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [quickStats, setQuickStats] = useState({
    todayExpense: 0,
    todayIncome: 0,
    weekExpense: 0,
    weekIncome: 0
  })

  useEffect(() => {
    // Fetch quick stats for the header
    const fetchQuickStats = async () => {
      try {
        // This would be an actual API call
        // const response = await api.get('/transactions/quick-stats')
        // setQuickStats(response.data)
        
        // Mock data for now
        setQuickStats({
          todayExpense: 1250,
          todayIncome: 5000,
          weekExpense: 8500,
          weekIncome: 15000
        })
      } catch (error) {
        console.error('Failed to fetch quick stats:', error)
      }
    }

    if (user) {
      fetchQuickStats()
    }
  }, [user])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const notifications = [
    { id: 1, text: 'New transaction added: Grocery shopping - ₹2,500', time: '2 min ago', type: 'transaction' },
    { id: 2, text: 'Budget alert: Entertainment 80% used', time: '1 hour ago', type: 'budget' },
    { id: 3, text: 'Monthly report is ready', time: '3 hours ago', type: 'report' },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Search */}
          <div className="flex-1 flex items-center">
            <form onSubmit={handleSearch} className="max-w-lg w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search transactions, categories..."
                />
              </div>
            </form>
          </div>

          {/* Center - Quick Stats */}
          <div className="hidden lg:flex items-center space-x-6 mx-8">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="font-medium">Today: </span>
                <IndianRupee className="h-3 w-3 ml-1" />
                <span>{quickStats.todayIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center text-red-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span className="font-medium">Today: </span>
                <IndianRupee className="h-3 w-3 ml-1" />
                <span>{quickStats.todayExpense.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfile(false)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-100">
                        <p className="text-sm text-gray-900">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfile(!showProfile)
                  setShowNotifications(false)
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name || 'User'}
                </span>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfile(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfile(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
