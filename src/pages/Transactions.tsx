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

type DateFilterMode = 'single' | 'range'

const Transactions: React.FC = () => {
  const { formatAmountWithSign } = useCurrency()
  const { formatDate } = useDateFormatter()
  const [searchParams, setSearchParams] = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '')
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || '')
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || '')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>(searchParams.get('singleDate') ? 'single' : 'range')
  const [singleDate, setSingleDate] = useState<string>(searchParams.get('singleDate') || '')
  const [startDate, setStartDate] = useState<string>(searchParams.get('startDate') || '')
  const [endDate, setEndDate] = useState<string>(searchParams.get('endDate') || '')
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

  const getDateQueryParams = () => {
    if (dateFilterMode === 'single' && singleDate) {
      return { startDate: singleDate, endDate: singleDate }
    }

    if (startDate && endDate && startDate > endDate) {
      return {}
    }

    return {
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    }
  }

  const clearDateFilters = () => {
    setSingleDate('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(typeFilter && { type: typeFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...getDateQueryParams()
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
  }, [currentPage, typeFilter, categoryFilter, searchTerm, dateFilterMode, singleDate, startDate, endDate])

  useEffect(() => {
    const nextSearch = searchParams.get('search') || ''
    const nextType = searchParams.get('type') || ''
    const nextCategory = searchParams.get('category') || ''
    const nextSingleDate = searchParams.get('singleDate') || ''
    const nextStartDate = searchParams.get('startDate') || ''
    const nextEndDate = searchParams.get('endDate') || ''
    const nextDateMode: DateFilterMode = nextSingleDate ? 'single' : 'range'

    if (
      nextSearch !== searchTerm ||
      nextType !== typeFilter ||
      nextCategory !== categoryFilter ||
      nextSingleDate !== singleDate ||
      nextStartDate !== startDate ||
      nextEndDate !== endDate ||
      nextDateMode !== dateFilterMode
    ) {
      setSearchTerm(nextSearch)
      setTypeFilter(nextType)
      setCategoryFilter(nextCategory)
      setSingleDate(nextSingleDate)
      setStartDate(nextStartDate)
      setEndDate(nextEndDate)
      setDateFilterMode(nextDateMode)
      setCurrentPage(1)
    }
  }, [searchParams])

  useEffect(() => {
    if (dateFilterMode === 'single') {
      setStartDate('')
      setEndDate('')
    } else {
      setSingleDate('')
    }
  }, [dateFilterMode])

  useEffect(() => {
    const handleTransactionUpdated = () => {
      fetchTransactions()
    }

    window.addEventListener('transaction-updated', handleTransactionUpdated)
    return () => {
      window.removeEventListener('transaction-updated', handleTransactionUpdated)
    }
  }, [currentPage, typeFilter, categoryFilter, searchTerm, dateFilterMode, singleDate, startDate, endDate])

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const nextSearch = e.target.value
                  setSearchTerm(nextSearch)
                  setCurrentPage(1)
                  const nextParams = new URLSearchParams(searchParams)
                  if (nextSearch.trim()) nextParams.set('search', nextSearch.trim())
                  else nextParams.delete('search')
                  setSearchParams(nextParams)
                }}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={typeFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`w-full sm:w-auto px-4 py-2 border rounded-lg flex items-center justify-center ${showFilters
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setDateFilterMode('single')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${dateFilterMode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300'
                  }`}
              >
                Single Date
              </button>
              <button
                onClick={() => {
                  setDateFilterMode('range')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${dateFilterMode === 'range'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300'
                  }`}
              >
                Date Range
              </button>
            </div>

            {dateFilterMode === 'single' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select date</label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setSingleDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <button
                  onClick={clearDateFilters}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-900"
                >
                  Clear Date
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setStartDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setEndDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <button
                  onClick={clearDateFilters}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-900"
                >
                  Clear Range
                </button>
              </div>
            )}

            {dateFilterMode === 'range' && startDate && endDate && startDate > endDate && (
              <p className="text-sm text-red-600 dark:text-red-400">Start date must be before end date.</p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 hidden md:table">
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
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
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

              {/* Mobile View: Cards */}
              <div className="md:hidden space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction._id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${transaction.type === 'income'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                        >
                          {transaction.type}
                        </span>
                      </div>

                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {transaction.description}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300">
                          {transaction.category}
                        </span>
                      </div>

                      <div className="flex justify-between items-end border-t border-gray-100 dark:border-slate-700 pt-3">
                        <div
                          className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}
                        >
                          {formatAmountWithSign(transaction.amount, transaction.type)}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No transactions found
                  </div>
                )}
              </div>
            </div>

            {transactions.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 rounded-b-lg gap-3">
                <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                  Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, totalResults)}</span> of{' '}
                  <span className="font-medium">{totalResults}</span> results
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  setFormErrors({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
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
