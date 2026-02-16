// import React, { useState, useEffect } from 'react'
// import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, X, DollarSign, TrendingUp, TrendingDown, Maximize2, Minimize2 } from 'lucide-react'
// import { api } from '../api'
// import { useCurrency } from '../contexts/CurrencyContext'
// import { useDateFormatter } from '../utils/datePreferences'

// interface Transaction {
//   _id: string
//   date: string | Date
//   description: string
//   amount: number
//   type: 'income' | 'expense'
//   category: string
//   isDeleted?: boolean
// }

// interface FormData {
//   date: string
//   description: string
//   amount: string
//   type: 'income' | 'expense'
//   category: string
// }

// const Calendar: React.FC = () => {
//   const { formatAmount } = useCurrency()
//   const { formatLongDate } = useDateFormatter()
//   const [currentDate, setCurrentDate] = useState<Date>(new Date())
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null)
//   const [transactions, setTransactions] = useState<Transaction[]>([])
//   const [loading, setLoading] = useState<boolean>(true)
//   const [showModal, setShowModal] = useState<boolean>(false)
//   const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
//   const [zoomedDate, setZoomedDate] = useState<Date | null>(null)
//   const [formData, setFormData] = useState<FormData>({
//     date: '',
//     description: '',
//     amount: '',
//     type: 'expense',
//     category: ''
//   })

//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ]

//   const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

//   const categories = [
//     'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills',
//     'Healthcare', 'Education', 'Salary', 'Investment', 'Other'
//   ]

//   useEffect(() => {
//     fetchTransactions()

//     // Listen for transaction updates from other components
//     const handleTransactionUpdate = () => {
//       fetchTransactions()
//     }

//     window.addEventListener('transaction-updated', handleTransactionUpdate)

//     return () => {
//       window.removeEventListener('transaction-updated', handleTransactionUpdate)
//     }
//   }, [currentDate])

//   const fetchTransactions = async () => {
//     try {
//       setLoading(true)
//       const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
//       const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

//       console.log('Fetching transactions for date range:', {
//         startDate: startDate.toISOString().split('T')[0],
//         endDate: endDate.toISOString().split('T')[0]
//       })

//       const response = await api.get('/api/transactions', {
//         params: {
//           startDate: startDate.toISOString().split('T')[0],
//           endDate: endDate.toISOString().split('T')[0],
//           limit: 1000 // Get all transactions for the month
//         }
//       })

//       console.log('API response:', response.data)

//       // Use the consistent format from backend
//       const transactions = response.data.transactions || response.data || []
//       console.log('Setting transactions:', transactions.length, 'items')
//       setTransactions(transactions)
//     } catch (error) {
//       console.error('Error fetching transactions:', error)
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         console.log('Authentication error - user may need to login')
//       }
//       setTransactions([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getDaysInMonth = (date: Date): number => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
//   }

//   const getFirstDayOfMonth = (date: Date): number => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
//   }

//   const getTransactionsForDate = (date: Date): Transaction[] => {
//     if (!Array.isArray(transactions)) return []

//     // Create a local date string manually to avoid timezone issues with toISOString()
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     const dateStr = `${year}-${month}-${day}` 

//     return transactions.filter(t => {
//       // Handle both string and Date formats for transaction.date
//       let transactionDate
//       if (t.date instanceof Date) {
//         const tYear = t.date.getFullYear()
//         const tMonth = String(t.date.getMonth() + 1).padStart(2, '0')
//         const tDay = String(t.date.getDate()).padStart(2, '0')
//         transactionDate = `${tYear}-${tMonth}-${tDay}` 
//       } else if (typeof t.date === 'string') {
//         transactionDate = t.date.split('T')[0]
//       } else {
//         transactionDate = t.date
//       }

//       return transactionDate === dateStr && !t.isDeleted
//     })
//   }

//   const navigateMonth = (direction: 'prev' | 'next') => {
//     setCurrentDate(prev => {
//       const newDate = new Date(prev)
//       if (direction === 'prev') {
//         newDate.setMonth(prev.getMonth() - 1)
//       } else {
//         newDate.setMonth(prev.getMonth() + 1)
//       }
//       return newDate
//     })
//   }

//   const navigateYear = (direction: 'prev' | 'next') => {
//     setCurrentDate(prev => {
//       const newDate = new Date(prev)
//       if (direction === 'prev') {
//         newDate.setFullYear(prev.getFullYear() - 1)
//       } else {
//         newDate.setFullYear(prev.getFullYear() + 1)
//       }
//       return newDate
//     })
//   }

//   const handleDateClick = (date: Date) => {
//     setSelectedDate(date)
//     // Create a local date string manually
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     const dateStr = `${year}-${month}-${day}` 

//     setFormData({
//       date: dateStr,
//       description: '',
//       amount: '',
//       type: 'expense',
//       category: ''
//     })
//     setEditingTransaction(null)
//     setShowModal(true)
//   }

//   const handleZoomDate = (date: Date) => {
//     setZoomedDate(date)
//   }

//   const closeZoom = () => {
//     setZoomedDate(null)
//   }

//   const handleTransactionClick = (transaction: Transaction, e: React.MouseEvent) => {
//     e.stopPropagation()
//     setEditingTransaction(transaction)

//     // Format the date properly for the input field
//     let dateStr
//     const tDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date)

//     if (!isNaN(tDate.getTime())) {
//       const year = tDate.getFullYear()
//       const month = String(tDate.getMonth() + 1).padStart(2, '0')
//       const day = String(tDate.getDate()).padStart(2, '0')
//       dateStr = `${year}-${month}-${day}` 
//     } else if (typeof transaction.date === 'string') {
//       dateStr = transaction.date.split('T')[0]
//     } else {
//       dateStr = ''
//     }

//     setFormData({
//       date: dateStr,
//       description: transaction.description,
//       amount: transaction.amount.toString(),
//       type: transaction.type,
//       category: transaction.category
//     })
//     setShowModal(true)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       if (editingTransaction) {
//         await api.put(`/api/transactions/${editingTransaction._id}`, formData)
//       } else {
//         await api.post('/api/transactions', formData)
//       }

//       await fetchTransactions()
//       setShowModal(false)
//       setEditingTransaction(null)
//       setFormData({
//         date: '',
//         description: '',
//         amount: '',
//         type: 'expense',
//         category: ''
//       })

//       // Emit event to notify other components of data change
//       window.dispatchEvent(new CustomEvent('transaction-updated'))
//     } catch (error) {
//       console.error('Error saving transaction:', error)
//     }
//   }

//   const handleDelete = async (transactionId: string) => {
//     try {
//       await api.delete(`/api/transactions/${transactionId}`)
//       await fetchTransactions()
//       setShowModal(false)

//       // Emit event to notify other components of data change
//       window.dispatchEvent(new CustomEvent('transaction-updated'))
//     } catch (error) {
//       console.error('Error deleting transaction:', error)
//     }
//   }

//   const formatCurrency = (amount: number): string => {
//     if (typeof amount !== 'number' || isNaN(amount)) {
//       return formatAmount(0)
//     }
//     return formatAmount(amount)
//   }

//   const renderCalendarDays = () => {
//     const daysInMonth = getDaysInMonth(currentDate)
//     const firstDay = getFirstDayOfMonth(currentDate)
//     const days = []

//     // Empty cells for days before month starts
//     for (let i = 0; i < firstDay; i++) {
//       days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-slate-700"></div>)
//     }

//     // Days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
//       const dayTransactions = getTransactionsForDate(date)
//       const totalIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0)
//       const totalExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0)

//       days.push(
//         <div
//           key={day}
//           onClick={() => handleZoomDate(date)}
//           className="h-40 border border-gray-200 dark:border-slate-700 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors relative group bg-white dark:bg-slate-900"
//         >
//           <div className="flex justify-between items-start mb-2">
//             <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
//               {day}
//             </span>
//             <div className="flex items-center space-x-1">
//               {dayTransactions.length > 0 && (
//                 <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1 rounded">
//                   {dayTransactions.length}
//                 </span>
//               )}
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   handleZoomDate(date)
//                 }}
//                 className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-all duration-200"
//                 title="Zoom in"
//               >
//                 <Maximize2 className="h-3 w-3 text-gray-600 dark:text-gray-300" />
//               </button>
//             </div>
//           </div>

//           <div className="space-y-1 overflow-y-auto max-h-20">
//             {dayTransactions.slice(0, 3).map(transaction => (
//               <div
//                 key={transaction._id}
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   handleTransactionClick(transaction, e)
//                 }}
//                 className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
//                 style={{
//                   backgroundColor: transaction.type === 'income' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
//                   color: transaction.type === 'income' ? '#059669' : '#dc2626'
//                 }}
//               >
//                 <div className="truncate font-medium">{transaction.description}</div>
//                 <div className="truncate">{formatCurrency(transaction.amount)}</div>
//               </div>
//             ))}
//             {dayTransactions.length > 3 && (
//               <div className="text-xs text-gray-500 dark:text-gray-400">
//                 +{dayTransactions.length - 3} more
//               </div>
//             )}
//           </div>

//           {(totalIncome > 0 || totalExpense > 0) && (
//             <div className="mt-2 flex justify-between text-xs border-t border-gray-200 dark:border-slate-700 pt-1">
//               {totalIncome > 0 && (
//                 <span className="text-green-600 dark:text-green-400 font-medium">+{formatCurrency(totalIncome)}</span>
//               )}
//               {totalExpense > 0 && (
//                 <span className="text-red-600 dark:text-red-400 font-medium">-{formatCurrency(totalExpense)}</span>
//               )}
//             </div>
//           )}
//         </div>
//       )
//     }

//     return days
//   }

//   return (
//     <div className="p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => navigateYear('prev')}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
//                 >
//                   <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                 </button>
//                 <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                   {currentDate.getFullYear()}
//                 </span>
//                 <button
//                   onClick={() => navigateYear('next')}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
//                 >
//                   <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                 </button>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => navigateMonth('prev')}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
//                 >
//                   <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                 </button>
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                   {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
//                 </h1>
//                 <button
//                   onClick={() => navigateMonth('next')}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
//                 >
//                   <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                 </button>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setCurrentDate(new Date())}
//                   className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//                 >
//                   Today
//                 </button>
//               </div>
//             </div>

//             <button
//               onClick={() => {
//                 setSelectedDate(new Date())
//                 setFormData({
//                   date: new Date().toISOString().split('T')[0],
//                   description: '',
//                   amount: '',
//                   type: 'expense',
//                   category: ''
//                 })
//                 setEditingTransaction(null)
//                 setShowModal(true)
//               }}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//             >
//               <Plus className="h-4 w-4" />
//               <span>Add Transaction</span>
//             </button>
//           </div>
//         </div>

//         {/* Calendar Grid */}
//         <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
//           {/* Week days header */}
//           <div className="grid grid-cols-7 gap-0 mb-2">
//             {weekDays.map(day => (
//               <div key={day} className="h-10 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
//                 {day}
//               </div>
//             ))}
//           </div>

//           {/* Calendar days */}
//           <div className="grid grid-cols-7 gap-0">
//             {loading ? (
//               <div className="col-span-7 flex items-center justify-center h-96">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               </div>
//             ) : (
//               renderCalendarDays()
//             )}
//           </div>
//         </div>

//         {/* Transaction Modal */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
//                   {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
//                 </h2>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
//                 >
//                   <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Date
//                   </label>
//                   <input
//                     type="date"
//                     value={formData.date}
//                     onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Description
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Amount
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={formData.amount}
//                     onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Type
//                   </label>
//                   <select
//                     value={formData.type}
//                     onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
//                   >
//                     <option value="expense">Expense</option>
//                     <option value="income">Income</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Category
//                   </label>
//                   <select
//                     value={formData.category}
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
//                     required
//                   >
//                     <option value="">Select category</option>
//                     {categories.map(cat => (
//                       <option key={cat} value={cat}>{cat}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="flex space-x-3">
//                   <button
//                     type="submit"
//                     className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//                   >
//                     {editingTransaction ? 'Update' : 'Add'} Transaction
//                   </button>

//                   {editingTransaction && (
//                     <button
//                       type="button"
//                       onClick={() => handleDelete(editingTransaction._id)}
//                       className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   )}
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Zoomed Date View */}
//         {zoomedDate && (
//           <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//             <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
//               <div className="p-6 border-b border-gray-200 dark:border-slate-700">
//                 <div className="flex items-center justify-between">
//                   <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                     {formatLongDate(zoomedDate)}
//                   </h2>
//                   <button
//                     onClick={closeZoom}
//                     className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
//                   >
//                     <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 overflow-y-auto max-h-[60vh]">
//                 {(() => {
//                   const dayTransactions = getTransactionsForDate(zoomedDate)
//                   const totalIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0)
//                   const totalExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0)

//                   return dayTransactions.length === 0 ? (
//                     <div className="text-center py-12">
//                       <div className="text-gray-500 dark:text-gray-400 mb-4">
//                         No transactions for this date
//                       </div>
//                       <button
//                         onClick={() => {
//                           handleDateClick(zoomedDate)
//                           closeZoom()
//                         }}
//                         className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//                       >
//                         Add Transaction
//                       </button>
//                     </div>
//                   ) : (
//                     <div>
//                       {/* Summary */}
//                       <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
//                         <div className="grid grid-cols-3 gap-4 text-center">
//                           <div>
//                             <div className="text-sm text-gray-500 dark:text-gray-400">Transactions</div>
//                             <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{dayTransactions.length}</div>
//                           </div>
//                           <div>
//                             <div className="text-sm text-gray-500 dark:text-gray-400">Income</div>
//                             <div className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</div>
//                           </div>
//                           <div>
//                             <div className="text-sm text-gray-500 dark:text-gray-400">Expenses</div>
//                             <div className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpense)}</div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Transactions List */}
//                       <div className="space-y-3">
//                         {dayTransactions.map(transaction => (
//                           <div
//                             key={transaction._id}
//                             className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
//                           >
//                             <div className="flex items-center justify-between">
//                               <div className="flex-1">
//                                 <div className="flex items-center space-x-3 mb-2">
//                                   <span
//                                     className={`px-2 py-1 text-xs font-medium rounded ${transaction.type === 'income'
//                                       ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
//                                       : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
//                                       }`}
//                                   >
//                                     {transaction.type}
//                                   </span>
//                                   <span className="text-sm text-gray-500 dark:text-gray-400">
//                                     {transaction.category}
//                                   </span>
//                                 </div>
//                                 <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
//                                   {transaction.description}
//                                 </div>
//                               </div>
//                               <div className="flex items-center space-x-3">
//                                 <div className={`text-lg font-bold ${transaction.type === 'income'
//                                   ? 'text-green-600 dark:text-green-400'
//                                   : 'text-red-600 dark:text-red-400'
//                                   }`}>
//                                   {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
//                                 </div>
//                                 <div className="flex space-x-1">
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation()
//                                       handleTransactionClick(transaction, e)
//                                       closeZoom()
//                                     }}
//                                     className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
//                                     title="Edit"
//                                   >
//                                     <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                                   </button>
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation()
//                                       handleDelete(transaction._id)
//                                       closeZoom()
//                                     }}
//                                     className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
//                                     title="Delete"
//                                   >
//                                     <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                                   </button>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>

//                       {/* Add Transaction Button */}
//                       <div className="mt-6">
//                         <button
//                           onClick={() => {
//                             handleDateClick(zoomedDate)
//                             closeZoom()
//                           }}
//                           className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
//                         >
//                           <Plus className="h-5 w-5" />
//                           <span>Add Transaction</span>
//                         </button>
//                       </div>
//                     </div>
//                   )
//                 })()}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Calendar

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, X, Maximize2, Minimize2 } from 'lucide-react'
import { api } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
// import { useDateFormatter } from '../utils/datePreferences'

interface Transaction {
  _id: string;
  date: string | Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  isDeleted?: boolean;
}

interface FormData {
  date: string;
  description: string;
  amount: string | number;
  type: string;
  category: string;
}

const Calendar: React.FC = () => {
  const { formatAmount } = useCurrency()
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [zoomedDate, setZoomedDate] = useState<Date | null>(null)
  const [formData, setFormData] = useState<FormData>({
    date: '',
    description: '',
    amount: '',
    type: 'expense',
    category: ''
  })

  const formatLongDate = (value: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(value)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const categories = [
    'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills',
    'Healthcare', 'Education', 'Salary', 'Investment', 'Other'
  ]

  useEffect(() => {
    fetchTransactions()

    const handleTransactionUpdate = () => {
      fetchTransactions()
    }

    window.addEventListener('transaction-updated', handleTransactionUpdate)

    return () => {
      window.removeEventListener('transaction-updated', handleTransactionUpdate)
    }
  }, [currentDate])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      console.log('Fetching transactions for date range:', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      const response = await api.get('/api/transactions', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          limit: 1000 
        }
      })

      console.log('API response:', response.data)

      const transactionsData = response.data.transactions || response.data || []
      console.log('Setting transactions:', transactionsData.length, 'items')
      setTransactions(transactionsData)
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error - user may need to login')
      }
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getTransactionsForDate = (date: Date) => {
    if (!Array.isArray(transactions)) return []

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    return transactions.filter(t => {
      let transactionDate: string
      if (t.date instanceof Date) {
        const tYear = t.date.getFullYear()
        const tMonth = String(t.date.getMonth() + 1).padStart(2, '0')
        const tDay = String(t.date.getDate()).padStart(2, '0')
        transactionDate = `${tYear}-${tMonth}-${tDay}`
      } else if (typeof t.date === 'string') {
        transactionDate = t.date.split('T')[0]
      } else {
        transactionDate = String(t.date)
      }

      return transactionDate === dateStr && !t.isDeleted
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1)
      } else {
        newDate.setFullYear(prev.getFullYear() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    setFormData({
      date: dateStr,
      description: '',
      amount: '',
      type: 'expense',
      category: ''
    })
    setEditingTransaction(null)
    setShowModal(true)
  }

  const handleZoomDate = (date: Date) => {
    setZoomedDate(date)
  }

  const closeZoom = () => {
    setZoomedDate(null)
  }

  const handleTransactionClick = (transaction: Transaction, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTransaction(transaction)

    let dateStr: string
    const tDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date)

    if (!isNaN(tDate.getTime())) {
      const year = tDate.getFullYear()
      const month = String(tDate.getMonth() + 1).padStart(2, '0')
      const day = String(tDate.getDate()).padStart(2, '0')
      dateStr = `${year}-${month}-${day}`
    } else if (typeof transaction.date === 'string') {
      dateStr = transaction.date.split('T')[0]
    } else {
      dateStr = ''
    }

    setFormData({
      date: dateStr,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editingTransaction) {
        await api.put(`/api/transactions/${editingTransaction._id}`, formData)
      } else {
        await api.post('/api/transactions', formData)
      }

      await fetchTransactions()
      setShowModal(false)
      setEditingTransaction(null)
      setFormData({
        date: '',
        description: '',
        amount: '',
        type: 'expense',
        category: ''
      })

      window.dispatchEvent(new CustomEvent('transaction-updated'))
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDelete = async (transactionId: string) => {
    try {
      await api.delete(`/api/transactions/${transactionId}`)
      await fetchTransactions()
      setShowModal(false)

      window.dispatchEvent(new CustomEvent('transaction-updated'))
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const formatCurrency = (amount: any) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount)
    if (isNaN(num)) {
      return formatAmount(0)
    }
    return formatAmount(num)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-slate-700"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayTransactions = getTransactionsForDate(date)
      const totalIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0)
      const totalExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0)

      days.push(
        <div
          key={day}
          onClick={() => handleZoomDate(date)}
          className="h-40 border border-gray-200 dark:border-slate-700 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors relative group bg-white dark:bg-slate-900"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {day}
            </span>
            <div className="flex items-center space-x-1">
              {dayTransactions.length > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1 rounded">
                  {dayTransactions.length}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomDate(date)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-all duration-200"
                title="Zoom in"
              >
                <Maximize2 className="h-3 w-3 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-20">
            {dayTransactions.slice(0, 3).map(transaction => (
              <div
                key={transaction._id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTransactionClick(transaction, e)
                }}
                className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                style={{
                  backgroundColor: transaction.type === 'income' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: transaction.type === 'income' ? '#059669' : '#dc2626'
                }}
              >
                <div className="truncate font-medium">{transaction.description}</div>
                <div className="truncate">{formatCurrency(transaction.amount)}</div>
              </div>
            ))}
            {dayTransactions.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{dayTransactions.length - 3} more
              </div>
            )}
          </div>

          {(totalIncome > 0 || totalExpense > 0) && (
            <div className="mt-2 flex justify-between text-xs border-t border-gray-200 dark:border-slate-700 pt-1">
              {totalIncome > 0 && (
                <span className="text-green-600 dark:text-green-400 font-medium">+{formatCurrency(totalIncome)}</span>
              )}
              {totalExpense > 0 && (
                <span className="text-red-600 dark:text-red-400 font-medium">-{formatCurrency(totalExpense)}</span>
              )}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateYear('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {currentDate.getFullYear()}
                </span>
                <button
                  onClick={() => navigateYear('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h1>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  description: '',
                  amount: '',
                  type: 'expense',
                  category: ''
                })
                setEditingTransaction(null)
                setShowModal(true)
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-7 gap-0 mb-2">
            {weekDays.map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0">
            {loading ? (
              <div className="col-span-7 flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderCalendarDays()
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingTransaction ? 'Update' : 'Add'} Transaction
                  </button>

                  {editingTransaction && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingTransaction._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {zoomedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatLongDate(zoomedDate)}
                  </h2>
                  <button
                    onClick={closeZoom}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {(() => {
                  const dayTransactions = getTransactionsForDate(zoomedDate)
                  const totalIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0)
                  const totalExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0)

                  return dayTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 dark:text-gray-400 mb-4">
                        No transactions for this date
                      </div>
                      <button
                        onClick={() => {
                          handleDateClick(zoomedDate)
                          closeZoom()
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Add Transaction
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Transactions</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{dayTransactions.length}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Income</div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Expenses</div>
                            <div className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpense)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {dayTransactions.map(transaction => (
                          <div
                            key={transaction._id}
                            className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded ${transaction.type === 'income'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                      }`}
                                  >
                                    {transaction.type}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {transaction.category}
                                  </span>
                                </div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                  {transaction.description}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className={`text-lg font-bold ${transaction.type === 'income'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                                  }`}>
                                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleTransactionClick(transaction, e)
                                      closeZoom()
                                    }}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(transaction._id)
                                      closeZoom()
                                    }}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => {
                            handleDateClick(zoomedDate!)
                            closeZoom()
                          }}
                          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Add Transaction</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar
