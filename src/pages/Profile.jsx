import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { 
  User, 
  Mail, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  IndianRupee,
  Edit,
  Camera,
  Download,
  Eye,
  PieChart,
  BarChart3,
  Target,
  Wallet
} from 'lucide-react'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const { formatAmount } = useCurrency()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Financial data states
  const [financialData, setFinancialData] = useState({
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
  }, [])

  const fetchFinancialData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockData = {
        overview: {
          totalIncome: 450000,
          totalExpense: 320000,
          currentBalance: 130000,
          savingsRate: 28.9
        },
        weekly: {
          income: 15000,
          expense: 8500,
          transactions: [
            { id: 1, description: 'Salary', amount: 15000, type: 'income', date: '2024-01-15' },
            { id: 2, description: 'Grocery Shopping', amount: 2500, type: 'expense', date: '2024-01-14' },
            { id: 3, description: 'Electric Bill', amount: 1200, type: 'expense', date: '2024-01-13' },
            { id: 4, description: 'Freelance Project', amount: 5000, type: 'income', date: '2024-01-12' },
          ]
        },
        monthly: {
          income: 45000,
          expense: 32000,
          transactions: [
            { id: 1, description: 'Monthly Salary', amount: 45000, type: 'income', date: '2024-01-01' },
            { id: 2, description: 'Rent', amount: 15000, type: 'expense', date: '2024-01-01' },
            { id: 3, description: 'Investment Returns', amount: 8000, type: 'income', date: '2024-01-15' },
          ]
        },
        yearly: {
          income: 540000,
          expense: 384000,
          transactions: [
            { id: 1, description: 'Annual Bonus', amount: 120000, type: 'income', date: '2024-03-15' },
            { id: 2, description: 'Car Purchase', amount: 800000, type: 'expense', date: '2024-06-20' },
          ]
        }
      }
      setFinancialData(mockData)
    } catch (error) {
      console.error('Failed to fetch financial data:', error)
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
      setMessage(result.error)
    }
    
    setLoading(false)
  }

  const formatCurrency = (amount) => formatAmount(amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  const TransactionList = ({ transactions, title }) => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
              <p className="text-sm text-gray-500">{transaction.date}</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          {isEditing && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleEditProfile}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
              {message && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Financial Overview Tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'weekly', 'monthly', 'yearly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <Download className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Export Data</span>
        </button>
        <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <PieChart className="h-5 w-5 text-green-600" />
          <span className="font-medium">View Reports</span>
        </button>
        <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span className="font-medium">Analytics</span>
        </button>
      </div>
    </div>
  )
}

export default Profile
