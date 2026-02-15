import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, X, AlertCircle, PiggyBank, TrendingUp, Target, Wallet, ArrowUpRight, Calendar, PieChart } from 'lucide-react'
import { api } from '../api'

const INITIAL_FORM = {
  name: '',
  amount: '',
  spent: '',
  category: '',
  period: 'Monthly'
}

const Budgets = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [addForm, setAddForm] = useState(INITIAL_FORM)
  const [editForm, setEditForm] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/budgets')
      setBudgets(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
      setBudgets([])
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (formData) => {
    const errors = {}
    if (!formData.name?.trim()) errors.name = 'Budget name is required'
    if (!formData.category?.trim()) errors.category = 'Category is required'
    if (!formData.period?.trim()) errors.period = 'Period is required'

    const amount = Number(formData.amount)
    if (!amount || amount <= 0) errors.amount = 'Amount must be greater than 0'

    const spent = Number(formData.spent || 0)
    if (spent < 0) errors.spent = 'Spent cannot be negative'
    if (amount > 0 && spent > amount) errors.spent = 'Spent cannot exceed amount'
    return errors
  }

  const getStatus = (spent, amount) => {
    if (!amount || amount <= 0) return 'under'
    const percentage = (spent / amount) * 100
    if (percentage > 100) return 'over'
    if (percentage >= 75) return 'on-track'
    return 'under'
  }

  const getStatusColor = (status) => {
    if (status === 'over') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
    if (status === 'on-track') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
  }

  const getStatusLabel = (status) => {
    if (status === 'over') return 'Over Budget'
    if (status === 'on-track') return 'Near Limit'
    return 'On Track'
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(amount) || 0)

  const overview = useMemo(() => {
    const totalBudget = budgets.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    const totalSpent = budgets.reduce((sum, item) => sum + (Number(item.spent) || 0), 0)
    const totalRemaining = totalBudget - totalSpent
    const usedPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    return { totalBudget, totalSpent, totalRemaining, usedPercent }
  }, [budgets])

  const handleAdd = async () => {
    const errors = validateForm(addForm)
    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    try {
      await api.post('/api/budgets', {
        name: addForm.name.trim(),
        amount: Number(addForm.amount),
        spent: Number(addForm.spent || 0),
        category: addForm.category.trim(),
        period: addForm.period.trim()
      })
      setShowAddModal(false)
      setAddForm(INITIAL_FORM)
      setFormErrors({})
      await fetchBudgets()
    } catch (error) {
      console.error('Error adding budget:', error)
      setFormErrors({ general: 'Failed to add budget. Please try again.' })
    }
  }

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget)
    setEditForm({
      name: budget.name || '',
      amount: String(budget.amount ?? ''),
      spent: String(budget.spent ?? 0),
      category: budget.category || '',
      period: budget.period || 'Monthly'
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    const errors = validateForm(editForm)
    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    try {
      await api.put(`/api/budgets/${editingBudget._id}`, {
        name: editForm.name.trim(),
        amount: Number(editForm.amount),
        spent: Number(editForm.spent || 0),
        category: editForm.category.trim(),
        period: editForm.period.trim()
      })
      setShowEditModal(false)
      setEditingBudget(null)
      setEditForm(INITIAL_FORM)
      setFormErrors({})
      await fetchBudgets()
    } catch (error) {
      console.error('Error updating budget:', error)
      setFormErrors({ general: 'Failed to update budget. Please try again.' })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return
    try {
      await api.delete(`/api/budgets/${id}`)
      await fetchBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
      alert('Failed to delete budget. Please try again.')
    }
  }

  const renderModal = (isEdit = false) => {
    const form = isEdit ? editForm : addForm
    const setForm = isEdit ? setEditForm : setAddForm
    const onSubmit = isEdit ? handleUpdate : handleAdd
    const onClose = () => {
      if (isEdit) {
        setShowEditModal(false)
        setEditingBudget(null)
        setEditForm(INITIAL_FORM)
      } else {
        setShowAddModal(false)
        setAddForm(INITIAL_FORM)
      }
      setFormErrors({})
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in backdrop-blur-sm bg-slate-900/50">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Budget' : 'Create New Budget'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEdit ? 'Update your budget details below' : 'Set up a new budget plan for your expenses'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto custom-scrollbar">
            {formErrors.general && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{formErrors.general}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Budget Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="e.g., Monthly Groceries"
                  />
                  <Wallet className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {formErrors.name && <p className="text-xs text-red-600 mt-1.5 ml-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Total Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-medium">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-700 pl-8 pr-4 py-3 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.amount && <p className="text-xs text-red-600 mt-1.5 ml-1">{formErrors.amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Already Spent
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-medium">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={form.spent}
                      onChange={(e) => setForm((prev) => ({ ...prev, spent: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-700 pl-8 pr-4 py-3 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.spent && <p className="text-xs text-red-600 mt-1.5 ml-1">{formErrors.spent}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="e.g., Food, Travel"
                    />
                    <PieChart className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {formErrors.category && <p className="text-xs text-red-600 mt-1.5 ml-1">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Period
                  </label>
                  <div className="relative">
                    <select
                      value={form.period}
                      onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                    >
                      <option>Monthly</option>
                      <option>Weekly</option>
                      <option>Yearly</option>
                    </select>
                    <Calendar className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {formErrors.period && <p className="text-xs text-red-600 mt-1.5 ml-1">{formErrors.period}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sticky bottom-0 z-10">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transform hover:-translate-y-0.5"
            >
              {isEdit ? 'Save Changes' : 'Create Budget'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Budget Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track, manage and optimize your spending</p>
          </div>
          <button
            onClick={() => {
              setFormErrors({})
              setShowAddModal(true)
            }}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-medium group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            Create New Budget
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg">
                Total
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(overview.totalBudget)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg">
                Spent
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(overview.totalSpent)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg">
                Remaining
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Remaining</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(overview.totalRemaining)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg">
                Usage
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget Usage</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {overview.usedPercent}%
                </h3>
                <span className="text-sm text-gray-400 mb-1">used</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(overview.usedPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budgets Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Budgets</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{budgets.length} budget{budgets.length !== 1 && 's'} active</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700">
              <div className="mx-auto h-20 w-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                <Wallet className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No budgets found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
                Start by creating your first budget to track your expenses and save money.
              </p>
              <button
                onClick={() => {
                  setFormErrors({})
                  setShowAddModal(true)
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {budgets.map((budget) => {
                const amount = Number(budget.amount) || 0
                const spent = Number(budget.spent) || 0
                const remaining = amount - spent
                const progress = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0
                const status = budget.status || getStatus(spent, amount)
                const statusColorClass = getStatusColor(status)

                return (
                  <div
                    key={budget._id}
                    className="group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Decorative gradient background */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all" />

                    <div className="relative">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${statusColorClass} mb-3`}>
                            {getStatusLabel(status)}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {budget.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="font-medium">{budget.category}</span>
                            <span className="mx-2">•</span>
                            <span>{budget.period}</span>
                          </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => handleOpenEdit(budget)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget._id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Spent</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(spent)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Limit</p>
                            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                              {formatCurrency(amount)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-medium mb-2">
                            <span className={`${progress >= 100 ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
                              {progress}% Used
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {formatCurrency(remaining)} left
                            </span>
                          </div>
                          <div className="h-3 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${progress >= 100
                                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                                  : progress >= 75
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                                }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showAddModal && renderModal(false)}
      {showEditModal && renderModal(true)}
    </div>
  )
}

export default Budgets
