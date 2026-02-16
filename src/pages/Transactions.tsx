// // import React, { useState, useEffect } from 'react'
// // import { Plus, Filter, Edit2, Trash2 } from 'lucide-react'
// // import { api } from '../api'
// // import API from '../api'
// // import { useCurrency } from '../contexts/CurrencyContext'

// // interface Transaction {
// //   _id: string
// //   date: string
// //   amount: number
// //   type: 'income' | 'expense'
// //   category: string
// //   description: string
// //   tags?: string[]
// //   isDeleted?: boolean
// //   createdAt?: string
// //   updatedAt?: string
// // }

// // interface FilterState {
// //   type: 'all' | 'income' | 'expense'
// //   category: string
// //   search: string
// //   startDate: string
// //   endDate: string
// // }

// // const Transactions: React.FC = () => {
// //   const { formatAmountWithSign } = useCurrency()
// //   const [transactions, setTransactions] = useState<Transaction[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState('')
// //   const [filters, setFilters] = useState<FilterState>({
// //     type: 'all',
// //     category: '',
// //     search: '',
// //     startDate: '',
// //     endDate: ''
// //   })
// //   const [showFilters, setShowFilters] = useState(false)
// //   const [showEditModal, setShowEditModal] = useState(false)
// //   const [showDeleteModal, setShowDeleteModal] = useState(false)
// //   const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
// //   const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
// //   const [editForm, setEditForm] = useState<Partial<Transaction>>({})
// //   const [pagination, setPagination] = useState({
// //     page: 1,
// //     limit: 50,
// //     total: 0,
// //     totalPages: 0
// //   })

// //   useEffect(() => {
// //     fetchTransactions()
// //   }, [filters, pagination.page])

// //   const fetchTransactions = async () => {
// //     try {
// //       setLoading(true)
// //       const params = new URLSearchParams()
      
// //       if (filters.type !== 'all') params.append('type', filters.type)
// //       if (filters.category) params.append('category', filters.category)
// //       if (filters.search) params.append('search', filters.search)
// //       if (filters.startDate) params.append('startDate', filters.startDate)
// //       if (filters.endDate) params.append('endDate', filters.endDate)
// //       params.append('page', pagination.page.toString())
// //       params.append('limit', pagination.limit.toString())

// //       const response = await api.get(`${API.TRANSACTIONS}?${params}`)
// //       setTransactions(response.data.transactions)
// //       setPagination(response.data.pagination)
// //     } catch (error: any) {
// //       setError(error.response?.data?.error || 'Failed to fetch transactions')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const handleFilterChange = (key: keyof FilterState, value: string) => {
// //     setFilters(prev => ({ ...prev, [key]: value }))
// //     setPagination(prev => ({ ...prev, page: 1 }))
// //   }

// //   const handleEdit = (transaction: Transaction) => {
// //     setEditingTransaction(transaction)
// //     setEditForm({
// //       date: transaction.date,
// //       amount: transaction.amount,
// //       type: transaction.type,
// //       category: transaction.category,
// //       description: transaction.description
// //     })
// //     setShowEditModal(true)
// //   }

// //   const handleDelete = (transaction: Transaction) => {
// //     setDeletingTransaction(transaction)
// //     setShowDeleteModal(true)
// //   }

// //   const handleEditSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     if (!editingTransaction) return

// //     try {
// //       await api.put(`${API.TRANSACTIONS}/${editingTransaction._id}`, editForm)
// //       setShowEditModal(false)
// //       setEditingTransaction(null)
// //       setEditForm({})
// //       fetchTransactions()
// //     } catch (error: any) {
// //       setError(error.response?.data?.error || 'Failed to update transaction')
// //     }
// //   }

// //   const handleDeleteConfirm = async () => {
// //     if (!deletingTransaction) return

// //     try {
// //       await api.delete(`${API.TRANSACTIONS}/${deletingTransaction._id}`)
// //       setShowDeleteModal(false)
// //       setDeletingTransaction(null)
// //       fetchTransactions()
// //     } catch (error: any) {
// //       setError((error as any).response?.data?.error || 'Failed to delete transaction')
// //     }
// //   }

// //   const clearFilters = () => {
// //     setFilters({
// //       type: 'all',
// //       category: '',
// //       search: '',
// //       startDate: '',
// //       endDate: ''
// //     })
// //     setPagination(prev => ({ ...prev, page: 1 }))
// //   }

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
// //         <div>
// //           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
// //           <p className="text-gray-600 dark:text-gray-400">Manage your income and expenses</p>
// //         </div>
// //         <div className="flex space-x-3 mt-4 sm:mt-0">
// //           <button
// //             onClick={() => setShowFilters(!showFilters)}
// //             className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
// //           >
// //             <Filter className="h-4 w-4 mr-2" />
// //             Filters
// //           </button>
// //           <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary">
// //             <Plus className="h-4 w-4 mr-2" />
// //             Add Transaction
// //           </button>
// //         </div>
// //       </div>

// //       {/* Filters */}
// //       {showFilters && (
// //         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
// //           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
// //               <select
// //                 value={filters.type}
// //                 onChange={(e) => handleFilterChange('type', e.target.value)}
// //                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //               >
// //                 <option value="all">All</option>
// //                 <option value="income">Income</option>
// //                 <option value="expense">Expense</option>
// //               </select>
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
// //               <input
// //                 type="text"
// //                 value={filters.category}
// //                 onChange={(e) => handleFilterChange('category', e.target.value)}
// //                 placeholder="Filter by category"
// //                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
// //               <input
// //                 type="text"
// //                 value={filters.search}
// //                 onChange={(e) => handleFilterChange('search', e.target.value)}
// //                 placeholder="Search transactions"
// //                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
// //               <input
// //                 type="date"
// //                 value={filters.startDate}
// //                 onChange={(e) => handleFilterChange('startDate', e.target.value)}
// //                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
// //               <input
// //                 type="date"
// //                 value={filters.endDate}
// //                 onChange={(e) => handleFilterChange('endDate', e.target.value)}
// //                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //               />
// //             </div>
// //           </div>
// //           <div className="mt-4 flex justify-end">
// //             <button
// //               onClick={clearFilters}
// //               className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
// //             >
// //               Clear Filters
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* Error Message */}
// //       {error && (
// //         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
// //           {error}
// //         </div>
// //       )}

// //       {/* Transactions List */}
// //       <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
// //             <thead className="bg-gray-50 dark:bg-slate-900">
// //               <tr>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Date
// //                 </th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Description
// //                 </th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Category
// //                 </th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Type
// //                 </th>
// //                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Amount
// //                 </th>
// //                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Actions
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
// //               {loading ? (
// //                 <tr>
// //                   <td colSpan={6} className="px-6 py-4 text-center">
// //                     <div className="flex justify-center">
// //                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ) : transactions.length === 0 ? (
// //                 <tr>
// //                   <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
// //                     No transactions found
// //                   </td>
// //                 </tr>
// //               ) : (
// //                 transactions.map((transaction) => (
// //                   <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
// //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                       {new Date(transaction.date).toLocaleDateString()}
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                       {transaction.description}
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                       {transaction.category}
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap">
// //                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
// //                         transaction.type === 'income'
// //                           ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
// //                           : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
// //                       }`}>
// //                         {transaction.type}
// //                       </span>
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
// //                       <span className={`font-medium ${
// //                         transaction.type === 'income'
// //                           ? 'text-green-600 dark:text-green-400'
// //                           : 'text-red-600 dark:text-red-400'
// //                       }`}>
// //                         {formatAmountWithSign(transaction.amount, transaction.type)}
// //                       </span>
// //                     </td>
// //                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
// //                       <button
// //                         onClick={() => handleEdit(transaction)}
// //                         className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
// //                       >
// //                         <Edit2 className="h-4 w-4" />
// //                       </button>
// //                       <button
// //                         onClick={() => handleDelete(transaction)}
// //                         className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
// //                       >
// //                         <Trash2 className="h-4 w-4" />
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* Pagination */}
// //       {pagination.totalPages > 1 && (
// //         <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-700">
// //           <div className="flex-1 flex justify-between sm:hidden">
// //             <button
// //               onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
// //               disabled={pagination.page === 1}
// //               className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
// //             >
// //               Previous
// //             </button>
// //             <button
// //               onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
// //               disabled={pagination.page === pagination.totalPages}
// //               className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
// //             >
// //               Next
// //             </button>
// //           </div>
// //           <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
// //             <div>
// //               <p className="text-sm text-gray-700 dark:text-gray-300">
// //                 Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
// //                 <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
// //                 <span className="font-medium">{pagination.total}</span> results
// //               </p>
// //             </div>
// //             <div>
// //               <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
// //                 <button
// //                   onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
// //                   disabled={pagination.page === 1}
// //                   className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
// //                 >
// //                   Previous
// //                 </button>
// //                 <button
// //                   onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
// //                   disabled={pagination.page === pagination.totalPages}
// //                   className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
// //                 >
// //                   Next
// //                 </button>
// //               </nav>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Edit Modal */}
// //       {showEditModal && editingTransaction && (
// //         <div className="fixed inset-0 z-50 overflow-y-auto">
// //           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
// //             <div className="fixed inset-0 transition-opacity" onClick={() => setShowEditModal(false)}>
// //               <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
// //             </div>
// //             <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
// //               <form onSubmit={handleEditSubmit}>
// //                 <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
// //                   <div className="sm:flex sm:items-start">
// //                     <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
// //                       <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Edit Transaction</h3>
// //                       <div className="mt-4 space-y-4">
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
// //                           <input
// //                             type="date"
// //                             value={editForm.date}
// //                             onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
// //                           <input
// //                             type="text"
// //                             value={editForm.description}
// //                             onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
// //                           <input
// //                             type="number"
// //                             step="0.01"
// //                             value={editForm.amount}
// //                             onChange={(e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
// //                           <select
// //                             value={editForm.type}
// //                             onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           >
// //                             <option value="income">Income</option>
// //                             <option value="expense">Expense</option>
// //                           </select>
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
// //                           <input
// //                             type="text"
// //                             value={editForm.category}
// //                             onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //                 <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
// //                   <button
// //                     type="submit"
// //                     className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary dark:bg-primary-light text-base font-medium text-white hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm"
// //                   >
// //                     Save Changes
// //                   </button>
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowEditModal(false)}
// //                     className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
// //                   >
// //                     Cancel
// //                   </button>
// //                 </div>
// //               </form>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Delete Modal */}
// //       {showDeleteModal && deletingTransaction && (
// //         <div className="fixed inset-0 z-50 overflow-y-auto">
// //           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
// //             <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteModal(false)}>
// //               <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
// //             </div>
// //             <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
// //               <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
// //                 <div className="sm:flex sm:items-start">
// //                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
// //                     <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Transaction</h3>
// //                     <div className="mt-2">
// //                       <p className="text-sm text-gray-500 dark:text-gray-400">
// //                         Are you sure you want to delete this transaction? This action cannot be undone.
// //                       </p>
// //                       <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
// //                         <p className="text-sm font-medium text-gray-900 dark:text-white">{deletingTransaction.description}</p>
// //                         <p className="text-sm text-gray-500 dark:text-gray-400">{deletingTransaction.category}</p>
// //                         <p className={`text-sm font-medium ${
// //                           deletingTransaction.type === 'income'
// //                             ? 'text-green-600 dark:text-green-400'
// //                             : 'text-red-600 dark:text-red-400'
// //                         }`}>
// //                           {formatAmountWithSign(deletingTransaction.amount, deletingTransaction.type)}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
// //                 <button
// //                   onClick={handleDeleteConfirm}
// //                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 dark:bg-red-600 text-base font-medium text-white hover:bg-red-700 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
// //                 >
// //                   Delete
// //                 </button>
// //                 <button
// //                   onClick={() => setShowDeleteModal(false)}
// //                   className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
// //                 >
// //                   Cancel
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   )
// // }

// // export default Transactions

// import React, { useEffect, useMemo, useState } from 'react'
// import { Search, Filter, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
// import { useSearchParams } from 'react-router-dom'
// import { api } from '../api'
// import API from '../api'
// import { useCurrency } from '../contexts/CurrencyContext'
// import { useDateFormatter } from '../utils/datePreferences'

// type TransactionType = 'income' | 'expense'

// interface Transaction {
//   _id: string
//   date: string
//   description: string
//   amount: number
//   type: TransactionType
//   category: string
// }

// interface Pagination {
//   totalPages: number
//   total: number
// }

// interface TransactionsResponse {
//   transactions: Transaction[]
//   pagination: Pagination
// }

// interface TransactionFormData {
//   date: string
//   description: string
//   amount: string | number
//   type: TransactionType
//   category: string
// }

// type FormErrors = Partial<Record<'description' | 'amount' | 'category' | 'date' | 'general', string>>

// const Transactions: React.FC = () => {
//   const { formatAmountWithSign } = useCurrency()
//   const { formatDate } = useDateFormatter()

//   const [searchParams] = useSearchParams()

//   const [transactions, setTransactions] = useState<Transaction[]>([])
//   const [loading, setLoading] = useState<boolean>(true)

//   const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '')
//   const [typeFilter, setTypeFilter] = useState<string>('')
//   const [categoryFilter, setCategoryFilter] = useState<string>('')

//   const [currentPage, setCurrentPage] = useState<number>(1)
//   const [totalPages, setTotalPages] = useState<number>(1)
//   const [totalResults, setTotalResults] = useState<number>(0)

//   const [categories, setCategories] = useState<string[]>([])

//   const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
//   const [editForm, setEditForm] = useState<Partial<TransactionFormData>>({})
//   const [showEditModal, setShowEditModal] = useState<boolean>(false)

//   const [showAddModal, setShowAddModal] = useState<boolean>(false)
//   const [addForm, setAddForm] = useState<TransactionFormData>({
//     date: new Date().toISOString().split('T')[0],
//     description: '',
//     amount: '',
//     type: 'expense',
//     category: ''
//   })

//   const [customCategory, setCustomCategory] = useState<string>('')
//   const [showCustomCategoryInput, setShowCustomCategoryInput] = useState<boolean>(false)
//   const [formErrors, setFormErrors] = useState<FormErrors>({})

//   const fetchTransactions = async (): Promise<void> => {
//     try {
//       setLoading(true)

//       const params = new URLSearchParams({
//         page: String(currentPage),
//         limit: '10',
//         ...(typeFilter ? { type: typeFilter } : {}),
//         ...(categoryFilter ? { category: categoryFilter } : {}),
//         ...(searchTerm ? { search: searchTerm } : {})
//       })

//       const response = await api.get<TransactionsResponse>(`${API.TRANSACTIONS}?${params.toString()}`)

//       const txns = Array.isArray(response.data?.transactions) ? response.data.transactions : []
//       setTransactions(txns)

//       setTotalPages(Number(response.data?.pagination?.totalPages) || 1)
//       setTotalResults(Number(response.data?.pagination?.total) || 0)

//       const uniqueCategories = [...new Set(txns.map((t) => t.category).filter(Boolean))]
//       setCategories(uniqueCategories)
//     } catch (error: unknown) {
//       console.error('Error fetching transactions:', error)
//       setTransactions([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchTransactions()
//   }, [currentPage, typeFilter, categoryFilter, searchTerm])

//   useEffect(() => {
//     const urlSearchTerm = searchParams.get('search')
//     if (urlSearchTerm !== searchTerm) {
//       setSearchTerm(urlSearchTerm || '')
//     }
//   }, [searchParams])

//   const filteredTransactions = useMemo(() => {
//     const q = searchTerm.trim().toLowerCase()

//     if (!q) return transactions

//     return transactions.filter((transaction) => {
//       const matchesSearch =
//         transaction.description.toLowerCase().includes(q) ||
//         transaction.category.toLowerCase().includes(q)

//       return matchesSearch
//     })
//   }, [transactions, searchTerm])

//   const handleDelete = async (id: string): Promise<void> => {
//     if (window.confirm('Are you sure you want to delete this transaction?')) {
//       try {
//         // ✅ FIXED: you had axios.delete but axios is not imported
//         await api.delete(`${API.TRANSACTIONS}/${id}`)
//         await fetchTransactions()

//         window.dispatchEvent(new CustomEvent('transaction-updated'))
//       } catch (error) {
//         console.error('Error deleting transaction:', error)
//       }
//     }
//   }

//   const handleEdit = (transaction: Transaction): void => {
//     setEditingTransaction(transaction)
//     setEditForm({
//       date: new Date(transaction.date).toISOString().split('T')[0],
//       amount: transaction.amount,
//       type: transaction.type,
//       category: transaction.category,
//       description: transaction.description
//     })
//     setShowEditModal(true)
//   }

//   const validateForm = (formData: Partial<TransactionFormData>): FormErrors => {
//     const errors: FormErrors = {}

//     if (!formData.description || formData.description.trim() === '') {
//       errors.description = 'Description is required'
//     }

//     const amt = Number(formData.amount)
//     if (!formData.amount || Number.isNaN(amt) || amt <= 0) {
//       errors.amount = 'Amount must be greater than 0'
//     }

//     if (!formData.category || formData.category.trim() === '') {
//       errors.category = 'Category is required'
//     }

//     if (!formData.date) {
//       errors.date = 'Date is required'
//     }

//     return errors
//   }

//   const handleAdd = async (): Promise<void> => {
//     const errors = validateForm(addForm)
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors)
//       return
//     }

//     try {
//       const newTransaction = {
//         ...addForm,
//         amount: Number(addForm.amount),
//         date: new Date(addForm.date),
//         fingerprint: `${addForm.description}-${addForm.amount}-${addForm.date}-${addForm.category}-${addForm.type}`
//       }

//       await api.post('/api/transactions', newTransaction)

//       setShowAddModal(false)
//       setAddForm({
//         date: new Date().toISOString().split('T')[0],
//         description: '',
//         amount: '',
//         type: 'expense',
//         category: ''
//       })
//       setCustomCategory('')
//       setShowCustomCategoryInput(false)
//       setFormErrors({})

//       await fetchTransactions()
//       window.dispatchEvent(new CustomEvent('transaction-updated'))
//       alert('Transaction added successfully!')
//     } catch (error) {
//       console.error('Error adding transaction:', error)
//       setFormErrors({ general: 'Failed to add transaction. Please try again.' })
//     }
//   }

//   const handleCustomCategoryAdd = (): void => {
//     const cat = customCategory.trim()
//     if (cat && !categories.includes(cat)) {
//       setCategories([...categories, cat])
//       setAddForm({ ...addForm, category: cat })
//       setCustomCategory('')
//       setShowCustomCategoryInput(false)
//     }
//   }

//   const handleCategoryChange = (value: string): void => {
//     if (value === 'custom') {
//       setShowCustomCategoryInput(true)
//       // NOTE: this same flag is shared by Add + Edit in your JSX
//       setAddForm({ ...addForm, category: '' })
//       setEditForm((prev) => ({ ...prev, category: '' }))
//     } else {
//       setShowCustomCategoryInput(false)
//       setCustomCategory('')
//       setAddForm({ ...addForm, category: value })
//       setEditForm((prev) => ({ ...prev, category: value }))
//     }
//   }

//   const handleUpdate = async (): Promise<void> => {
//     if (!editingTransaction?._id) return

//     const errors = validateForm(editForm)
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors)
//       return
//     }

//     try {
//       const updatedTransaction = {
//         ...editForm,
//         amount: Number(editForm.amount),
//         date: new Date(String(editForm.date)),
//         fingerprint: `${editForm.description}-${editForm.amount}-${editForm.date}-${editForm.category}-${editForm.type}`
//       }

//       await api.put(`${API.TRANSACTIONS}/${editingTransaction._id}`, updatedTransaction)

//       setShowEditModal(false)
//       setEditingTransaction(null)
//       setEditForm({})
//       setCustomCategory('')
//       setShowCustomCategoryInput(false)
//       setFormErrors({})

//       await fetchTransactions()
//       window.dispatchEvent(new CustomEvent('transaction-updated'))
//     } catch (error) {
//       console.error('Error updating transaction:', error)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
//         >
//           <Plus className="h-5 w-5 mr-2" />
//           Add Transaction
//         </button>
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow">
//         <div className="flex flex-col sm:flex-row gap-4 mb-6">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search transactions..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           <div className="flex gap-2">
//             <select
//               value={typeFilter}
//               onChange={(e) => {
//                 setTypeFilter(e.target.value)
//                 setCurrentPage(1)
//               }}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Types</option>
//               <option value="income">Income</option>
//               <option value="expense">Expense</option>
//             </select>

//             <select
//               value={categoryFilter}
//               onChange={(e) => {
//                 setCategoryFilter(e.target.value)
//                 setCurrentPage(1)
//               }}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Categories</option>
//               {categories.map((category) => (
//                 <option key={category} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>

//             <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
//               <Filter className="h-4 w-4 mr-2" />
//               Filters
//             </button>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Description
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Category
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Type
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Amount
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredTransactions.length > 0 ? (
//                     filteredTransactions.map((transaction) => (
//                       <tr key={transaction._id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {formatDate(transaction.date)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {transaction.description}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
//                             {transaction.category}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           <span
//                             className={`px-2 py-1 text-xs rounded-full ${
//                               transaction.type === 'income'
//                                 ? 'bg-green-100 text-green-800'
//                                 : 'bg-red-100 text-red-800'
//                             }`}
//                           >
//                             {transaction.type}
//                           </span>
//                         </td>
//                         <td
//                           className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
//                             transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
//                           }`}
//                         >
//                           {formatAmountWithSign(transaction.amount, transaction.type)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <div className="flex items-center justify-end gap-3">
//                             <button
//                               onClick={() => handleEdit(transaction)}
//                               className="inline-flex items-center text-blue-600 hover:text-blue-900"
//                               title="Edit transaction"
//                             >
//                               <Edit2 className="h-4 w-4" />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(transaction._id)}
//                               className="inline-flex items-center text-red-600 hover:text-red-900"
//                               title="Delete transaction"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
//                         No transactions found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {filteredTransactions.length > 0 && (
//               <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
//                 <div className="text-sm text-gray-700">
//                   Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
//                   <span className="font-medium">{Math.min(currentPage * 10, totalResults)}</span> of{' '}
//                   <span className="font-medium">{totalResults}</span> results
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                   >
//                     <ChevronLeft className="h-4 w-4 mr-1" />
//                     Previous
//                   </button>

//                   <button
//                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                   >
//                     Next
//                     <ChevronRight className="h-4 w-4 ml-1" />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Edit Modal */}
//       {showEditModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Edit Transaction</h3>
//               <button
//                 onClick={() => {
//                   setShowEditModal(false)
//                   setEditingTransaction(null)
//                   setEditForm({})
//                   setFormErrors({})
//                 }}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
//                 <input
//                   type="date"
//                   value={String(editForm.date || '')}
//                   onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                 <input
//                   type="text"
//                   value={String(editForm.description || '')}
//                   onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={String(editForm.amount ?? '')}
//                   onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
//                 <select
//                   value={String(editForm.type || 'expense')}
//                   onChange={(e) => setEditForm({ ...editForm, type: e.target.value as TransactionType })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="income">Income</option>
//                   <option value="expense">Expense</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
//                 <div className="space-y-2">
//                   <select
//                     value={showCustomCategoryInput ? 'custom' : String(editForm.category || '')}
//                     onChange={(e) => handleCategoryChange(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Select category</option>
//                     {categories.map((category) => (
//                       <option key={category} value={category}>
//                         {category}
//                       </option>
//                     ))}
//                     <option value="custom">+ Add Custom Category...</option>
//                   </select>

//                   {showCustomCategoryInput && (
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         value={customCategory}
//                         onChange={(e) => setCustomCategory(e.target.value)}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter') {
//                             e.preventDefault()
//                             handleCustomCategoryAdd()
//                           }
//                         }}
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Enter custom category..."
//                       />
//                       <button
//                         onClick={handleCustomCategoryAdd}
//                         className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
//                       >
//                         Add
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowEditModal(false)
//                   setEditingTransaction(null)
//                   setEditForm({})
//                   setFormErrors({})
//                 }}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdate}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Update Transaction
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add Transaction Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Transaction</h3>
//               <button
//                 onClick={() => {
//                   setShowAddModal(false)
//                   setAddForm({
//                     date: new Date().toISOString().split('T')[0],
//                     description: '',
//                     amount: '',
//                     type: 'expense',
//                     category: ''
//                   })
//                   setFormErrors({})
//                 }}
//                 className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             {formErrors.general && (
//               <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                 <p className="text-red-600 dark:text-red-400 text-sm font-medium">{formErrors.general}</p>
//               </div>
//             )}

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
//                 <input
//                   type="date"
//                   value={addForm.date}
//                   onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100 ${
//                     formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
//                   }`}
//                   required
//                 />
//                 {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
//                 <input
//                   type="text"
//                   value={addForm.description}
//                   onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100 ${
//                     formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
//                   }`}
//                   placeholder="Enter description..."
//                   required
//                 />
//                 {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
//                 <input
//                   type="number"
//                   value={String(addForm.amount)}
//                   onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
//                   className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100 ${
//                     formErrors.amount ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
//                   }`}
//                   placeholder="0.00"
//                   step="0.01"
//                   min="0"
//                   required
//                 />
//                 {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
//                 <select
//                   value={addForm.type}
//                   onChange={(e) => setAddForm({ ...addForm, type: e.target.value as TransactionType })}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
//                 >
//                   <option value="expense">Expense</option>
//                   <option value="income">Income</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
//                 <div className="space-y-2">
//                   <select
//                     value={showCustomCategoryInput ? 'custom' : addForm.category}
//                     onChange={(e) => handleCategoryChange(e.target.value)}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100 ${
//                       formErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
//                     }`}
//                   >
//                     <option value="">Select category</option>
//                     {categories.map((category) => (
//                       <option key={category} value={category}>
//                         {category}
//                       </option>
//                     ))}
//                     <option value="custom">+ Add Custom Category...</option>
//                   </select>

//                   {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}

//                   {showCustomCategoryInput && (
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         value={customCategory}
//                         onChange={(e) => setCustomCategory(e.target.value)}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter') {
//                             e.preventDefault()
//                             handleCustomCategoryAdd()
//                           }
//                         }}
//                         className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
//                         placeholder="Enter custom category..."
//                       />
//                       <button
//                         onClick={handleCustomCategoryAdd}
//                         className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
//                       >
//                         Add
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowAddModal(false)
//                   setAddForm({
//                     date: new Date().toISOString().split('T')[0],
//                     description: '',
//                     amount: '',
//                     type: 'expense',
//                     category: ''
//                   })
//                   setFormErrors({})
//                 }}
//                 className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleAdd}
//                 className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
//               >
//                 Add Transaction
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Transactions
import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'
import { Search, Filter, Plus, Edit2, Trash2, X, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import API from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import { useDateFormatter } from '../utils/datePreferences'
import axios from 'axios' // Required for the handleDelete logic in your snippet

// --- Interfaces to maintain strict typing ---
interface Transaction {
  _id: string;
  date: string | Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface TransactionForm {
  date: string;
  description: string;
  amount: string | number;
  type: string;
  category: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
  general?: string;
}

const Transactions: React.FC = () => {
  const { formatAmountWithSign } = useCurrency()
  const { formatDate } = useDateFormatter()
  const [searchParams, setSearchParams] = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalResults, setTotalResults] = useState<number>(0)
  const [categories, setCategories] = useState<string[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editForm, setEditForm] = useState<Partial<TransactionForm>>({})
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [addForm, setAddForm] = useState<TransactionForm>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense',
    category: ''
  })
  const [customCategory, setCustomCategory] = useState<string>('')
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState<boolean>(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(typeFilter && { type: typeFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      console.log('Fetching transactions with params:', params.toString())
      const response = await api.get(`${API.TRANSACTIONS}?${params}`)
      console.log('API response:', response.data)

      setTransactions(response.data.transactions)
      setTotalPages(response.data.pagination.totalPages)
      setTotalResults(response.data.pagination.total)

      const uniqueCategories = [...new Set(response.data.transactions.map((t: Transaction) => t.category))] as string[]
      console.log('Setting categories:', uniqueCategories)
      setCategories(uniqueCategories)
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

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, typeFilter, categoryFilter, searchTerm])

  useEffect(() => {
    const urlSearchTerm = searchParams.get('search')
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm || '')
    }
  }, [searchParams])

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${API.TRANSACTIONS}/${id}`)
        fetchTransactions() 

        window.dispatchEvent(new CustomEvent('transaction-updated'))
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditForm({
      date: new Date(transaction.date).toISOString().split('T')[0],
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description
    })
    setShowEditModal(true)
  }

  const validateForm = (formData: TransactionForm | Partial<TransactionForm>) => {
    const errors: FormErrors = {}

    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Description is required'
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0'
    }

    if (!formData.category || formData.category.trim() === '') {
      errors.category = 'Category is required'
    }

    if (!formData.date) {
      errors.date = 'Date is required'
    }

    return errors
  }

  const handleAdd = async () => {
    const errors = validateForm(addForm)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      const newTransaction = {
        ...addForm,
        date: new Date(addForm.date),
        fingerprint: `${addForm.description}-${addForm.amount}-${addForm.date}-${addForm.category}-${addForm.type}`
      }

      console.log('Adding transaction:', newTransaction)
      const response = await api.post('/api/transactions', newTransaction)
      console.log('Transaction added successfully:', response.data)

      setShowAddModal(false)
      setAddForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        category: ''
      })
      setCustomCategory('')
      setShowCustomCategoryInput(false)
      setFormErrors({})

      await fetchTransactions()
      window.dispatchEvent(new CustomEvent('transaction-updated'))
      alert('Transaction added successfully!')
    } catch (error) {
      console.error('Error adding transaction:', error)
      setFormErrors({ general: 'Failed to add transaction. Please try again.' })
    }
  }

  const handleCustomCategoryAdd = () => {
    if (customCategory.trim() && !categories.includes(customCategory.trim())) {
      setCategories([...categories, customCategory.trim()])
      if (showEditModal) {
          setEditForm({ ...editForm, category: customCategory.trim() })
      } else {
          setAddForm({ ...addForm, category: customCategory.trim() })
      }
      setCustomCategory('')
      setShowCustomCategoryInput(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomCategoryInput(true)
      if (showEditModal) setEditForm({ ...editForm, category: '' })
      else setAddForm({ ...addForm, category: '' })
    } else {
      setShowCustomCategoryInput(false)
      setCustomCategory('')
      if (showEditModal) setEditForm({ ...editForm, category: value })
      else setAddForm({ ...addForm, category: value })
    }
  }

  const handleUpdate = async () => {
    if (!editingTransaction) return;
    try {
      const updatedTransaction = {
        ...editForm,
        date: new Date(editForm.date || ''),
        fingerprint: `${editForm.description}-${editForm.amount}-${editForm.date}-${editForm.category}-${editForm.type}`
      }

      await api.put(`${API.TRANSACTIONS}/${editingTransaction._id}`, updatedTransaction)
      setShowEditModal(false)
      setEditingTransaction(null)
      setEditForm({})
      setCustomCategory('')
      setShowCustomCategoryInput(false)
      fetchTransactions() 

      window.dispatchEvent(new CustomEvent('transaction-updated'))
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <span className={`px-2 py-1 text-xs rounded-full ${transaction.type === 'income'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                          {formatAmountWithSign(transaction.amount, transaction.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              title="Edit transaction"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction._id)}
                              className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title="Delete transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 rounded-b-lg">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, totalResults)}</span> of{' '}
                  <span className="font-medium">{totalResults}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Transaction</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTransaction(null)
                  setEditForm({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <div className="space-y-2">
                  <select
                    value={showCustomCategoryInput ? 'custom' : editForm.category}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="custom">+ Add Custom Category...</option>
                  </select>

                  {showCustomCategoryInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomCategory(e.target.value)}
                        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            handleCustomCategoryAdd()
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                        placeholder="Enter custom category..."
                      />
                      <button
                        onClick={handleCustomCategoryAdd}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTransaction(null)
                  setEditForm({})
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Transaction</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setAddForm({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: '',
                    type: 'expense',
                    category: ''
                  })
                  setFormErrors({})
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{formErrors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={addForm.date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAddForm({ ...addForm, date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100 ${formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                  required
                />
                {formErrors.date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={addForm.description}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAddForm({ ...addForm, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100 ${formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                  placeholder="Enter description..."
                  required
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={addForm.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAddForm({ ...addForm, amount: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100 ${formErrors.amount ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
                {formErrors.amount && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={addForm.type}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setAddForm({ ...addForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <div className="space-y-2">
                  <select
                    value={showCustomCategoryInput ? 'custom' : addForm.category}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleCategoryChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100 ${formErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="custom">+ Add Custom Category...</option>
                  </select>

                  {formErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                  )}

                  {showCustomCategoryInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomCategory(e.target.value)}
                        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            handleCustomCategoryAdd()
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                        placeholder="Enter custom category..."
                      />
                      <button
                        onClick={handleCustomCategoryAdd}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setAddForm({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: '',
                    type: 'expense',
                    category: ''
                  })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
