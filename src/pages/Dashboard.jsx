import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, IndianRupee, Receipt, BarChart3, Zap, Target } from 'lucide-react'
import { api } from '../api'
import API from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import WelcomeHeader from '../components/WelcomeHeader'
import { useDateFormatter } from '../utils/datePreferences'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const Dashboard = () => {
  const { formatAmount, formatAmountWithSign } = useCurrency()
  const { formatDate } = useDateFormatter()
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netFlow: 0 })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [monthlyStats, setMonthlyStats] = useState({ 
    income: 0, 
    expenses: 0, 
    netFlow: 0,
    savingsRate: 0,
    topCategory: 'N/A',
    transactionCount: 0
  })
  const [monthlyCategories, setMonthlyCategories] = useState([])
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
        const topExpenseCategories = analyticsData.expenseCategories.slice(0, 5)
        const monthlyNetFlow = analyticsData.summary.totalIncome - analyticsData.summary.totalExpenses
        const monthlySavingsRate = analyticsData.summary.totalIncome > 0 
          ? ((monthlyNetFlow / analyticsData.summary.totalIncome) * 100).toFixed(1)
          : 0
        
        setMonthlyStats({
          income: analyticsData.summary.totalIncome,
          expenses: analyticsData.summary.totalExpenses,
          netFlow: monthlyNetFlow,
          savingsRate: monthlySavingsRate,
          topCategory: analyticsData.expenseCategories.length > 0 ? analyticsData.expenseCategories[0].category : 'None',
          transactionCount: analyticsData.summary.incomeCount + analyticsData.summary.expenseCount
        })
        
        setMonthlyCategories(topExpenseCategories.map(cat => ({
          name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
          amount: cat.amount,
          percentage: cat.percentage
        })))

        // Fetch all-time stats
        const allTimeResponse = await api.get(API.ANALYTICS)
        const allTimeData = allTimeResponse.data
        const avgMonthlyExpense = allTimeData.summary.totalExpenses > 0 
          ? Math.round(allTimeData.summary.totalExpenses / 12)
          : 0

        setAllTimeStats({
          totalTransactions: allTimeData.summary.incomeCount + allTimeData.summary.expenseCount,
          avgMonthlyExpense,
          highestExpenseCategory: allTimeData.expenseCategories.length > 0 ? allTimeData.expenseCategories[0].category : 'N/A'
        })

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <IndianRupee className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-semibold text-gray-900">{formatAmount(summary.totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">{formatAmount(summary.totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Flow</p>
              <p className="text-2xl font-semibold text-gray-900">{formatAmount(summary.netFlow)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">{recentTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category} • {formatDate(transaction.date)}</p>
                  </div>
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmountWithSign(transaction.amount, transaction.type)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex flex-col">
                <span className="text-sm text-green-800 font-semibold">Last Month Income</span>
                <span className="text-xs text-green-600">Transactions: {monthlyStats.transactionCount}</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                {formatAmount(monthlyStats.income)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex flex-col">
                <span className="text-sm text-red-800 font-semibold">Last Month Expenses</span>
                <span className="text-xs text-red-600">Total spent</span>
              </div>
              <span className="text-lg font-bold text-red-700">
                {formatAmount(monthlyStats.expenses)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col">
                <span className="text-sm text-blue-800 font-semibold">Last Month Net Flow</span>
                <span className="text-xs text-blue-600">Income - Expenses</span>
              </div>
              <span className={`text-lg font-bold ${monthlyStats.netFlow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {formatAmount(monthlyStats.netFlow)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex flex-col">
                <span className="text-sm text-orange-800 font-semibold">Top Spend Category</span>
                <span className="text-xs text-orange-600">Most expenses</span>
              </div>
              <span className="text-lg font-bold text-orange-700 capitalize">
                {monthlyStats.topCategory}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-900">Total Transactions</h3>
            <Receipt className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{allTimeStats.totalTransactions}</p>
          <p className="text-xs text-blue-600 mt-1">Across all time</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-amber-900">Avg Monthly Expense</h3>
            <TrendingDown className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-900">{formatAmount(allTimeStats.avgMonthlyExpense)}</p>
          <p className="text-xs text-amber-600 mt-1">Average per month</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-teal-900">Highest Spend Category</h3>
            <Target className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-3xl font-bold text-teal-900 capitalize">{allTimeStats.highestExpenseCategory}</p>
          <p className="text-xs text-teal-600 mt-1">Most frequent category</p>
        </div>
      </div>

      {/* Last Month Expense Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Last Month - Expenses by Category</h2>
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        
        {monthlyCategories.length > 0 ? (
          <div className="space-y-4">
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatAmount(value, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>

            {/* Category Breakdown List */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h3>
              <div className="space-y-2">
                {monthlyCategories.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-full" 
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                        {formatAmount(cat.amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs text-gray-500 w-10 text-right">{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No expense data for last month</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard

