import React, { useState, useEffect, ChangeEvent, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { useDateFormatter } from '../utils/datePreferences'
import { api } from '../api'
import { 
  TrendingUp, 
  TrendingDown,
  Edit,
  Camera,
  Target,
  Wallet
} from 'lucide-react'

// --- Interfaces ---
interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface FinancialPeriod {
  income: number;
  expense: number;
  transactions: FinancialTransaction[];
}

interface FinancialData {
  overview: {
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
    savingsRate: number;
  };
  weekly: FinancialPeriod;
  monthly: FinancialPeriod;
  yearly: FinancialPeriod;
}

interface EditFormState {
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: 'green' | 'red' | 'blue' | 'purple';
}

interface TransactionListProps {
  transactions: FinancialTransaction[];
  title: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth()
  const { formatAmount } = useCurrency()
  const { formatDate } = useDateFormatter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editForm, setEditForm] = useState<EditFormState>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [financialLoading, setFinancialLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const formatMonthYear = (value: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(value)
  }

  const [financialData, setFinancialData] = useState<FinancialData>({
    overview: {
      totalIncome: 0,
      totalExpense: 0,
      currentBalance: 0,
      savingsRate: 0
    },
    weekly: {
      income: 0,
      expense: 0,
      transactions: []
    },
    monthly: {
      income: 0,
      expense: 0,
      transactions: []
    },
    yearly: {
      income: 0,
      expense: 0,
      transactions: []
    }
  })

  useEffect(() => {
    fetchFinancialData()
    const handleTransactionUpdate = () => {
      fetchFinancialData()
    }
    window.addEventListener('transaction-updated', handleTransactionUpdate)
    return () => {
      window.removeEventListener('transaction-updated', handleTransactionUpdate)
    }
  }, [])

  useEffect(() => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    })
  }, [user])

  const fetchFinancialData = async () => {
    try {
      setFinancialLoading(true)

      const now = new Date()
      const endDate = new Date(now)
      endDate.setHours(23, 59, 59, 999)

      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - 6)
      startOfWeek.setHours(0, 0, 0, 0)

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)

      const startOfYear = new Date(now.getFullYear(), 0, 1)
      startOfYear.setHours(0, 0, 0, 0)

      const fetchPeriodData = async (startDate: Date, periodLimit = 10): Promise<FinancialPeriod> => {
        const [analyticsRes, txRes] = await Promise.all([
          api.get('/api/analytics', {
            params: {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            }
          }),
          api.get('/api/transactions', {
            params: {
              page: 1,
              limit: periodLimit,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            }
          })
        ])

        const summary = analyticsRes.data?.summary || {}
        const txs = Array.isArray(txRes.data?.transactions) ? txRes.data.transactions : []

        return {
          income: Number(summary.totalIncome) || 0,
          expense: Number(summary.totalExpenses) || 0,
          transactions: txs.map((tx: any) => ({
            id: String(tx._id),
            description: tx.description || 'Untitled transaction',
            amount: Number(tx.amount) || 0,
            type: tx.type === 'income' ? 'income' : 'expense',
            date: tx.date
          }))
        }
      }

      const [summaryRes, weekly, monthly, yearly] = await Promise.all([
        api.get('/api/transactions/summary'),
        fetchPeriodData(startOfWeek, 8),
        fetchPeriodData(startOfMonth, 10),
        fetchPeriodData(startOfYear, 10)
      ])

      const totalIncome = Number(summaryRes.data?.totalIncome) || 0
      const totalExpense = Number(summaryRes.data?.totalExpenses) || 0
      const currentBalance = totalIncome - totalExpense
      const savingsRate = totalIncome > 0 ? Number((((currentBalance / totalIncome) * 100).toFixed(1))) : 0

      setFinancialData({
        overview: {
          totalIncome,
          totalExpense,
          currentBalance,
          savingsRate
        },
        weekly,
        monthly,
        yearly
      })
    } catch (error) {
      console.error('Failed to fetch financial data:', error)
    } finally {
      setFinancialLoading(false)
    }
  }

  const handleEditProfile = async () => {
    setLoading(true)
    setMessage('')

    const result = await updateProfile(editForm)
    
    if (result.success) {
      setMessage('Profile updated successfully!')
      setIsEditing(false)
    } else {
      setMessage(result.error || 'An error occurred')
    }
    
    setLoading(false)
  }

  const formatCurrency = (amount: number) => formatAmount(amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file (JPG, PNG, WEBP).')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image size must be 2MB or less.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setEditForm((prev) => ({ ...prev, avatar: result }))
      setMessage('Profile photo selected. Click Save Changes to apply.')
    }
    reader.readAsDataURL(file)
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 sm:p-6 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 break-words">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${
          color === 'green' ? 'bg-green-600 dark:bg-green-500' :
          color === 'red' ? 'bg-red-600 dark:bg-red-500' :
          color === 'purple' ? 'bg-purple-600 dark:bg-purple-500' :
          'bg-blue-600 dark:bg-blue-500'
        }`}>
          <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )

  const TransactionList: React.FC<TransactionListProps> = ({ transactions, title }) => (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-100 dark:border-slate-700">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {transactions.length === 0 && (
          <div className="px-4 sm:px-6 py-6 text-sm text-gray-500 dark:text-gray-400">No transactions for this range.</div>
        )}
        {transactions.map((transaction) => (
          <div key={transaction.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{transaction.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
            </div>
            <div className={`text-sm font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow mb-8 border border-gray-100 dark:border-slate-700">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="relative">
                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {editForm.avatar ? (
                    <img src={editForm.avatar} alt="Profile avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
                <button
                  type="button"
                  onClick={handleAvatarButtonClick}
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-600"
                >
                  <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 break-words">{user?.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-all">{user?.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Member since {formatMonthYear(user?.createdAt ? new Date(user.createdAt) : new Date())}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          {isEditing && (
            <div className="mt-6 p-4 sm:p-6 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEditProfile}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
              {message && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  message.includes('successfully') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Financial Overview Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow mb-8 border border-gray-100 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex gap-4 sm:gap-8 px-4 sm:px-6 overflow-x-auto whitespace-nowrap scrollbar-thin">
            {['overview', 'weekly', 'monthly', 'yearly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {financialLoading && (
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">Loading latest financial data...</div>
          )}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Income"
                value={formatCurrency(financialData.overview.totalIncome)}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Total Expenses"
                value={formatCurrency(financialData.overview.totalExpense)}
                icon={TrendingDown}
                color="red"
              />
              <StatCard
                title="Current Balance"
                value={formatCurrency(financialData.overview.currentBalance)}
                icon={Wallet}
                color="blue"
              />
              <StatCard
                title="Savings Rate"
                value={`${financialData.overview.savingsRate}%`}
                icon={Target}
                color="purple"
              />
            </div>
          )}

          {activeTab === 'weekly' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatCard
                  title="Weekly Income"
                  value={formatCurrency(financialData.weekly.income)}
                  icon={TrendingUp}
                  color="green"
                />
                <StatCard
                  title="Weekly Expenses"
                  value={formatCurrency(financialData.weekly.expense)}
                  icon={TrendingDown}
                  color="red"
                />
              </div>
              <TransactionList 
                transactions={financialData.weekly.transactions} 
                title="Recent Transactions" 
              />
            </div>
          )}

          {activeTab === 'monthly' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatCard
                  title="Monthly Income"
                  value={formatCurrency(financialData.monthly.income)}
                  icon={TrendingUp}
                  color="green"
                />
                <StatCard
                  title="Monthly Expenses"
                  value={formatCurrency(financialData.monthly.expense)}
                  icon={TrendingDown}
                  color="red"
                />
              </div>
              <TransactionList 
                transactions={financialData.monthly.transactions} 
                title="Monthly Transactions" 
              />
            </div>
          )}

          {activeTab === 'yearly' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatCard
                  title="Yearly Income"
                  value={formatCurrency(financialData.yearly.income)}
                  icon={TrendingUp}
                  color="green"
                />
                <StatCard
                  title="Yearly Expenses"
                  value={formatCurrency(financialData.yearly.expense)}
                  icon={TrendingDown}
                  color="red"
                />
              </div>
              <TransactionList 
                transactions={financialData.yearly.transactions} 
                title="Yearly Transactions" 
              />
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Profile
