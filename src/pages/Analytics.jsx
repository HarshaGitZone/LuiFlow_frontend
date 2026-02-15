import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react'
import { api, API } from '../api'

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30days')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    summary: { totalIncome: 0, totalExpenses: 0, netFlow: 0, savingsRate: 0, incomeCount: 0, expenseCount: 0 },
    categorySpend: [],
    trend: []
  })

  // Calculate Date Ranges
  const getDateRangeParams = (range) => {
    const end = new Date()
    let start = new Date()

    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        break
      case '7days':
        start.setDate(end.getDate() - 7)
        break
      case '30days':
        start.setDate(end.getDate() - 30)
        break
      case 'year':
        start.setFullYear(end.getFullYear() - 1)
        break
      case 'all':
        return {} // No filter
      default:
        start.setDate(end.getDate() - 30)
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = getDateRangeParams(dateRange)
      const response = await api.get(API.ANALYTICS, { params })
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.summary.totalIncome)}</p>
              <p className="text-xs text-gray-500">{data.summary.incomeCount} transactions</p>
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
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.summary.totalExpenses)}</p>
              <p className="text-xs text-gray-500">{data.summary.expenseCount} transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Flow</p>
              <p className={`text-2xl font-semibold ${data.summary.netFlow >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                {formatCurrency(data.summary.netFlow)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{data.summary.savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
          <div className="space-y-3">
            {data.categorySpend.length > 0 ? (
              data.categorySpend.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">{item.percentage}%</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No expense data for this period</p>
            )}
          </div>
        </div>

        {/* Trend Over Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trend Over Time</h2>
          <div className="space-y-3">
            {data.trend.length > 0 ? (
              data.trend.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 w-20">{item.key}</span>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-xs text-green-600">{formatCurrency(item.income)}</p>
                      <p className="text-xs text-red-600">{formatCurrency(item.expenses)}</p>
                    </div>
                    <div className="w-24 text-right">
                      <span className={`text-sm font-bold ${item.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(item.net)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No trend data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
