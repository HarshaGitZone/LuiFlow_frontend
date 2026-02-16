// // import React, { useState, useEffect } from 'react'
// // import { TrendingUp, TrendingDown, DollarSign, CreditCard, IndianRupee, Receipt, BarChart3, Target } from 'lucide-react'
// // import { api } from '../api'
// // import API from '../api'
// // import { useCurrency } from '../contexts/CurrencyContext'
// // import WelcomeHeader from '../components/WelcomeHeader'
// // import { useDateFormatter } from '../utils/datePreferences'
// // import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

// // interface Transaction {
// //   _id: string
// //   description: string
// //   category: string
// //   amount: number
// //   type: 'income' | 'expense'
// //   date: string | Date
// // }

// // interface Summary {
// //   totalIncome: number
// //   totalExpenses: number
// //   netFlow: number
// // }

// // interface MonthlyStats {
// //   income: number
// //   expenses: number
// //   netFlow: number
// //   savingsRate: number | string
// //   topCategory: string
// //   transactionCount: number
// // }

// // interface MonthlyCategory {
// //   name: string
// //   amount: number
// //   percentage: number
// // }

// // interface AllTimeStats {
// //   totalTransactions: number
// //   avgMonthlyExpense: number
// //   highestExpenseCategory: string
// // }

// // const Dashboard: React.FC = () => {
// //   const { formatAmount, formatAmountWithSign } = useCurrency()
// //   const { formatDate } = useDateFormatter()
// //   const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpenses: 0, netFlow: 0 })
// //   const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
// //   const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({ 
// //     income: 0, 
// //     expenses: 0, 
// //     netFlow: 0,
// //     savingsRate: 0,
// //     topCategory: 'N/A',
// //     transactionCount: 0
// //   })
// //   const [monthlyCategories, setMonthlyCategories] = useState<MonthlyCategory[]>([])
// //   const [allTimeStats, setAllTimeStats] = useState<AllTimeStats>({
// //     totalTransactions: 0,
// //     avgMonthlyExpense: 0,
// //     highestExpenseCategory: 'N/A'
// //   })
// //   const [loading, setLoading] = useState<boolean>(true)

// //   useEffect(() => {
// //     const fetchDashboardData = async () => {
// //       try {
// //         const summaryResponse = await api.get(API.TRANSACTIONS_SUMMARY)
// //         setSummary(summaryResponse.data)

// //         const transactionsResponse = await api.get(`${API.TRANSACTIONS}?limit=5`)
// //         setRecentTransactions(transactionsResponse.data.transactions)

// //         // Fetch Last Month's stats
// //         const now = new Date()
// //         const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
// //         const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

// //         const analyticsResponse = await api.get(API.ANALYTICS, {
// //           params: {
// //             startDate: startOfLastMonth.toISOString(),
// //             endDate: endOfLastMonth.toISOString()
// //           }
// //         })

// //         const analyticsData = analyticsResponse.data
// //         const topExpenseCategories = analyticsData.expenseCategories.slice(0, 5)
// //         const monthlyNetFlow = analyticsData.summary.totalIncome - analyticsData.summary.totalExpenses
// //         const monthlySavingsRate = analyticsData.summary.totalIncome > 0 
// //           ? ((monthlyNetFlow / analyticsData.summary.totalIncome) * 100).toFixed(1)
// //           : 0
        
// //         setMonthlyStats({
// //           income: analyticsData.summary.totalIncome,
// //           expenses: analyticsData.summary.totalExpenses,
// //           netFlow: monthlyNetFlow,
// //           savingsRate: monthlySavingsRate,
// //           topCategory: analyticsData.expenseCategories.length > 0 ? analyticsData.expenseCategories[0].category : 'None',
// //           transactionCount: analyticsData.summary.incomeCount + analyticsData.summary.expenseCount
// //         })
        
// //         setMonthlyCategories(topExpenseCategories.map((cat: { category: string; amount: number; percentage: number }) => ({
// //           name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
// //           amount: cat.amount,
// //           percentage: cat.percentage
// //         })))

// //         // Fetch all-time stats
// //         const allTimeResponse = await api.get(API.ANALYTICS)
// //         const allTimeData = allTimeResponse.data
// //         const avgMonthlyExpense = allTimeData.summary.totalExpenses > 0 
// //           ? Math.round(allTimeData.summary.totalExpenses / 12)
// //           : 0

// //         setAllTimeStats({
// //           totalTransactions: allTimeData.summary.incomeCount + allTimeData.summary.expenseCount,
// //           avgMonthlyExpense,
// //           highestExpenseCategory: allTimeData.expenseCategories.length > 0 ? allTimeData.expenseCategories[0].category : 'A/A'
// //         })

// //       } catch (error) {
// //         console.error('Error fetching dashboard data:', error)
// //       } finally {
// //         setLoading(false)
// //       }
// //     }

// //     fetchDashboardData()
// //   }, [])

// //   if (loading) {
// //     return (
// //       <div className="flex justify-center items-center h-64">
// //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <WelcomeHeader />

// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //         <div className="bg-white p-6 rounded-lg shadow">
// //           <div className="flex items-center">
// //             <div className="p-2 bg-green-100 rounded-lg">
// //               <IndianRupee className="h-6 w-6 text-green-600" />
// //             </div>
// //             <div className="ml-4">
// //               <p className="text-sm font-medium text-gray-600">Total Income</p>
// //               <p className="text-2xl font-semibold text-gray-900">{formatAmount(summary.totalIncome)}</p>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white p-6 rounded-lg shadow">
// //           <div className="flex items-center">
// //             <div className="p-2 bg-red-100 rounded-lg">
// //               <TrendingDown className="h-6 w-6 text-red-600" />
// //             </div>
// //             <div className="ml-4">
// //               <p className="text-sm font-medium text-gray-600">Total Expenses</p>
// //               <p className="text-2xl font-semibold text-gray-900">{formatAmount(summary.totalExpenses)}</p>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white p-6 rounded-lg shadow">
// //           <div className="flex items-center">
// //             <div className="p-2 bg-blue-100 rounded-lg">
// //               <TrendingUp className="h-6 w-6 text-blue-600" />
// //             </div>
// //             <div className="ml-4">
// //               <p className="text-sm font-medium text-gray-600">Net Flow</p>
// //               <p className="text-2xl font-semibold text-gray-900">{formatAmount(summary.netFlow)}</p>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white p-6 rounded-lg shadow">
// //           <div className="flex items-center">
// //             <div className="p-2 bg-purple-100 rounded-lg">
// //               <Receipt className="h-6 w-6 text-purple-600" />
// //             </div>
// //             <div className="ml-4">
// //               <p className="text-sm font-medium text-gray-600">Transactions</p>
// //               <p className="text-2xl font-semibold text-gray-900">{recentTransactions.length}</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //         <div className="bg-white p-6 rounded-lg shadow">
// //           <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
// //           <div className="space-y-3">
// //             {recentTransactions.length > 0 ? (
// //               recentTransactions.map((transaction) => (
// //                 <div key={transaction._id} className="flex justify-between items-center py-2 border-b">
// //                   <div>
// //                     <p className="font-medium text-gray-900">{transaction.description}</p>
// //                     <p className="text-sm text-gray-500">{transaction.category} • {formatDate(transaction.date)}</p>
// //                   </div>
// //                   <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
// //                     {formatAmountWithSign(transaction.amount, transaction.type)}
// //                   </p>
// //                 </div>
// //               ))
// //             ) : (
// //               <p className="text-gray-500 text-center py-4">No transactions yet</p>
// //             )}
// //           </div>
// //         </div>

// //         <div className="bg-white p-6 rounded-lg shadow">
// //           <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Summary</h2>
// //           <div className="space-y-3">
// //             <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
// //               <div className="flex flex-col">
// //                 <span className="text-sm text-green-800 font-semibold">Last Month Income</span>
// //                 <span className="text-xs text-green-600">Transactions: {monthlyStats.transactionCount}</span>
// //               </div>
// //               <span className="text-lg font-bold text-green-700">
// //                 {formatAmount(monthlyStats.income)}
// //               </span>
// //             </div>

// //             <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
// //               <div className="flex flex-col">
// //                 <span className="text-sm text-red-800 font-semibold">Last Month Expenses</span>
// //                 <span className="text-xs text-red-600">Total spent</span>
// //               </div>
// //               <span className="text-lg font-bold text-red-700">
// //                 {formatAmount(monthlyStats.expenses)}
// //               </span>
// //             </div>

// //             <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
// //               <div className="flex flex-col">
// //                 <span className="text-sm text-blue-800 font-semibold">Last Month Net Flow</span>
// //                 <span className="text-xs text-blue-600">Income - Expenses</span>
// //               </div>
// //               <span className={`text-lg font-bold ${monthlyStats.netFlow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
// //                 {formatAmount(monthlyStats.netFlow)}
// //               </span>
// //             </div>

// //             <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
// //               <div className="flex flex-col">
// //                 <span className="text-sm text-orange-800 font-semibold">Top Spend Category</span>
// //                 <span className="text-xs text-orange-600">Most expenses</span>
// //               </div>
// //               <span className="text-lg font-bold text-orange-700 capitalize">
// //                 {monthlyStats.topCategory}
// //               </span>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Comprehensive Statistics Section */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg shadow">
// //           <div className="flex items-center justify-between mb-2">
// //             <h3 className="text-sm font-semibold text-blue-900">Total Transactions</h3>
// //             <Receipt className="h-5 w-5 text-blue-600" />
// //           </div>
// //           <p className="text-3xl font-bold text-blue-900">{allTimeStats.totalTransactions}</p>
// //           <p className="text-xs text-blue-600 mt-1">Across all time</p>
// //         </div>

// //         <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-6 rounded-lg shadow">
// //           <div className="flex items-center justify-between mb-2">
// //             <h3 className="text-sm font-semibold text-amber-900">Avg Monthly Expense</h3>
// //             <TrendingDown className="h-5 w-5 text-amber-600" />
// //           </div>
// //           <p className="text-3xl font-bold text-amber-900">{formatAmount(allTimeStats.avgMonthlyExpense)}</p>
// //           <p className="text-xs text-amber-600 mt-1">Average per month</p>
// //         </div>

// //         <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 p-6 rounded-lg shadow">
// //           <div className="flex items-center justify-between mb-2">
// //             <h3 className="text-sm font-semibold text-teal-900">Highest Spend Category</h3>
// //             <Target className="h-5 w-5 text-teal-600" />
// //           </div>
// //           <p className="text-3xl font-bold text-teal-900 capitalize">{allTimeStats.highestExpenseCategory}</p>
// //           <p className="text-xs text-teal-600 mt-1">Most frequent category</p>
// //         </div>
// //       </div>

// //       {/* Last Month Expense Breakdown */}
// //       <div className="bg-white p-6 rounded-lg shadow">
// //         <div className="flex items-center justify-between mb-4">
// //           <h2 className="text-lg font-semibold text-gray-900">Last Month - Expenses by Category</h2>
// //           <BarChart3 className="h-5 w-5 text-blue-600" />
// //         </div>
        
// //         {monthlyCategories.length > 0 ? (
// //           <div className="space-y-4">
// //             {/* Bar Chart */}
// //             <ResponsiveContainer width="100%" height={250}>
// //               <BarChart data={monthlyCategories}>
// //                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
// //                 <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
// //                 <YAxis />
// //                 <Tooltip 
// //                   formatter={(value: number | undefined) => value ? formatAmount(value, { maximumFractionDigits: 0, minimumFractionDigits: 0 }) : ''}
// //                   contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
// //                 />
// //                 <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#EF4444" />
// //               </BarChart>
// //             </ResponsiveContainer>

// //             {/* Category Breakdown List */}
// //             <div className="border-t pt-4">
// //               <h3 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h3>
// //               <div className="space-y-2">
// //                 {monthlyCategories.map((cat, index) => (
// //                   <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
// //                     <div className="flex items-center space-x-3 flex-1">
// //                       <div className="w-3 h-3 rounded-full bg-red-400" />
// //                       <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
// //                     </div>
// //                     <div className="flex items-center space-x-3">
// //                       <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
// //                         <div 
// //                           className="bg-red-500 h-full" 
// //                           style={{ width: `${cat.percentage}%` }}
// //                         ></div>
// //                       </div>
// //                       <span className="text-sm font-semibold text-gray-900 w-24 text-right">
// //                         {formatAmount(cat.amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
// //                       </span>
// //                       <span className="text-xs text-gray-500 w-10 text-right">{cat.percentage}%</span>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         ) : (
// //           <p className="text-gray-500 text-center py-8">No expense data for last month</p>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }

// // export default Dashboard

// import React, { useState, useEffect } from 'react'
// import {
//   TrendingUp,
//   TrendingDown,
//   IndianRupee,
//   Receipt,
//   BarChart3,
//   Target
// } from 'lucide-react'
// import { api } from '../api'
// import API from '../api'
// import { useCurrency } from '../contexts/CurrencyContext'
// import WelcomeHeader from '../components/WelcomeHeader'
// import { useDateFormatter } from '../utils/datePreferences'
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer
// } from 'recharts'

// type TransactionType = 'income' | 'expense'

// interface Summary {
//   totalIncome: number
//   totalExpenses: number
//   netFlow: number
// }

// interface Transaction {
//   _id: string
//   description: string
//   category: string
//   date: string
//   type: TransactionType
//   amount: number
// }

// interface MonthlyStats {
//   income: number
//   expenses: number
//   netFlow: number
//   savingsRate: number | string
//   topCategory: string
//   transactionCount: number
// }

// interface MonthlyCategory {
//   name: string
//   amount: number
//   percentage: number
// }

// interface AllTimeStats {
//   totalTransactions: number
//   avgMonthlyExpense: number
//   highestExpenseCategory: string
// }

// interface AnalyticsExpenseCategory {
//   category: string
//   amount: number
//   percentage: number
// }

// interface AnalyticsSummary {
//   totalIncome: number
//   totalExpenses: number
//   incomeCount: number
//   expenseCount: number
// }

// interface AnalyticsResponse {
//   summary: AnalyticsSummary
//   expenseCategories: AnalyticsExpenseCategory[]
// }

// const Dashboard: React.FC = () => {
//   const { formatAmount, formatAmountWithSign } = useCurrency()
//   const { formatDate } = useDateFormatter()

//   const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpenses: 0, netFlow: 0 })
//   const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
//   const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
//     income: 0,
//     expenses: 0,
//     netFlow: 0,
//     savingsRate: 0,
//     topCategory: 'N/A',
//     transactionCount: 0
//   })
//   const [monthlyCategories, setMonthlyCategories] = useState<MonthlyCategory[]>([])
//   const [allTimeStats, setAllTimeStats] = useState<AllTimeStats>({
//     totalTransactions: 0,
//     avgMonthlyExpense: 0,
//     highestExpenseCategory: 'N/A'
//   })
//   const [loading, setLoading] = useState<boolean>(true)

//   useEffect(() => {
//     const fetchDashboardData = async (): Promise<void> => {
//       try {
//         const summaryResponse = await api.get<Summary>(API.TRANSACTIONS_SUMMARY)
//         setSummary(summaryResponse.data)

//         const transactionsResponse = await api.get<{ transactions: Transaction[] }>(
//           `${API.TRANSACTIONS}?limit=5`
//         )
//         setRecentTransactions(transactionsResponse.data.transactions)

//         // Fetch Last Month's stats
//         const now = new Date()
//         const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
//         const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

//         const analyticsResponse = await api.get<AnalyticsResponse>(API.ANALYTICS, {
//           params: {
//             startDate: startOfLastMonth.toISOString(),
//             endDate: endOfLastMonth.toISOString()
//           }
//         })

//         const analyticsData = analyticsResponse.data
//         const topExpenseCategories = analyticsData.expenseCategories.slice(0, 5)
//         const monthlyNetFlow = analyticsData.summary.totalIncome - analyticsData.summary.totalExpenses

//         const monthlySavingsRate =
//           analyticsData.summary.totalIncome > 0
//             ? Number(((monthlyNetFlow / analyticsData.summary.totalIncome) * 100).toFixed(1))
//             : 0

//         setMonthlyStats({
//           income: analyticsData.summary.totalIncome,
//           expenses: analyticsData.summary.totalExpenses,
//           netFlow: monthlyNetFlow,
//           savingsRate: monthlySavingsRate,
//           topCategory:
//             analyticsData.expenseCategories.length > 0
//               ? analyticsData.expenseCategories[0].category
//               : 'None',
//           transactionCount: analyticsData.summary.incomeCount + analyticsData.summary.expenseCount
//         })

//         setMonthlyCategories(
//           topExpenseCategories.map((cat) => ({
//             name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
//             amount: cat.amount,
//             percentage: cat.percentage
//           }))
//         )

//         // Fetch all-time stats
//         const allTimeResponse = await api.get<AnalyticsResponse>(API.ANALYTICS)
//         const allTimeData = allTimeResponse.data

//         const avgMonthlyExpense =
//           allTimeData.summary.totalExpenses > 0
//             ? Math.round(allTimeData.summary.totalExpenses / 12)
//             : 0

//         setAllTimeStats({
//           totalTransactions: allTimeData.summary.incomeCount + allTimeData.summary.expenseCount,
//           avgMonthlyExpense,
//           highestExpenseCategory:
//             allTimeData.expenseCategories.length > 0 ? allTimeData.expenseCategories[0].category : 'N/A'
//         })
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardData()
//   }, [])

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <WelcomeHeader />

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center">
//             <div className="p-2 bg-green-100 rounded-lg">
//               <IndianRupee className="h-6 w-6 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Total Income</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {formatAmount(summary.totalIncome)}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center">
//             <div className="p-2 bg-red-100 rounded-lg">
//               <TrendingDown className="h-6 w-6 text-red-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Total Expenses</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {formatAmount(summary.totalExpenses)}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <TrendingUp className="h-6 w-6 text-blue-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Net Flow</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {formatAmount(summary.netFlow)}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center">
//             <div className="p-2 bg-purple-100 rounded-lg">
//               <Receipt className="h-6 w-6 text-purple-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Transactions</p>
//               <p className="text-2xl font-semibold text-gray-900">{recentTransactions.length}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
//           <div className="space-y-3">
//             {recentTransactions.length > 0 ? (
//               recentTransactions.map((transaction) => (
//                 <div
//                   key={transaction._id}
//                   className="flex justify-between items-center py-2 border-b"
//                 >
//                   <div>
//                     <p className="font-medium text-gray-900">{transaction.description}</p>
//                     <p className="text-sm text-gray-500">
//                       {transaction.category} • {formatDate(transaction.date)}
//                     </p>
//                   </div>
//                   <p
//                     className={`font-semibold ${
//                       transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
//                     }`}
//                   >
//                     {formatAmountWithSign(transaction.amount, transaction.type)}
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500 text-center py-4">No transactions yet</p>
//             )}
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Summary</h2>
//           <div className="space-y-3">
//             <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
//               <div className="flex flex-col">
//                 <span className="text-sm text-green-800 font-semibold">Last Month Income</span>
//                 <span className="text-xs text-green-600">
//                   Transactions: {monthlyStats.transactionCount}
//                 </span>
//               </div>
//               <span className="text-lg font-bold text-green-700">
//                 {formatAmount(monthlyStats.income)}
//               </span>
//             </div>

//             <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
//               <div className="flex flex-col">
//                 <span className="text-sm text-red-800 font-semibold">Last Month Expenses</span>
//                 <span className="text-xs text-red-600">Total spent</span>
//               </div>
//               <span className="text-lg font-bold text-red-700">
//                 {formatAmount(monthlyStats.expenses)}
//               </span>
//             </div>

//             <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
//               <div className="flex flex-col">
//                 <span className="text-sm text-blue-800 font-semibold">Last Month Net Flow</span>
//                 <span className="text-xs text-blue-600">Income - Expenses</span>
//               </div>
//               <span
//                 className={`text-lg font-bold ${
//                   monthlyStats.netFlow >= 0 ? 'text-blue-700' : 'text-red-700'
//                 }`}
//               >
//                 {formatAmount(monthlyStats.netFlow)}
//               </span>
//             </div>

//             <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
//               <div className="flex flex-col">
//                 <span className="text-sm text-orange-800 font-semibold">Top Spend Category</span>
//                 <span className="text-xs text-orange-600">Most expenses</span>
//               </div>
//               <span className="text-lg font-bold text-orange-700 capitalize">
//                 {monthlyStats.topCategory}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Comprehensive Statistics Section */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg shadow">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-sm font-semibold text-blue-900">Total Transactions</h3>
//             <Receipt className="h-5 w-5 text-blue-600" />
//           </div>
//           <p className="text-3xl font-bold text-blue-900">{allTimeStats.totalTransactions}</p>
//           <p className="text-xs text-blue-600 mt-1">Across all time</p>
//         </div>

//         <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-6 rounded-lg shadow">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-sm font-semibold text-amber-900">Avg Monthly Expense</h3>
//             <TrendingDown className="h-5 w-5 text-amber-600" />
//           </div>
//           <p className="text-3xl font-bold text-amber-900">
//             {formatAmount(allTimeStats.avgMonthlyExpense)}
//           </p>
//           <p className="text-xs text-amber-600 mt-1">Average per month</p>
//         </div>

//         <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 p-6 rounded-lg shadow">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-sm font-semibold text-teal-900">Highest Spend Category</h3>
//             <Target className="h-5 w-5 text-teal-600" />
//           </div>
//           <p className="text-3xl font-bold text-teal-900 capitalize">
//             {allTimeStats.highestExpenseCategory}
//           </p>
//           <p className="text-xs text-teal-600 mt-1">Most frequent category</p>
//         </div>
//       </div>

//       {/* Last Month Expense Breakdown */}
//       <div className="bg-white p-6 rounded-lg shadow">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">
//             Last Month - Expenses by Category
//           </h2>
//           <BarChart3 className="h-5 w-5 text-blue-600" />
//         </div>

//         {monthlyCategories.length > 0 ? (
//           <div className="space-y-4">
//             {/* Bar Chart */}
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={monthlyCategories}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                 <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
//                 <YAxis />
//                 <Tooltip
//                   formatter={(value: any) =>
//                     formatAmount(Number(value), {
//                       maximumFractionDigits: 0,
//                       minimumFractionDigits: 0
//                     })
//                   }
//                   contentStyle={{
//                     backgroundColor: '#fff',
//                     border: '1px solid #ccc',
//                     borderRadius: '8px'
//                   }}
//                 />
//                 <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#EF4444" />
//               </BarChart>
//             </ResponsiveContainer>

//             {/* Category Breakdown List */}
//             <div className="border-t pt-4">
//               <h3 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h3>
//               <div className="space-y-2">
//                 {monthlyCategories.map((cat, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
//                   >
//                     <div className="flex items-center space-x-3 flex-1">
//                       <div className="w-3 h-3 rounded-full bg-red-400" />
//                       <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                       <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
//                         <div
//                           className="bg-red-500 h-full"
//                           style={{ width: `${cat.percentage}%` }}
//                         ></div>
//                       </div>
//                       <span className="text-sm font-semibold text-gray-900 w-24 text-right">
//                         {formatAmount(cat.amount, {
//                           maximumFractionDigits: 0,
//                           minimumFractionDigits: 0
//                         })}
//                       </span>
//                       <span className="text-xs text-gray-500 w-10 text-right">
//                         {cat.percentage}%
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-center py-8">No expense data for last month</p>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Dashboard

import React, { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, IndianRupee, Receipt, BarChart3, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api, API } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import WelcomeHeader from '../components/WelcomeHeader'
import { useDateFormatter } from '../utils/datePreferences'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Transaction {
  _id: string;
  description: string;
  category: string;
  date: string | Date;
  amount: number;
  type: 'income' | 'expense';
}

interface MonthlyStats {
  income: number;
  expenses: number;
  netFlow: number;
  savingsRate: string | number;
  topCategory: string;
  transactionCount: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
}

interface UnusualSpike {
  key: string;
  name: string;
  expenses: number;
  averageExpenses: number;
  deltaFromAverage: number;
  ratioToAverage: number | null;
  severity: 'medium' | 'high';
}

interface BudgetOverrunAlert {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  overBy: number;
  utilizationPct: number;
}

interface UnexpectedSpikeAlert {
  id: string;
  title: string;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
  kind?: string;
  period?: string;
  category?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { formatAmount, formatAmountWithSign } = useCurrency()
  const { formatDate } = useDateFormatter()
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netFlow: 0 })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({ 
    income: 0, 
    expenses: 0, 
    netFlow: 0,
    savingsRate: 0,
    topCategory: 'N/A',
    transactionCount: 0
  })
  const [monthlyCategories, setMonthlyCategories] = useState<CategoryBreakdown[]>([])
  const [unusualSpikes, setUnusualSpikes] = useState<UnusualSpike[]>([])
  const [unexpectedAlerts, setUnexpectedAlerts] = useState<UnexpectedSpikeAlert[]>([])
  const [budgetOverruns, setBudgetOverruns] = useState<BudgetOverrunAlert[]>([])
  const [spikeScope, setSpikeScope] = useState<'last-month' | 'all-time' | 'none'>('none')
  const [allTimeStats, setAllTimeStats] = useState({
    totalTransactions: 0,
    avgMonthlyExpense: 0,
    highestExpenseCategory: 'N/A'
  })
  const [loading, setLoading] = useState<boolean>(true)

  const buildLastMonthRange = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = now
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  }

  const navigateToTransactions = (params: Record<string, string>) => {
    const query = new URLSearchParams(params)
    const queryString = query.toString()
    navigate(queryString ? `/transactions?${queryString}` : '/transactions')
  }

  const fetchDashboardData = useCallback(async () => {
    try {
      const summaryResponse = await api.get(API.TRANSACTIONS_SUMMARY)
      setSummary(summaryResponse.data)

      const transactionsResponse = await api.get(`${API.TRANSACTIONS}?limit=5`)
      setRecentTransactions(transactionsResponse.data.transactions)

      const now = new Date()
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfCurrentPeriod = now

      const analyticsResponse = await api.get(API.ANALYTICS, {
        params: {
          startDate: startOfCurrentMonth.toISOString(),
          endDate: endOfCurrentPeriod.toISOString()
        }
      })

      const analyticsData = analyticsResponse.data
      const topExpenseCategories = analyticsData.expenseCategories.slice(0, 5)
      const currentPeriodSpikes = Array.isArray(analyticsData.unusualSpikes) ? analyticsData.unusualSpikes : []
      const currentPeriodUnexpectedAlerts = Array.isArray(analyticsData?.unexpectedSpikes?.alerts) ? analyticsData.unexpectedSpikes.alerts : []
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

      setMonthlyCategories(topExpenseCategories.map((cat: any) => ({
        name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
        amount: cat.amount,
        percentage: cat.percentage
      })))

      const [allTimeResponse, budgetsResponse] = await Promise.all([
        api.get(API.ANALYTICS),
        api.get(API.BUDGETS)
      ])
      const allTimeData = allTimeResponse.data
      const allTimeSpikes = Array.isArray(allTimeData.unusualSpikes) ? allTimeData.unusualSpikes : []
      const allTimeUnexpectedAlerts = Array.isArray(allTimeData?.unexpectedSpikes?.alerts) ? allTimeData.unexpectedSpikes.alerts : []
      const budgetRows = Array.isArray(budgetsResponse.data) ? budgetsResponse.data : []
      const overruns = budgetRows
        .map((budget: any) => {
          const amount = Number(budget.amount) || 0
          const spent = Number(budget.spent) || 0
          if (amount <= 0 || spent <= amount) return null
          const overBy = spent - amount
          const utilizationPct = Math.round((spent / amount) * 100)
          return {
            id: budget._id || `${budget.category}-${budget.name}`,
            name: budget.name || budget.category || 'Budget',
            category: budget.category || '',
            amount,
            spent,
            overBy,
            utilizationPct
          } as BudgetOverrunAlert
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.overBy - a.overBy)
        .slice(0, 5) as BudgetOverrunAlert[]
      setBudgetOverruns(overruns)
      const avgMonthlyExpense = allTimeData.summary.totalExpenses > 0
        ? Math.round(allTimeData.summary.totalExpenses / 12)
        : 0

      setAllTimeStats({
        totalTransactions: allTimeData.summary.incomeCount + allTimeData.summary.expenseCount,
        avgMonthlyExpense,
        highestExpenseCategory: allTimeData.expenseCategories.length > 0 ? allTimeData.expenseCategories[0].category : 'N/A'
      })

      if (currentPeriodSpikes.length > 0) {
        setUnusualSpikes(currentPeriodSpikes)
        setSpikeScope('last-month')
      } else if (allTimeSpikes.length > 0) {
        setUnusualSpikes(allTimeSpikes)
        setSpikeScope('all-time')
      } else {
        setUnusualSpikes([])
        setSpikeScope('none')
      }

      if (currentPeriodUnexpectedAlerts.length > 0) {
        setUnexpectedAlerts(currentPeriodUnexpectedAlerts)
      } else {
        setUnexpectedAlerts(allTimeUnexpectedAlerts)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()

    const handleDataChange = () => {
      fetchDashboardData()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData()
      }
    }

    window.addEventListener('transaction-updated', handleDataChange)
    window.addEventListener('budget-updated', handleDataChange)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('transaction-updated', handleDataChange)
      window.removeEventListener('budget-updated', handleDataChange)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchDashboardData])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <WelcomeHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigateToTransactions({ type: 'income' })}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatAmount(summary.totalIncome)}</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigateToTransactions({ type: 'expense' })}
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatAmount(summary.totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigateToTransactions({})}
        >
          <div className="flex items-center">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-slate-800 dark:text-slate-100" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Net Flow</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatAmount(summary.netFlow)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{recentTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Recent Transactions</h2>
          <div className="space-y-2 sm:space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-200 dark:border-slate-700 last:border-0">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">{transaction.description}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{transaction.category} • {formatDate(transaction.date)}</p>
                  </div>
                  <p className={`font-semibold text-sm sm:text-base ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatAmountWithSign(transaction.amount, transaction.type)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm sm:text-base">No transactions yet</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Analytics Summary</h2>
          <div className="space-y-2 sm:space-y-3">
            <div
              className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 cursor-pointer"
              onClick={() => {
                const range = buildLastMonthRange()
                navigateToTransactions({ type: 'income', startDate: range.startDate, endDate: range.endDate })
              }}
            >
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-semibold">This Month Income</span>
                <span className="text-xs text-green-600 dark:text-green-400">Transactions: {monthlyStats.transactionCount}</span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-300">
                {formatAmount(monthlyStats.income)}
              </span>
            </div>

            <div
              className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer"
              onClick={() => {
                const range = buildLastMonthRange()
                navigateToTransactions({ type: 'expense', startDate: range.startDate, endDate: range.endDate })
              }}
            >
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-red-800 dark:text-red-200 font-semibold">This Month Expenses</span>
                <span className="text-xs text-red-600 dark:text-red-400">Total spent</span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-red-700 dark:text-red-300">
                {formatAmount(monthlyStats.expenses)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg border bg-white border-gray-300 dark:bg-slate-800 dark:border-slate-600">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">This Month Net Flow</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">Income - Expenses</span>
              </div>
              <span className={`text-sm sm:text-lg font-bold ${monthlyStats.netFlow >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-400'}`}>
                {formatAmount(monthlyStats.netFlow)}
              </span>
            </div>

            <div
              className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 cursor-pointer"
              onClick={() => {
                const range = buildLastMonthRange()
                const category = monthlyStats.topCategory && monthlyStats.topCategory !== 'None' ? monthlyStats.topCategory : ''
                navigateToTransactions({
                  type: 'expense',
                  ...(category ? { category } : {}),
                  startDate: range.startDate,
                  endDate: range.endDate
                })
              }}
            >
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 font-semibold">Top Spend Category</span>
                <span className="text-xs text-orange-600 dark:text-orange-400">Most expenses</span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-orange-700 dark:text-orange-300 capitalize">
                {monthlyStats.topCategory}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
        <div className="mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Expense Spikes & Budget Overruns</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {spikeScope === 'last-month' ? 'Scope: This month' : spikeScope === 'all-time' ? 'Scope: All time (fallback)' : 'Scope: No spikes detected yet'}
          </p>
        </div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Unusual Spikes</h3>
        </div>
        {unusualSpikes.length > 0 ? (
          <div className="space-y-2">
            {unusualSpikes.map((spike) => (
              <div key={spike.key} className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 truncate">{spike.name}</p>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    {spike.ratioToAverage ? `${spike.ratioToAverage}x avg` : 'Above average'} | +{formatAmount(spike.deltaFromAverage)}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300 underline"
                  onClick={() => navigateToTransactions({ type: 'expense', startDate: spike.key, endDate: spike.key })}
                >
                  {formatAmount(spike.expenses)}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">No unusual spikes found in your current data yet.</p>
        )}

        <div className="mt-5 mb-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Other Unexpected Signals</h3>
        </div>
        {unexpectedAlerts.length > 0 ? (
          <div className="space-y-2">
            {unexpectedAlerts.map((alert) => {
              const levelClass = alert.severity === 'critical'
                ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                : alert.severity === 'warning'
                  ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
                  : 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
              return (
                <div key={alert.id} className={`p-3 rounded-lg border ${levelClass}`}>
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="text-xs opacity-90">{alert.detail}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">No additional unexpected signals detected.</p>
        )}

        <div className="mt-5 mb-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Budget Overruns</h3>
        </div>
        {budgetOverruns.length > 0 ? (
          <div className="space-y-2">
            {budgetOverruns.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20">
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 truncate">{alert.name}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {alert.utilizationPct}% used | Over by {formatAmount(alert.overBy)}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 underline"
                  onClick={() => navigateToTransactions({ type: 'expense', ...(alert.category ? { category: alert.category } : {}) })}
                >
                  {formatAmount(alert.spent)} / {formatAmount(alert.amount)}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">No budget categories are over limit right now.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100">Total Transactions</h3>
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{allTimeStats.totalTransactions}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Across all time</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100">Avg Monthly Expense</h3>
            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100">{formatAmount(allTimeStats.avgMonthlyExpense)}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Average per month</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border border-teal-200 dark:border-teal-700 p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-teal-900 dark:text-teal-100">Highest Spend Category</h3>
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-teal-900 dark:text-teal-100 capitalize truncate">{allTimeStats.highestExpenseCategory}</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Most frequent category</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">This Month - Expenses by Category</h2>
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        </div>
        
        {monthlyCategories.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-[300px] sm:min-w-0 px-2 sm:px-0">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyCategories} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      className="dark:fill-slate-400"
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} className="dark:fill-slate-400" />
                    <Tooltip 
                      formatter={(value: any) => 
                        formatAmount(Number(value) || 0, {
                          maximumFractionDigits: 0,
                          minimumFractionDigits: 0
                        })
                      }
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #ccc', 
                        borderRadius: '8px',
                        color: '#000'
                      }}
                      wrapperClassName="dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category Breakdown</h3>
              <div className="space-y-2">
                {monthlyCategories.map((cat, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-16 sm:w-24 bg-gray-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden flex-shrink-0">
                        <div 
                          className="bg-red-500 h-full" 
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 w-16 sm:w-24 text-right">
                        {formatAmount(cat.amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">No expense data for last month</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
