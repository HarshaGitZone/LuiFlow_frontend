import React, { useState, useEffect } from 'react'
import { Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react'
import { api } from '../api'
import API from '../api'
import { useCurrency } from '../contexts/CurrencyContext'

interface ReportData {
  totalIncome: number
  totalExpenses: number
  netFlow: number
  savingsRate: number
  transactionCount: number
  categories: Array<{
    category: string
    amount: number
    count: number
    percentage: number
  }>
  monthlyData: Array<{
    month: string
    income: number
    expenses: number
    netFlow: number
  }>
}

const Reports: React.FC = () => {
  const { formatAmount } = useCurrency()
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  const [endDate, setEndDate] = useState(new Date().toISOString())
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    if (reportType === 'monthly') {
      setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      setEndDate(new Date().toISOString())
    } else if (reportType === 'quarterly') {
      const quarterStart = new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1)
      setStartDate(quarterStart.toISOString())
      setEndDate(new Date().toISOString())
    } else if (reportType === 'yearly') {
      setStartDate(new Date(new Date().getFullYear(), 0, 1).toISOString())
      setEndDate(new Date().toISOString())
    }
  }, [reportType])

  const generateReport = async () => {
    try {
      setLoading(true)
      const response = await api.get(API.ANALYTICS, {
        params: {
          startDate,
          endDate
        }
      })

      const analyticsData = response.data
      const processedData: ReportData = {
        totalIncome: analyticsData.summary?.totalIncome || 0,
        totalExpenses: analyticsData.summary?.totalExpenses || 0,
        netFlow: analyticsData.summary?.netFlow || 0,
        savingsRate: analyticsData.summary?.savingsRate || 0,
        transactionCount: (analyticsData.summary?.incomeCount || 0) + (analyticsData.summary?.expenseCount || 0),
        categories: analyticsData.expenseCategories || [],
        monthlyData: analyticsData.monthlyTrends || []
      }

      setReportData(processedData)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (format: 'csv' | 'pdf') => {
    try {
      setGeneratingReport(true)
      const response = await api.get(`/api/reports/export`, {
        params: {
          format,
          startDate,
          endDate,
          reportType
        },
        responseType: 'blob'
      })

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf'
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `financial-report-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download report:', error)
    } finally {
      setGeneratingReport(false)
    }
  }

  const getReportTypeName = (): string => {
    switch (reportType) {
      case 'monthly':
        return 'Monthly Report'
      case 'quarterly':
        return 'Quarterly Report'
      case 'yearly':
        return 'Yearly Report'
      default:
        return 'Report'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate and download financial reports</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate.split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={endDate.split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          
          {reportData && (
            <>
              <button
                onClick={() => downloadReport('csv')}
                disabled={generatingReport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {generatingReport ? 'Downloading...' : 'Download CSV'}
              </button>
              
              <button
                onClick={() => downloadReport('pdf')}
                disabled={generatingReport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                {generatingReport ? 'Downloading...' : 'Download PDF'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{getReportTypeName()}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatAmount(reportData.totalIncome)}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-2">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatAmount(reportData.totalExpenses)}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Flow</h4>
              <p className={`text-2xl font-bold ${
                reportData.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatAmount(reportData.netFlow)}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full mx-auto mb-2">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {reportData.transactionCount}
              </p>
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expense Categories</h4>
            <div className="space-y-3">
              {reportData.categories.slice(0, 10).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {formatAmount(category.amount)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Trends</h4>
            <div className="space-y-3">
              {reportData.monthlyData.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{month.month}</p>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        Income: {formatAmount(month.income)}
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        Expenses: {formatAmount(month.expenses)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      month.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatAmount(month.netFlow)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Savings Rate</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.savingsRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Average Transaction</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatAmount((reportData.totalIncome + reportData.totalExpenses) / reportData.transactionCount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
