import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { api } from '../api'
import API from '../api'
import { useCurrency } from '../contexts/CurrencyContext'

interface Transaction {
  _id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  tags?: string[]
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

interface CalendarDay {
  date: Date
  transactions: Transaction[]
  income: number
  expenses: number
  isToday: boolean
  isCurrentMonth: boolean
}

const Calendar: React.FC = () => {
  const { formatAmount, formatAmountWithSign } = useCurrency()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState<Partial<Transaction>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  useEffect(() => {
    fetchTransactions()
  }, [currentDate])

  const fetchTransactions = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)
      
      const response = await api.get(API.TRANSACTIONS, {
        params: {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        }
      })
      setTransactions(response.data.transactions)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const today = new Date()
    const days: CalendarDay[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), -firstDay + i + 1),
        transactions: [],
        income: 0,
        expenses: 0,
        isToday: false,
        isCurrentMonth: false
      })
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate.toDateString() === date.toDateString()
      })

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      days.push({
        date,
        transactions: dayTransactions,
        income,
        expenses,
        isToday: date.toDateString() === today.toDateString(),
        isCurrentMonth: true
      })
    }

    return days
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowAddModal(true)
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedDate(new Date(transaction.date))
    setFormData({
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description
    })
    setShowEditModal(true)
  }

  const handleTransactionClick = (transaction: Transaction) => {
    // Handle transaction click - could show details or open edit modal
    handleEditClick(transaction)
  }

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month)
    setCurrentDate(new Date(selectedYear, month, 1))
  }

  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    setCurrentDate(new Date(year, selectedMonth, 1))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return

    try {
      const transactionData = {
        ...formData,
        date: selectedDate.toISOString()
      }
      await api.post(API.TRANSACTIONS, transactionData)
      setShowAddModal(false)
      setSelectedDate(null)
      setFormData({})
      fetchTransactions()
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction) return

    try {
      await api.put(`${API.TRANSACTIONS}/${editingTransaction._id}`, formData)
      setShowEditModal(false)
      setEditingTransaction(null)
      setFormData({})
      fetchTransactions()
    } catch (error) {
      console.error('Failed to update transaction:', error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return

    try {
      await api.delete(`${API.TRANSACTIONS}/${deletingTransaction._id}`)
      setShowDeleteModal(false)
      setDeletingTransaction(null)
      fetchTransactions()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  const calendarDays = generateCalendarDays()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 bg-white dark:bg-slate-900 z-30' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isFullscreen ? 'fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4' : ''}`}>
        <div className={`${isFullscreen ? 'flex-1' : ''}`}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">View your transactions by date</p>
        </div>
        <div className={`flex items-center space-x-4 ${isFullscreen ? 'flex-1 justify-center' : ''}`}>
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {/* Manual Date Selection */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className={`flex items-center space-x-4 ${isFullscreen ? 'flex-1 justify-end' : ''}`}>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <X className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-40 bg-white dark:bg-slate-900 overflow-auto pt-20' : 'bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden'}`}>
        <div className={`grid grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700 ${isFullscreen ? 'sticky top-0 bg-gray-200 dark:bg-slate-700 z-10' : ''}`}>
          {weekDays.map(day => (
            <div key={day} className="bg-gray-50 dark:bg-slate-900 p-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>
        <div className={`grid grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700 ${isFullscreen ? 'min-h-screen' : ''}`}>
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
              className={`min-h-[100px] p-2 ${
                day.isCurrentMonth
                  ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer'
                  : 'bg-gray-50 dark:bg-slate-900'
              } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {day.date.getDate()}
              </div>
              {day.transactions.length > 0 && (
                <div className="space-y-1">
                  {day.transactions.slice(0, 2).map((transaction, tIndex) => (
                    <div
                      key={tIndex}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTransactionClick(transaction)
                      }}
                      className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    >
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {transaction.description}
                      </div>
                      <div className={`font-medium ${
                        transaction.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatAmountWithSign(transaction.amount, transaction.type)}
                      </div>
                    </div>
                  ))}
                  {day.transactions.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{day.transactions.length - 2} more
                    </div>
                  )}
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-200 dark:border-slate-600">
                    <span className="text-green-600 dark:text-green-400">
                      {formatAmount(day.income)}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      {formatAmount(day.expenses)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowAddModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddSubmit}>
                <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Add Transaction - {selectedDate.toLocaleDateString()}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <input
                            type="text"
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.amount || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                          <select
                            value={formData.type || 'expense'}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                          <input
                            type="text"
                            value={formData.category || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary dark:bg-primary-light text-base font-medium text-white hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowEditModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditSubmit}>
                <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Edit Transaction</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <input
                            type="text"
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.amount || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                          <select
                            value={formData.type || 'expense'}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                          <input
                            type="text"
                            value={formData.category || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary dark:bg-primary-light text-base font-medium text-white hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Transaction</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this transaction? This action cannot be undone.
                      </p>
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{deletingTransaction.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{deletingTransaction.category}</p>
                        <p className={`text-sm font-medium ${
                          deletingTransaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatAmountWithSign(deletingTransaction.amount, deletingTransaction.type)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 dark:bg-red-600 text-base font-medium text-white hover:bg-red-700 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
