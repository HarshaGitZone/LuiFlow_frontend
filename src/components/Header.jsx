import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import ColorPalette from './ColorPalette'
import { api } from '../api'
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
  IndianRupee,
  Wallet
} from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
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

  const formatCurrency = (value) => {
    const amount = Number(value) || 0
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getBillDueMessage = (dueDay, billName) => {
    const todayDay = new Date().getDate()
    const daysDiff = dueDay - todayDay

    if (daysDiff < 0) {
      return {
        text: `${billName} was due on day ${dueDay} (${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} overdue)`,
        severity: 'critical'
      }
    }

    if (daysDiff === 0) {
      return {
        text: `${billName} is due today`,
        severity: 'critical'
      }
    }

    return {
      text: `${billName} is due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`,
      severity: daysDiff <= 2 ? 'warning' : 'info'
    }
  }

  const buildNotifications = (budgets = [], fixedBills = []) => {
    const alerts = []

    budgets.forEach((budget) => {
      const amount = Number(budget.amount) || 0
      const spent = Number(budget.spent) || 0
      const budgetName = budget.name || budget.category || 'Budget'

      if (amount <= 0) return

      const usagePercent = (spent / amount) * 100

      if (spent > amount) {
        alerts.push({
          id: `budget-over-${budget._id}`,
          text: `${budgetName} exceeded by ${formatCurrency(spent - amount)}`,
          time: 'Just now',
          type: 'budget',
          severity: 'critical',
          sortWeight: 0
        })
      } else if (usagePercent >= 80) {
        alerts.push({
          id: `budget-near-${budget._id}`,
          text: `${budgetName} is ${Math.round(usagePercent)}% used`,
          time: 'Just now',
          type: 'budget',
          severity: 'warning',
          sortWeight: 1
        })
      }
    })

    fixedBills
      .filter((bill) => bill?.status !== 'paid')
      .forEach((bill) => {
        const dueDay = Number.parseInt(bill.dueDate, 10)
        if (!Number.isInteger(dueDay)) return

        const todayDay = new Date().getDate()
        const daysDiff = dueDay - todayDay

        if (daysDiff <= 7) {
          const dueMessage = getBillDueMessage(dueDay, bill.name || 'Bill')
          alerts.push({
            id: `bill-due-${bill._id}`,
            text: dueMessage.text,
            time: 'This month',
            type: 'bill',
            severity: dueMessage.severity,
            sortWeight: dueMessage.severity === 'critical' ? 0 : dueMessage.severity === 'warning' ? 1 : 2
          })
        }
      })

    return alerts.sort((a, b) => a.sortWeight - b.sortWeight)
  }

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)
      setNotificationsError('')

      const month = new Date().toISOString().slice(0, 7)
      const [budgetsResult, plannerResult] = await Promise.allSettled([
        api.get('/api/budgets'),
        api.get(`/api/salary-planner?month=${month}`)
      ])

      const budgets = budgetsResult.status === 'fulfilled' && Array.isArray(budgetsResult.value.data)
        ? budgetsResult.value.data
        : []

      const fixedBills = plannerResult.status === 'fulfilled'
        ? plannerResult.value.data?.data?.fixedBills || []
        : []

      if (budgetsResult.status === 'rejected' && plannerResult.status === 'rejected') {
        setNotificationsError('Failed to load notifications')
      }

      setNotifications(buildNotifications(budgets, fixedBills))
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
      setNotificationsError('Failed to load notifications')
    } finally {
      setNotificationsLoading(false)
    }
  }

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex-1 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200">
                  LuiFlow
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase leading-none">
                  Beyond the Budget
                </span>
              </div>
            </Link>
          </div>

          {/* Center - Search Bar (full width after sidebar) */}
          <div className="flex-1">
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search transactions, categories..."
                />
              </div>
            </form>
          </div>

          {/* Right side - Quick Stats and User actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-4">
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

            {/* User actions */}
            <div className="flex items-center space-x-4">
              {/* Color palette selector */}
              <ColorPalette />

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications((prev) => {
                      const next = !prev
                      if (next) {
                        fetchNotifications()
                      }
                      return next
                    })
                    setShowProfile(false)
                  }}
                  className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsLoading && (
                        <div className="p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                        </div>
                      )}

                      {!notificationsLoading && notificationsError && notifications.length === 0 && (
                        <div className="p-4">
                          <p className="text-sm text-red-600 dark:text-red-400">{notificationsError}</p>
                        </div>
                      )}

                      {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                        <div className="p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No active budget or bill alerts.</p>
                        </div>
                      )}

                      {!notificationsLoading && notifications.map((notification) => (
                        <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                          <p className={`text-sm ${
                            notification.severity === 'critical'
                              ? 'text-red-600 dark:text-red-400'
                              : notification.severity === 'warning'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-gray-900 dark:text-gray-100'
                          }`}>{notification.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      ))}
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
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.name || 'User'}
                  </span>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                        onClick={() => setShowProfile(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                        onClick={() => setShowProfile(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
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
      </div>
    </header>
  )
}

export default Header

