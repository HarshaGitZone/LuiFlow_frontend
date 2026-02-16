// import React, { useState, useEffect } from 'react'
// import { Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react'
// import { api } from '../api'
// import API from '../api'
// import { useCurrency } from '../contexts/CurrencyContext'

// interface ReportData {
//   totalIncome: number
//   totalExpenses: number
//   netFlow: number
//   savingsRate: number
//   transactionCount: number
//   categories: Array<{
//     category: string
//     amount: number
//     count: number
//     percentage: number
//   }>
//   monthlyData: Array<{
//     month: string
//     income: number
//     expenses: number
//     netFlow: number
//   }>
// }

// const Reports: React.FC = () => {
//   const { formatAmount } = useCurrency()
//   const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
//   const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
//   const [endDate, setEndDate] = useState(new Date().toISOString())
//   const [reportData, setReportData] = useState<ReportData | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [generatingReport, setGeneratingReport] = useState(false)

//   useEffect(() => {
//     if (reportType === 'monthly') {
//       setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
//       setEndDate(new Date().toISOString())
//     } else if (reportType === 'quarterly') {
//       const quarterStart = new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1)
//       setStartDate(quarterStart.toISOString())
//       setEndDate(new Date().toISOString())
//     } else if (reportType === 'yearly') {
//       setStartDate(new Date(new Date().getFullYear(), 0, 1).toISOString())
//       setEndDate(new Date().toISOString())
//     }
//   }, [reportType])

//   const generateReport = async () => {
//     try {
//       setLoading(true)
//       const response = await api.get(API.ANALYTICS, {
//         params: {
//           startDate,
//           endDate
//         }
//       })

//       const analyticsData = response.data
//       const processedData: ReportData = {
//         totalIncome: analyticsData.summary?.totalIncome || 0,
//         totalExpenses: analyticsData.summary?.totalExpenses || 0,
//         netFlow: analyticsData.summary?.netFlow || 0,
//         savingsRate: analyticsData.summary?.savingsRate || 0,
//         transactionCount: (analyticsData.summary?.incomeCount || 0) + (analyticsData.summary?.expenseCount || 0),
//         categories: analyticsData.expenseCategories || [],
//         monthlyData: analyticsData.monthlyTrends || []
//       }

//       setReportData(processedData)
//     } catch (error) {
//       console.error('Failed to generate report:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const downloadReport = async (format: 'csv' | 'pdf') => {
//     try {
//       setGeneratingReport(true)
//       const response = await api.get(`/api/reports/export`, {
//         params: {
//           format,
//           startDate,
//           endDate,
//           reportType
//         },
//         responseType: 'blob'
//       })

//       const blob = new Blob([response.data], {
//         type: format === 'csv' ? 'text/csv' : 'application/pdf'
//       })
      
//       const url = window.URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       link.download = `financial-report-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//       window.URL.revokeObjectURL(url)
//     } catch (error) {
//       console.error('Failed to download report:', error)
//     } finally {
//       setGeneratingReport(false)
//     }
//   }

//   const getReportTypeName = (): string => {
//     switch (reportType) {
//       case 'monthly':
//         return 'Monthly Report'
//       case 'quarterly':
//         return 'Quarterly Report'
//       case 'yearly':
//         return 'Yearly Report'
//       default:
//         return 'Report'
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
//         <p className="text-gray-600 dark:text-gray-400">Generate and download financial reports</p>
//       </div>

//       {/* Report Configuration */}
//       <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
//         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Configuration</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
//             <select
//               value={reportType}
//               onChange={(e) => setReportType(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//             >
//               <option value="monthly">Monthly</option>
//               <option value="quarterly">Quarterly</option>
//               <option value="yearly">Yearly</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
//             <input
//               type="date"
//               value={startDate.split('T')[0]}
//               onChange={(e) => setStartDate(new Date(e.target.value).toISOString())}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
//             <input
//               type="date"
//               value={endDate.split('T')[0]}
//               onChange={(e) => setEndDate(new Date(e.target.value).toISOString())}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//             />
//           </div>
//         </div>

//         <div className="flex space-x-4">
//           <button
//             onClick={generateReport}
//             disabled={loading}
//             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-50"
//           >
//             <Filter className="h-4 w-4 mr-2" />
//             {loading ? 'Generating...' : 'Generate Report'}
//           </button>
          
//           {reportData && (
//             <>
//               <button
//                 onClick={() => downloadReport('csv')}
//                 disabled={generatingReport}
//                 className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
//               >
//                 <Download className="h-4 w-4 mr-2" />
//                 {generatingReport ? 'Downloading...' : 'Download CSV'}
//               </button>
              
//               <button
//                 onClick={() => downloadReport('pdf')}
//                 disabled={generatingReport}
//                 className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
//               >
//                 <FileText className="h-4 w-4 mr-2" />
//                 {generatingReport ? 'Downloading...' : 'Download PDF'}
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Report Preview */}
//       {reportData && (
//         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
//           <div className="border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
//             <h3 className="text-lg font-medium text-gray-900 dark:text-white">{getReportTypeName()}</h3>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
//             </p>
//           </div>

//           {/* Summary Section */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//             <div className="text-center">
//               <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-2">
//                 <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
//               </div>
//               <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</h4>
//               <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//                 {formatAmount(reportData.totalIncome)}
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-2">
//                 <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
//               </div>
//               <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h4>
//               <p className="text-2xl font-bold text-red-600 dark:text-red-400">
//                 {formatAmount(reportData.totalExpenses)}
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-2">
//                 <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//               </div>
//               <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Flow</h4>
//               <p className={`text-2xl font-bold ${
//                 reportData.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
//               }`}>
//                 {formatAmount(reportData.netFlow)}
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full mx-auto mb-2">
//                 <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
//               </div>
//               <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</h4>
//               <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//                 {reportData.transactionCount}
//               </p>
//             </div>
//           </div>

//           {/* Categories Breakdown */}
//           <div className="mb-8">
//             <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expense Categories</h4>
//             <div className="space-y-3">
//               {reportData.categories.slice(0, 10).map((category, index) => (
//                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
//                   <div>
//                     <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">{category.count} transactions</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-semibold text-red-600 dark:text-red-400">
//                       {formatAmount(category.amount)}
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">{category.percentage.toFixed(1)}%</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Monthly Trends */}
//           <div>
//             <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Trends</h4>
//             <div className="space-y-3">
//               {reportData.monthlyData.slice(0, 6).map((month, index) => (
//                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
//                   <div>
//                     <p className="font-medium text-gray-900 dark:text-white">{month.month}</p>
//                     <div className="flex space-x-4 text-sm">
//                       <span className="text-green-600 dark:text-green-400">
//                         Income: {formatAmount(month.income)}
//                       </span>
//                       <span className="text-red-600 dark:text-red-400">
//                         Expenses: {formatAmount(month.expenses)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className={`font-semibold ${
//                       month.netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
//                     }`}>
//                       {formatAmount(month.netFlow)}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Summary Statistics */}
//           <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Savings Rate</h4>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {reportData.savingsRate.toFixed(1)}%
//                 </p>
//               </div>
//               <div>
//                 <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Average Transaction</h4>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {formatAmount((reportData.totalIncome + reportData.totalExpenses) / reportData.transactionCount)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Reports

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, FileJson, Printer, CalendarDays, RefreshCcw } from 'lucide-react'
import { api } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import { useDateFormatter } from '../utils/datePreferences'

// --- Interfaces ---
interface Transaction {
  _id: string;
  date: string | Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface Budget {
  _id: string;
  name: string;
  amount: number;
  spent: number;
}

interface DebtSummary {
  totalOutstandingDebt: number;
  totalInterestAccrued: number;
  totalPaidSoFar: number;
  activeDebtsCount: number;
  totalDebtsCount: number;
}

interface DateRangeParams {
  rangeType: string;
  selectedMonth: string;
  customStart: string;
  customEnd: string;
  getMonthYearLabel: (date: Date) => string;
}

const RANGE_OPTIONS = [
  { value: 'current-month', label: 'Current Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'selected-month', label: 'Choose Month' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'last-2-years', label: 'Last 2 Years' },
  { value: 'last-5-years', label: 'Last 5 Years' },
  { value: 'custom', label: 'Custom Date Range' }
]

const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
]

const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toMonthInputValue = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${year}-${month}`
}

const getDateRange = ({ rangeType, selectedMonth, customStart, customEnd, getMonthYearLabel }: DateRangeParams) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (rangeType === 'current-month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start, end: today, label: getMonthYearLabel(start) }
  }

  if (rangeType === 'last-month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    return { start, end, label: getMonthYearLabel(start) }
  }

  if (rangeType === 'selected-month' && selectedMonth) {
    const [year, month] = selectedMonth.split('-').map(Number)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59, 999)
    return { start, end, label: getMonthYearLabel(start) }
  }

  if (rangeType === 'last-year') {
    const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    start.setHours(0, 0, 0, 0)
    return { start, end: today, label: 'Last 1 Year' }
  }

  if (rangeType === 'last-2-years') {
    const start = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
    start.setHours(0, 0, 0, 0)
    return { start, end: today, label: 'Last 2 Years' }
  }

  if (rangeType === 'last-5-years') {
    const start = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
    start.setHours(0, 0, 0, 0)
    return { start, end: today, label: 'Last 5 Years' }
  }

  const start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1)
  const end = customEnd ? new Date(customEnd) : today
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end, label: 'Custom Range' }
}

const escapeCsv = (value: any): string => {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

const Reports: React.FC = () => {
  const { formatAmount } = useCurrency()
  const { formatDate } = useDateFormatter()
  const [selectedRange, setSelectedRange] = useState<string>('current-month')
  const [selectedMonth, setSelectedMonth] = useState<string>(toMonthInputValue(new Date()))
  const [manualMonth, setManualMonth] = useState<string>(`${new Date().getMonth() + 1}`.padStart(2, '0'))
  const [manualYear, setManualYear] = useState<string>(String(new Date().getFullYear()))
  const [customStart, setCustomStart] = useState<string>(toDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
  const [customEnd, setCustomEnd] = useState<string>(toDateInputValue(new Date()))
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [debtSummary, setDebtSummary] = useState<DebtSummary>({
    totalOutstandingDebt: 0,
    totalInterestAccrued: 0,
    totalPaidSoFar: 0,
    activeDebtsCount: 0,
    totalDebtsCount: 0
  })

  const formatMonthYear = (value: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(value)
  }

  const activeRange = useMemo(() => {
    return getDateRange({
      rangeType: selectedRange,
      selectedMonth,
      customStart,
      customEnd,
      getMonthYearLabel: (date) => formatMonthYear(date)
    })
  }, [selectedRange, selectedMonth, customStart, customEnd])

  const fetchTransactions = useCallback(async (start: Date, end: Date) => {
    const limit = 200
    let page = 1
    let totalPages = 1
    const allTransactions: Transaction[] = []

    while (page <= totalPages) {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        startDate: start.toISOString(),
        endDate: end.toISOString()
      })

      const response = await api.get(`/api/transactions?${params.toString()}`)
      const pageData = Array.isArray(response.data?.transactions) ? response.data.transactions : []
      allTransactions.push(...pageData)
      totalPages = Number(response.data?.pagination?.totalPages) || 1
      page += 1
    }

    return allTransactions
  }, [])

  const fetchReportData = useCallback(async () => {
    if (activeRange.start > activeRange.end) {
      setError('Start date must be before end date.')
      setTransactions([])
      return
    }

    setLoading(true)
    setError('')
    try {
      const [transactionData, budgetsResponse, debtsResponse] = await Promise.all([
        fetchTransactions(activeRange.start, activeRange.end),
        api.get('/api/budgets'),
        api.get('/api/debts')
      ])

      setTransactions(transactionData)
      setBudgets(Array.isArray(budgetsResponse.data) ? budgetsResponse.data : [])
      setDebtSummary(debtsResponse.data?.summary || {
        totalOutstandingDebt: 0,
        totalInterestAccrued: 0,
        totalPaidSoFar: 0,
        activeDebtsCount: 0,
        totalDebtsCount: 0
      })
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load report data')
      setTransactions([])
      setBudgets([])
    } finally {
      setLoading(false)
    }
  }, [activeRange.end, activeRange.start, fetchTransactions])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  useEffect(() => {
    const handleTransactionUpdate = () => {
      fetchReportData()
    }

    window.addEventListener('transaction-updated', handleTransactionUpdate)
    return () => {
      window.removeEventListener('transaction-updated', handleTransactionUpdate)
    }
  }, [fetchReportData])

  useEffect(() => {
    const handleFocusRefresh = () => {
      fetchReportData()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchReportData()
      }
    }

    window.addEventListener('focus', handleFocusRefresh)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('focus', handleFocusRefresh)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchReportData])

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0)

    const totalExpenses = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0)

    const budgeted = budgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0)
    const budgetSpent = budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0)

    return {
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      budgeted,
      budgetSpent,
      budgetRemaining: budgeted - budgetSpent
    }
  }, [transactions, budgets])

  const topExpenseCategories = useMemo(() => {
    const expenseTotals: Record<string, number> = {}

    for (const transaction of transactions) {
      if (transaction.type !== 'expense') continue
      const category = transaction.category || 'Uncategorized'
      expenseTotals[category] = (expenseTotals[category] || 0) + (Number(transaction.amount) || 0)
    }

    return Object.entries(expenseTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [transactions])

  const handleDownloadCsv = () => {
    const lines = [
      ['LuiFlow Financial Report'],
      ['Range', activeRange.label],
      ['Start Date', activeRange.start.toISOString()],
      ['End Date', activeRange.end.toISOString()],
      [],
      ['Summary'],
      ['Total Income', summary.totalIncome],
      ['Total Expenses', summary.totalExpenses],
      ['Net Flow', summary.net],
      ['Transaction Count', summary.transactionCount],
      ['Budgeted Total', summary.budgeted],
      ['Budget Spent', summary.budgetSpent],
      ['Budget Remaining', summary.budgetRemaining],
      ['Outstanding Debt', debtSummary.totalOutstandingDebt],
      ['Interest Accrued', debtSummary.totalInterestAccrued],
      ['Total Paid So Far', debtSummary.totalPaidSoFar],
      [],
      ['Transaction History'],
      ['Date', 'Description', 'Category', 'Type', 'Amount']
    ]

    for (const transaction of transactions) {
      lines.push([
        formatDate(transaction.date),
        transaction.description || '',
        transaction.category || '',
        transaction.type || '',
        Number(transaction.amount) || 0
      ])
    }

    const csvContent = lines.map((line) => line.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `luiflow-report-${toDateInputValue(new Date())}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadJson = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      range: {
        label: activeRange.label,
        startDate: activeRange.start.toISOString(),
        endDate: activeRange.end.toISOString()
      },
      summary,
      debtSummary,
      budgets,
      transactions
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `luiflow-report-${toDateInputValue(new Date())}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= currentYear - 10; year -= 1) {
      years.push(String(year))
    }
    return years
  }, [])

  const handleApplyManualMonthYear = () => {
    setSelectedRange('selected-month')
    setSelectedMonth(`${manualYear}-${manualMonth}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Export Reports</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Generate downloadable reports from live transactions, budgets, and debt data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchReportData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FileJson className="h-4 w-4" />
            Download JSON
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-end">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual Month Report</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quickly generate a report for a specific month and year.</p>
          </div>
          <div className="w-full xl:w-48">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
            <select
              value={manualMonth}
              onChange={(event) => setManualMonth(event.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full xl:w-40">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
            <select
              value={manualYear}
              onChange={(event) => setManualYear(event.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleApplyManualMonthYear}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Generate Month Report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
          <div className="w-full xl:w-72">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Range</label>
            <select
              value={selectedRange}
              onChange={(event) => setSelectedRange(event.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {selectedRange === 'selected-month' && (
            <div className="w-full xl:w-56">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {selectedRange === 'custom' && (
            <>
              <div className="w-full xl:w-56">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="w-full xl:w-56">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200">
            <CalendarDays className="h-4 w-4" />
            {activeRange.label}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
          <p className="text-2xl font-semibold text-emerald-600">{formatAmount(summary.totalIncome)}</p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Spending</p>
          <p className="text-2xl font-semibold text-red-600">{formatAmount(summary.totalExpenses)}</p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Flow</p>
          <p className={`text-2xl font-semibold ${summary.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatAmount(summary.net)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{summary.transactionCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Budgets Snapshot</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300"><span>Total Budgeted</span><span>{formatAmount(summary.budgeted)}</span></div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300"><span>Total Spent</span><span>{formatAmount(summary.budgetSpent)}</span></div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300"><span>Remaining</span><span>{formatAmount(summary.budgetRemaining)}</span></div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300"><span>Budget Items</span><span>{budgets.length}</span></div>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Debt Snapshot</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300"><span>Outstanding Debt</span><span>{formatAmount(debtSummary.totalOutstandingDebt || 0)}</span></div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300"><span>Interest Accrued</span><span>{formatAmount(debtSummary.totalInterestAccrued || 0)}</span></div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300"><span>Total Paid So Far</span><span>{formatAmount(debtSummary.totalPaidSoFar || 0)}</span></div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300"><span>Active Debts</span><span>{debtSummary.activeDebtsCount || 0}/{debtSummary.totalDebtsCount || 0}</span></div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Top Spending Categories</h2>
        {topExpenseCategories.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No expense transactions in the selected range.</p>
        ) : (
          <div className="space-y-2">
            {topExpenseCategories.map(([category, total]) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{category}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatAmount(total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Transaction History</h2>
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Type</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {transactions.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                      No transactions found for this range.
                    </td>
                  </tr>
                )}
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{transaction.description || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{transaction.category || '-'}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatAmount(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
