import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, DollarSign, Activity, Filter } from 'lucide-react'
import { api } from '../api'
import API from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  summary: {
    totalIncome: number
    totalExpenses: number
    netFlow: number
    savingsRate: number
    incomeCount: number
    expenseCount: number
  }
  categoryBreakdown: {
    income: Array<{
      category: string
      amount: number
      count: number
      percentage: number
    }>
    expenses: Array<{
      category: string
      amount: number
      count: number
      percentage: number
    }>
  }
  monthlyTrends: Array<{
    month: string
    income: number
    expenses: number
    netFlow: number
  }>
  topSpendingCategories: Array<{
    category: string
    amount: number
    count: number
  }>
  periodComparison: {
    currentPeriod: {
      income: number
      expenses: number
      netFlow: number
    }
    previousPeriod: {
      income: number
      expenses: number
      netFlow: number
    }
    incomeChange: number
    expenseChange: number
    netFlowChange: number
  }
  budgetComparison: Array<{
    category: string
    budgeted: number
    actual: number
    variance: number
    percentage: number
  }>
  unusualSpikes: Array<{
    date: string
    amount: number
    count: number
    deviation: string
  }>
  insights: {
    totalTransactions: number
    averageTransactionValue: number
    highestExpenseDay: any
    budgetUtilization: number
  }
}

const Analytics: React.FC = () => {
  const { formatAmount } = useCurrency()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date().toISOString()
  })
  const [comparisonType, setComparisonType] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, comparisonType])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get(API.ANALYTICS, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          comparisonType
        }
      })
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b']

  const getColors = (count: number): string[] => {
    return Array.from({ length: count }, (_, i) => COLORS[i % COLORS.length])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No analytics data available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your financial performance</p>
      </div>

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
                    {formatAmount(data.summary.totalIncome)}
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
                    {formatAmount(data.summary.totalExpenses)}
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
                  <span className={`text-2xl font-semibold ${
                    data.summary.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatAmount(data.summary.netFlow)}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-md p-3">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Savings Rate</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {data.summary.savingsRate.toFixed(1)}%
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  formatAmount(value),
                  name
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="netFlow" 
                stroke="#3b82f6" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Income Categories</h4>
              {data.categoryBreakdown.income.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie>
                      <Pie
                        data={data.categoryBreakdown.income}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {data.categoryBreakdown.income.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColors(data.categoryBreakdown.income.length)[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [formatAmount(value), 'Amount']} />
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  No income data available
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Expense Categories</h4>
              {data.categoryBreakdown.expenses.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie>
                      <Pie
                        data={data.categoryBreakdown.expenses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {data.categoryBreakdown.expenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColors(data.categoryBreakdown.expenses.length)[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [formatAmount(value), 'Amount']} />
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  No expense data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Spending Categories */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Spending Categories</h3>
          {data.topSpendingCategories.length > 0 ? (
            <div className="space-y-3">
              {data.topSpendingCategories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {formatAmount(category.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No spending data available
            </div>
          )}
        </div>

        {/* Period Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Period Comparison</h3>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Income</span>
                <span className={`text-sm font-medium ${
                  data.periodComparison.incomeChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.periodComparison.incomeChange >= 0 ? '+' : ''}{data.periodComparison.incomeChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Current: {formatAmount(data.periodComparison.currentPeriod.income)}</span>
                <span>Previous: {formatAmount(data.periodComparison.previousPeriod.income)}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expenses</span>
                <span className={`text-sm font-medium ${
                  data.periodComparison.expenseChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.periodComparison.expenseChange >= 0 ? '+' : ''}{data.periodComparison.expenseChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Current: {formatAmount(data.periodComparison.currentPeriod.expenses)}</span>
                <span>Previous: {formatAmount(data.periodComparison.previousPeriod.expenses)}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Flow</span>
                <span className={`text-sm font-medium ${
                  data.periodComparison.netFlowChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.periodComparison.netFlowChange >= 0 ? '+' : ''}{data.periodComparison.netFlowChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Current: {formatAmount(data.periodComparison.currentPeriod.netFlow)}</span>
                <span>Previous: {formatAmount(data.periodComparison.previousPeriod.netFlow)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget Utilization</h3>
          {data.budgetComparison.length > 0 ? (
            <div className="space-y-3">
              {data.budgetComparison.slice(0, 5).map((budget, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{budget.category}</span>
                    <span className={`text-sm font-medium ${
                      budget.percentage >= 100 ? 'text-red-600 dark:text-red-400' : budget.percentage >= 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {budget.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        budget.percentage >= 100 ? 'bg-red-500' : 
                        budget.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <span>Budgeted: {formatAmount(budget.budgeted)}</span>
                    <span>Spent: {formatAmount(budget.actual)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No budget data available
            </div>
          )}
        </div>
      </div>

      {/* Unusual Spikes */}
      {data.unusualSpikes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Unusual Spending Spikes</h3>
          <div className="space-y-3">
            {data.unusualSpikes.slice(0, 5).map((spike, index) => (
              <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">{spike.date}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{spike.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-900 dark:text-red-100">
                      {formatAmount(spike.amount)}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {spike.deviation}σ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
