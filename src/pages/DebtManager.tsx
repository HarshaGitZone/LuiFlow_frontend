import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, Target } from 'lucide-react'
import { api } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'

interface Debt {
  _id: string
  lenderName: string
  debtType: 'personal' | 'bank' | 'informal'
  principalAmount: number
  startDate: string
  tenure?: number
  interestType: 'none' | 'simple' | 'compound'
  interestRate: number
  compoundFrequency?: 'monthly' | 'quarterly' | 'yearly'
  notes?: string
  status: 'active' | 'closed'
  closedDate?: string
  createdAt: string
  updatedAt: string
}

interface DebtFormData {
  lenderName: string
  debtType: 'personal' | 'bank' | 'informal'
  principalAmount: number
  startDate: string
  tenure?: number
  interestType: 'none' | 'simple' | 'compound'
  interestRate?: number
  compoundFrequency?: 'monthly' | 'quarterly' | 'yearly'
  notes?: string
}

const DebtManager: React.FC = () => {
  const { formatAmount } = useCurrency()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null)
  const [formData, setFormData] = useState<DebtFormData>({
    lenderName: '',
    debtType: 'personal',
    principalAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    interestType: 'none',
    interestRate: 0,
    compoundFrequency: 'yearly',
    notes: ''
  })

  useEffect(() => {
    fetchDebts()
  }, [])

  const fetchDebts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/debts')
      setDebts(Array.isArray(response.data) ? response.data : response.data?.debts || [])
    } catch (error) {
      console.error('Failed to fetch debts:', error)
      setDebts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/debts', formData)
      setShowAddModal(false)
      setFormData({
        lenderName: '',
        debtType: 'personal',
        principalAmount: 0,
        startDate: new Date().toISOString().split('T')[0],
        interestType: 'none',
        interestRate: 0,
        compoundFrequency: 'yearly',
        notes: ''
      })
      fetchDebts()
    } catch (error) {
      console.error('Failed to add debt:', error)
    }
  }

  const handleEditClick = (debt: Debt) => {
    setEditingDebt(debt)
    setFormData({
      lenderName: debt.lenderName,
      debtType: debt.debtType,
      principalAmount: debt.principalAmount,
      startDate: debt.startDate.split('T')[0],
      tenure: debt.tenure,
      interestType: debt.interestType,
      interestRate: debt.interestRate,
      compoundFrequency: debt.compoundFrequency,
      notes: debt.notes
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDebt) return

    try {
      await api.put(`/api/debts/${editingDebt._id}`, formData)
      setShowEditModal(false)
      setEditingDebt(null)
      fetchDebts()
    } catch (error) {
      console.error('Failed to update debt:', error)
    }
  }

  const handleDeleteClick = (debt: Debt) => {
    setDeletingDebt(debt)
    setShowDeleteModal(true)
  }

  const handleDeleteSubmit = async () => {
    if (!deletingDebt) return

    try {
      await api.delete(`/api/debts/${deletingDebt._id}`)
      setShowDeleteModal(false)
      setDeletingDebt(null)
      fetchDebts()
    } catch (error) {
      console.error('Failed to delete debt:', error)
    }
  }

  const calculateTotalDebt = (): number => {
    return Array.isArray(debts) ? debts.reduce((sum, debt) => sum + (debt?.principalAmount || 0), 0) : 0
  }

  const getDebtTypeIcon = (type: Debt['debtType']): string => {
    switch (type) {
      case 'personal':
        return '👤'
      case 'bank':
        return '🏦'
      case 'informal':
        return '🤝'
      default:
        return '📄'
    }
  }

  const getDebtTypeLabel = (type: Debt['debtType']): string => {
    switch (type) {
      case 'personal':
        return 'Personal Loan'
      case 'bank':
        return 'Bank Loan'
      case 'informal':
        return 'Informal Loan'
      default:
        return 'Other'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Debt Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your debts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Debt
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Debt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatAmount(calculateTotalDebt())}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Debts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {debts.filter(debt => debt.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed Debts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {debts.filter(debt => debt.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Debts</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-light mx-auto"></div>
          </div>
        ) : debts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No debts found. Add your first debt to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {debts.map((debt) => (
              <div key={debt._id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getDebtTypeIcon(debt.debtType)}</div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {debt.lenderName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getDebtTypeLabel(debt.debtType)} • {debt.interestType} interest
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Started: {new Date(debt.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatAmount(debt.principalAmount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {debt.interestRate}% interest
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEditClick(debt)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(debt)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Debt</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lender Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lenderName}
                  onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Debt Type
                </label>
                <select
                  value={formData.debtType}
                  onChange={(e) => setFormData({ ...formData, debtType: e.target.value as Debt['debtType'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="personal">Personal Loan</option>
                  <option value="bank">Bank Loan</option>
                  <option value="informal">Informal Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Principal Amount
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interest Type
                </label>
                <select
                  value={formData.interestType}
                  onChange={(e) => setFormData({ ...formData, interestType: e.target.value as Debt['interestType'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="none">No Interest</option>
                  <option value="simple">Simple Interest</option>
                  <option value="compound">Compound Interest</option>
                </select>
              </div>

              {formData.interestType !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary"
                >
                  Add Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Debt Modal */}
      {showEditModal && editingDebt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Debt</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lender Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lenderName}
                  onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Debt Type
                </label>
                <select
                  value={formData.debtType}
                  onChange={(e) => setFormData({ ...formData, debtType: e.target.value as Debt['debtType'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="personal">Personal Loan</option>
                  <option value="bank">Bank Loan</option>
                  <option value="informal">Informal Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Principal Amount
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interest Type
                </label>
                <select
                  value={formData.interestType}
                  onChange={(e) => setFormData({ ...formData, interestType: e.target.value as Debt['interestType'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="none">No Interest</option>
                  <option value="simple">Simple Interest</option>
                  <option value="compound">Compound Interest</option>
                </select>
              </div>

              {formData.interestType !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary"
                >
                  Update Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingDebt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delete Debt</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the debt from "{deletingDebt.lenderName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DebtManager
