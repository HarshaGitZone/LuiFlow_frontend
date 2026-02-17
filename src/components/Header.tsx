import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCurrency } from '../contexts/CurrencyContext'
import ColorPalette from './ColorPalette'
import { api } from '../api'
import {
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react'

interface QuickStats {
  todayExpense: number
  todayIncome: number
  weekExpense: number
  weekIncome: number
}

interface Notification {
  id: string
  text: string
  time: string
  type: 'budget' | 'bill' | 'expense' | 'system'
  severity: 'critical' | 'warning' | 'info'
  sortWeight: number
  createdAt: number
}

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { formatAmount } = useCurrency()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activityNotifications, setActivityNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
  const [notificationsCleared, setNotificationsCleared] = useState(false)
  const lastNotificationsFetchAtRef = useRef(0)
  const [quickStats, setQuickStats] = useState<QuickStats>({
    todayExpense: 0,
    todayIncome: 0,
    weekExpense: 0,
    weekIncome: 0
  })

  const toNotificationTime = (date = new Date()) => {
    const now = Date.now()
    const diffMs = now - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins <= 0) return 'Just now'
    if (diffMins === 1) return '1 min ago'
    if (diffMins < 60) return `${diffMins} mins ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    return `${diffHours} hours ago`
  }

  const addActivityNotification = (
    text: string,
    options?: { severity?: 'critical' | 'warning' | 'info'; type?: Notification['type'] }
  ) => {
    const createdAt = Date.now()
    const severity = options?.severity || 'info'
    const type = options?.type || 'system'
    const sortWeight = severity === 'critical' ? 0 : severity === 'warning' ? 1 : 2

    setActivityNotifications((prev) => {
      const next: Notification = {
        id: `activity-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        time: toNotificationTime(new Date(createdAt)),
        type,
        severity,
        sortWeight,
        createdAt
      }
      return [next, ...prev].slice(0, 20)
    })
  }

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const now = new Date()
        const startOfToday = new Date(now)
        startOfToday.setHours(0, 0, 0, 0)
        const endOfToday = new Date(now)
        endOfToday.setHours(23, 59, 59, 999)

        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)

        const [todayResponse, weekResponse] = await Promise.all([
          api.get('/api/analytics', {
            params: {
              startDate: startOfToday.toISOString(),
              endDate: endOfToday.toISOString()
            }
          }),
          api.get('/api/analytics', {
            params: {
              startDate: startOfWeek.toISOString(),
              endDate: endOfToday.toISOString()
            }
          })
        ])

        setQuickStats({
          todayExpense: Number(todayResponse.data?.summary?.totalExpenses) || 0,
          todayIncome: Number(todayResponse.data?.summary?.totalIncome) || 0,
          weekExpense: Number(weekResponse.data?.summary?.totalExpenses) || 0,
          weekIncome: Number(weekResponse.data?.summary?.totalIncome) || 0
        })
      } catch (error) {
        console.error('Failed to fetch quick stats:', error)
        setQuickStats({
          todayExpense: 0,
          todayIncome: 0,
          weekExpense: 0,
          weekIncome: 0
        })
      }
    }

    if (user) {
      fetchQuickStats()

      const handleTransactionUpdate = () => {
        fetchQuickStats()
      }

      window.addEventListener('transaction-updated', handleTransactionUpdate)
      return () => {
        window.removeEventListener('transaction-updated', handleTransactionUpdate)
      }
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getBillDueMessage = (dueDay: number, billName: string) => {
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

  const buildNotifications = (
    budgets: any[] = [],
    fixedBills: any[] = [],
    stats: QuickStats = { todayExpense: 0, todayIncome: 0, weekExpense: 0, weekIncome: 0 }
  ) => {
    const alerts: Notification[] = []
    const createdAt = Date.now()

    budgets.forEach((budget) => {
      const amount = Number(budget.amount) || 0
      const spent = Number(budget.spent) || 0
      const budgetName = budget.name || budget.category || 'Budget'

      if (amount <= 0) return

      const usagePercent = (spent / amount) * 100

      if (spent > amount) {
        alerts.push({
          id: `budget-over-${budget._id}`,
          text: `${budgetName} exceeded by ${formatAmount(spent - amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`,
          time: toNotificationTime(new Date(createdAt)),
          type: 'budget',
          severity: 'critical',
          sortWeight: 0,
          createdAt
        })
      } else if (usagePercent >= 80) {
        alerts.push({
          id: `budget-near-${budget._id}`,
          text: `${budgetName} is ${Math.round(usagePercent)}% used`,
          time: toNotificationTime(new Date(createdAt)),
          type: 'budget',
          severity: 'warning',
          sortWeight: 1,
          createdAt
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
            severity: dueMessage.severity as 'critical' | 'warning' | 'info',
            sortWeight: dueMessage.severity === 'critical' ? 0 : dueMessage.severity === 'warning' ? 1 : 2,
            createdAt
          })
        }
      })

    if (stats.todayIncome > 0 && stats.todayExpense > stats.todayIncome) {
      alerts.push({
        id: 'expense-over-income-today',
        text: `Today's expenses are higher than income by ${formatAmount(stats.todayExpense - stats.todayIncome, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`,
        time: toNotificationTime(new Date(createdAt)),
        type: 'expense',
        severity: 'warning',
        sortWeight: 1,
        createdAt
      })
    }

    if (stats.weekIncome > 0 && stats.weekExpense > stats.weekIncome * 1.25) {
      alerts.push({
        id: 'expense-over-income-week',
        text: 'Weekly expenses are significantly above weekly income.',
        time: toNotificationTime(new Date(createdAt)),
        type: 'expense',
        severity: 'critical',
        sortWeight: 0,
        createdAt
      })
    }

    if (budgets.length === 0) {
      alerts.push({
        id: 'no-budget-data',
        text: 'No budgets available right now.',
        time: toNotificationTime(new Date(createdAt)),
        type: 'system',
        severity: 'info',
        sortWeight: 2,
        createdAt
      })
    }

    return alerts.sort((a, b) => (a.sortWeight - b.sortWeight) || (b.createdAt - a.createdAt))
  }

  const fetchNotifications = async (options?: { force?: boolean }) => {
    if (notificationsCleared && !options?.force) {
      return
    }

    const nowTs = Date.now()
    if (!options?.force && nowTs - lastNotificationsFetchAtRef.current < 15000) {
      return
    }
    lastNotificationsFetchAtRef.current = nowTs

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

      setNotifications(buildNotifications(budgets, fixedBills, quickStats))
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
      setNotificationsError('Failed to load notifications')
    } finally {
      setNotificationsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    fetchNotifications({ force: true })

    const handleTransactionUpdate = () => {
      setNotificationsCleared(false)
      addActivityNotification('Transactions data updated.', { severity: 'info', type: 'system' })
      fetchNotifications()
    }

    const handleBudgetUpdate = (event: Event) => {
      setNotificationsCleared(false)
      const customEvent = event as CustomEvent
      const action = customEvent.detail?.action
      const budgetName = customEvent.detail?.budget?.name || customEvent.detail?.budget?.category || 'Budget'
      const isOverrun = Boolean(customEvent.detail?.overrun || customEvent.detail?.budget?.status === 'over')
      const amount = Number(customEvent.detail?.budget?.amount) || 0
      const spent = Number(customEvent.detail?.budget?.spent) || 0

      if (isOverrun && amount > 0 && spent > amount) {
        addActivityNotification(
          `${budgetName} exceeded by ${formatAmount(spent - amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}.`,
          { severity: 'critical', type: 'budget' }
        )
      } else if (action === 'update') {
        addActivityNotification(`${budgetName} limit updated.`, { severity: 'info', type: 'budget' })
      } else if (action === 'create') {
        addActivityNotification(`${budgetName} created.`, { severity: 'info', type: 'budget' })
      } else if (action === 'delete') {
        addActivityNotification(`${budgetName} removed.`, { severity: 'warning', type: 'budget' })
      } else {
        addActivityNotification('Budget data updated.', { severity: 'info', type: 'budget' })
      }

      fetchNotifications()
    }

    const handleSalaryPlannerUpdate = (event: Event) => {
      setNotificationsCleared(false)
      const customEvent = event as CustomEvent
      const action = customEvent.detail?.action
      const bill = customEvent.detail?.bill

      if (action === 'fixed-bill-status-changed' && bill) {
        const billName = bill.name || 'Bill'
        if (bill.status === 'paid') {
          addActivityNotification(`${billName} is marked as paid.`, { severity: 'info', type: 'bill' })
        } else {
          addActivityNotification(`${billName} is marked as unpaid.`, { severity: 'warning', type: 'bill' })
        }
      } else {
        addActivityNotification('Salary planner updated.', { severity: 'info', type: 'system' })
      }

      fetchNotifications({ force: true })
    }

    window.addEventListener('transaction-updated', handleTransactionUpdate)
    window.addEventListener('budget-updated', handleBudgetUpdate as EventListener)
    window.addEventListener('salary-planner-updated', handleSalaryPlannerUpdate as EventListener)

    return () => {
      window.removeEventListener('transaction-updated', handleTransactionUpdate)
      window.removeEventListener('budget-updated', handleBudgetUpdate as EventListener)
      window.removeEventListener('salary-planner-updated', handleSalaryPlannerUpdate as EventListener)
    }
  }, [user, notificationsCleared, quickStats.todayExpense, quickStats.todayIncome, quickStats.weekExpense, quickStats.weekIncome])

  const displayedNotifications = [...activityNotifications, ...notifications]
    .sort((a, b) => (a.sortWeight - b.sortWeight) || (b.createdAt - a.createdAt))

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200">
                  FinFlow
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase leading-none">
                  Beyond the Budget
                </span>
              </div>
            </Link>
          </div>

          {/* Right side - Quick Stats and User actions */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="font-medium">Today: </span>
                  <span>{formatAmount(quickStats.todayIncome, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center text-red-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="font-medium">Today: </span>
                  <span>{formatAmount(quickStats.todayExpense, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
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
                  {displayedNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                      <button
                        onClick={() => {
                          setNotifications([])
                          setActivityNotifications([])
                          setNotificationsError('')
                          setNotificationsCleared(true)
                        }}
                        className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsLoading && (
                        <div className="p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                        </div>
                      )}

                      {!notificationsLoading && notificationsError && displayedNotifications.length === 0 && (
                        <div className="p-4">
                          <p className="text-sm text-red-600 dark:text-red-400">{notificationsError}</p>
                        </div>
                      )}

                      {!notificationsLoading && !notificationsError && displayedNotifications.length === 0 && (
                        <div className="p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No active budget or bill alerts.</p>
                        </div>
                      )}

                      {!notificationsLoading && displayedNotifications.map((notification) => (
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
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name || 'User'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
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
