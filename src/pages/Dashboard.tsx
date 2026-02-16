import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, IndianRupee, Receipt, BarChart3, Zap, Target } from 'lucide-react'
import { api } from '../api'
import API from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import WelcomeHeader from '../components/WelcomeHeader'
import { useDateFormatter } from '../utils/datePreferences'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const Dashboard: React.FC = () => {
  const { formatAmount, formatAmountWithSign } = useCurrency()
  const { formatDate } = useDateFormatter()
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netFlow: 0 })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [monthlyStats, setMonthlyStats] = useState({ 
    income: 0, 
    expenses: 0, 
    netFlow: 0,
    savingsRate: 0,
    topCategory: 'N/A',
    transactionCount: 0
  })
  const [monthlyCategories, setMonthlyCategories] = useState<any[]>([])
  const [allTimeStats, setAllTimeStats] = useState({
    totalTransactions: 0,
    avgMonthlyExpense: 0,
    highestExpenseCategory: 'N/A'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const summaryResponse = await api.get(API.TRANSACTIONS_SUMMARY)
        setSummary(summaryResponse.data)

        const transactionsResponse = await api.get(`${API.TRANSACTIONS}?limit=5`)
        setRecentTransactions(transactionsResponse.data.transactions)

        // Fetch Last Month's stats
        const now = new Date()
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        const analyticsResponse = await api.get(API.ANALYTICS, {
          params: {
            startDate: startOfLastMonth.toISOString(),
            endDate: endOfLastMonth.toISOString()
          }
        })

        const analyticsData = analyticsResponse.data
        setMonthlyStats({
          income: analyticsData.summary?.totalIncome || 0,
          expenses: analyticsData.summary?.totalExpenses || 0,
          netFlow: analyticsData.summary?.netFlow || 0,
          savingsRate: analyticsData.summary?.savingsRate || 0,
          topCategory: analyticsData.expenseCategories?.[0]?.category || 'N/A',
          transactionCount: (analyticsData.summary?.incomeCount || 0) + (analyticsData.summary?.expenseCount || 0)
        })

        setMonthlyCategories(analyticsData.expenseCategories?.slice(0, 5) || [])

        // All-time stats
        const allTimeResponse = await api.get(API.ANALYTICS)
        const allTimeData = allTimeResponse.data
        setAllTimeStats({
          totalTransactions: (allTimeData.summary?.incomeCount || 0) + (allTimeData.summary?.expenseCount || 0),
          avgMonthlyExpense: allTimeData.expenseCategories?.reduce((sum: number, cat: any) => sum + cat.amount, 0) / 12 || 0,
          highestExpenseCategory: allTimeData.expenseCategories?.[0]?.category || 'N/A'
        })

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Income</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatAmount(summary.totalIncome)}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/20 rounded-md p-3">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Expenses</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatAmount(summary.totalExpenses)}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Net Flow</dt>
                <dd className="flex items-baseline">
                  <span className={`text-2xl font-semibold ${summary.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatAmountWithSign(summary.netFlow, summary.netFlow >= 0 ? 'income' : 'expense')}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-md p-3">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Savings Rate</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {summary.totalIncome > 0 ? Math.round((summary.netFlow / summary.totalIncome) * 100) : 0}%
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Categories Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Expenses by Category</h3>
          {monthlyCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [formatAmount(value), 'Amount']}
                />
                <Bar dataKey="amount" fill="#ef4444">
                  {monthlyCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No expense data available
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 rounded-md p-2 ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900/20' 
                        : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatAmountWithSign(transaction.amount, transaction.type)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No transactions available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Last Month Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Income</p>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              {formatAmount(monthlyStats.income)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Expenses</p>
            <p className="text-xl font-semibold text-red-600 dark:text-red-400">
              {formatAmount(monthlyStats.expenses)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Flow</p>
            <p className={`text-xl font-semibold ${monthlyStats.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatAmountWithSign(monthlyStats.netFlow, monthlyStats.netFlow >= 0 ? 'income' : 'expense')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Top Category</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {monthlyStats.topCategory}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
