import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, PieChart } from 'lucide-react'
import { api, API } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  LineChart, Line, PieChart as RechartsChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface SummaryItem {
  category: string
  amount: number
  percentage: number
}

interface TrendItem {
  key: string
  income: number
  expenses: number
  net: number
}

interface AnalyticsData {
  summary: {
    totalIncome: number
    totalExpenses: number
    netFlow: number
    savingsRate: number
    incomeCount: number
    expenseCount: number
  }
  incomeCategories: SummaryItem[]
  expenseCategories: SummaryItem[]
  trend: TrendItem[]
}

interface CategorySummaryProps {
  data: SummaryItem[]
  title: string
  type: 'income' | 'expense'
  formatAmount: (amount: number, options?: Intl.NumberFormatOptions) => string
}

const getColors = (count: number): string[] => {
  const baseColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
    '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#64748B'
  ]
  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length])
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ data, title, type, formatAmount }) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  
  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-4 h-4 rounded-full ${type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{item.category}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}% of {type}</p>
                </div>
              </div>
              <p className={`text-base sm:text-lg font-bold text-left sm:text-right ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatAmount(item.amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </p>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Total {type}</span>
            <span className={`text-lg sm:text-xl font-bold text-right ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatAmount(total, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface DonutChartProps {
  data: SummaryItem[]
  title: string
  formatAmount: (amount: number, options?: Intl.NumberFormatOptions) => string
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, formatAmount }) => {
  const colors = getColors(data.length)
  const chartData = data.map((item) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.amount
  }))

  // const formatTooltipValue = (value: number | string | Array<number | string>): [string, string] => {
  //   const numeric = Array.isArray(value) ? Number(value[0]) : Number(value)
  //   const formatted = formatAmount(Number.isFinite(numeric) ? numeric : 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })
  //   return [formatted, 'Amount']
  // }
const formatTooltipValue = (value: any) => {
  const numeric = Number(value);
  return formatAmount(Number.isFinite(numeric) ? numeric : 0, { 
    maximumFractionDigits: 0, 
    minimumFractionDigits: 0 
  });
};
  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
      ) : (
        <div className="w-full h-[260px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltipValue} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RechartsChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

interface TrendChartProps {
  data: TrendItem[]
  dateRange: string
  formatAmount: (amount: number, options?: Intl.NumberFormatOptions) => string
}

const TrendChart: React.FC<TrendChartProps> = ({ data, dateRange, formatAmount }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Trend Over Time</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No trend data available</p>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.key,
    income: item.income,
    expenses: item.expenses,
    net: item.net
  }))

  // const formatTooltipValue = (value: number | string | Array<number | string>): [string, string] => {
  //   const numeric = Array.isArray(value) ? Number(value[0]) : Number(value)
  //   const formatted = formatAmount(Number.isFinite(numeric) ? numeric : 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })
  //   return [formatted, 'Amount']
  // }
  const formatTooltipValue = (value: any) => {
  const numeric = Number(value);
  return formatAmount(Number.isFinite(numeric) ? numeric : 0, { 
    maximumFractionDigits: 0, 
    minimumFractionDigits: 0 
  });
};

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Trend Over Time {dateRange === '7days' && '(Daily)'}
        {dateRange === '30days' && '(Daily)'}
        {dateRange === 'year' && '(Monthly)'}
        {dateRange === 'all' && '(Monthly)'}
      </h2>
      <div className="w-full h-[300px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" angle={-35} textAnchor="end" height={85} interval="preserveStartEnd" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip 
              formatter={formatTooltipValue}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10B981" 
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              dot={{ fill: '#EF4444', r: 4 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface DetailedBreakdownProps {
  data: TrendItem[]
  dateRange: string
  formatAmount: (amount: number, options?: Intl.NumberFormatOptions) => string
}

const DetailedBreakdown: React.FC<DetailedBreakdownProps> = ({ data, dateRange, formatAmount }) => {
  if (!data || data.length === 0) {
    return null
  }

  let breakdownTitle = 'Detailed Daily Breakdown'
  if (dateRange === '30days') breakdownTitle = 'Detailed Daily Breakdown'
  if (dateRange === 'year') breakdownTitle = 'Detailed Monthly Breakdown'
  if (dateRange === 'all') breakdownTitle = 'Detailed Monthly Breakdown'

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{breakdownTitle}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Period</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Income</span>
                </div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Expenses</span>
                </div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Net Flow</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Savings</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const savingsRate = item.income > 0 ? ((item.income - item.expenses) / item.income * 100).toFixed(1) : 0
              return (
                <tr key={index} className="border-b border-gray-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{item.key}</td>
                  <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">
                    {formatAmount(item.income, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                    {formatAmount(item.expenses, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${item.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatAmount(item.net, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-purple-600 dark:text-purple-400">
                    {savingsRate}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Analytics: React.FC = () => {
  const { formatAmount } = useCurrency()
  const [dateRange, setDateRange] = useState<string>('30days')
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<AnalyticsData>({
    summary: { totalIncome: 0, totalExpenses: 0, netFlow: 0, savingsRate: 0, incomeCount: 0, expenseCount: 0 },
    incomeCategories: [],
    expenseCategories: [],
    trend: []
  })

  const getDateRangeParams = (range: string): { startDate?: string; endDate?: string } => {
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
        return {}
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Comprehensive financial analysis and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-medium"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/25 dark:to-green-800/20 border border-green-200 dark:border-green-700 p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Income</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-200 mt-2 break-words">{formatAmount(data.summary.totalIncome, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">{data.summary.incomeCount} transactions</p>
            </div>
            <div className="p-2 bg-green-200 dark:bg-green-900/35 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/25 dark:to-red-800/20 border border-red-200 dark:border-red-700 p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Expenses</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 dark:text-red-200 mt-2 break-words">{formatAmount(data.summary.totalExpenses, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">{data.summary.expenseCount} transactions</p>
            </div>
            <div className="p-2 bg-red-200 dark:bg-red-900/35 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${data.summary.netFlow >= 0 ? 'from-blue-50 to-blue-100 dark:from-blue-900/25 dark:to-blue-800/20 border-blue-200 dark:border-blue-700' : 'from-orange-50 to-orange-100 dark:from-orange-900/25 dark:to-orange-800/20 border-orange-200 dark:border-orange-700'} border p-4 sm:p-6 rounded-lg shadow-sm`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${data.summary.netFlow >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>Net Flow</p>
              <p className={`text-2xl sm:text-3xl font-bold mt-2 break-words ${data.summary.netFlow >= 0 ? 'text-blue-900 dark:text-blue-200' : 'text-orange-900 dark:text-orange-200'}`}>
                {formatAmount(data.summary.netFlow, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </p>
              <p className={`text-xs mt-1 ${data.summary.netFlow >= 0 ? 'text-blue-600 dark:text-blue-300' : 'text-orange-600 dark:text-orange-300'}`}>
                {data.summary.netFlow >= 0 ? 'Positive' : 'Deficit'}
              </p>
            </div>
            <div className={`p-2 ${data.summary.netFlow >= 0 ? 'bg-blue-200 dark:bg-blue-900/35' : 'bg-orange-200 dark:bg-orange-900/35'} rounded-lg`}>
              <Activity className={`h-6 w-6 ${data.summary.netFlow >= 0 ? 'text-blue-600 dark:text-blue-300' : 'text-orange-600 dark:text-orange-300'}`} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/25 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Savings Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-200 mt-2">{data.summary.savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">Of total income</p>
            </div>
            <div className="p-2 bg-purple-200 dark:bg-purple-900/35 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategorySummary 
          data={data.incomeCategories}
          title="Income by Category"
          type="income"
          formatAmount={formatAmount}
        />
        {data.incomeCategories.length > 0 && (
          <DonutChart 
            data={data.incomeCategories}
            title="Income Distribution"
            formatAmount={formatAmount}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategorySummary 
          data={data.expenseCategories}
          title="Expenses by Category"
          type="expense"
          formatAmount={formatAmount}
        />
        {data.expenseCategories.length > 0 && (
          <DonutChart 
            data={data.expenseCategories}
            title="Expense Distribution"
            formatAmount={formatAmount}
          />
        )}
      </div>

      {data.trend && data.trend.length > 0 && (
        <TrendChart data={data.trend} dateRange={dateRange} formatAmount={formatAmount} />
      )}

      <DetailedBreakdown data={data.trend} dateRange={dateRange} formatAmount={formatAmount} />
    </div>
  )
}

export default Analytics
