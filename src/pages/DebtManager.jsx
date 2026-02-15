import React, { useState, useEffect } from 'react'
import { Plus, Eye, Edit2, Trash2, X, TrendingUp, TrendingDown, DollarSign, Calendar, User, CreditCard, Banknote, Calculator, ChevronRight, Clock } from 'lucide-react'
import { api } from '../api'

const DebtManager = () => {
  const [debts, setDebts] = useState([])
  const [summary, setSummary] = useState({
    totalOutstandingDebt: 0,
    totalInterestAccrued: 0,
    totalPaidSoFar: 0,
    activeDebtsCount: 0,
    totalDebtsCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState(null)
  const [editingDebt, setEditingDebt] = useState(null)
  const [formData, setFormData] = useState({
    lenderName: '',
    debtType: 'personal',
    principalAmount: '',
    startDate: '',
    tenure: '',
    interestType: 'none',
    interestRate: '',
    compoundFrequency: 'yearly',
    notes: '',
    status: 'active'
  })
  const [paymentFormData, setPaymentFormData] = useState({
    paymentDate: '',
    amountPaid: '',
    paymentMode: 'cash',
    notes: ''
  })

  useEffect(() => {
    fetchDebts()
  }, [])

  const fetchDebts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/debts')
      setDebts(response.data.debts)
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Error fetching debts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        principalAmount: Number(formData.principalAmount),
        tenure: formData.tenure === '' ? undefined : Number(formData.tenure),
        interestRate: formData.interestType === 'none' ? 0 : Number(formData.interestRate)
      }

      if (!Number.isFinite(payload.principalAmount) || payload.principalAmount < 0) {
        throw new Error('Principal amount must be a valid number')
      }

      if (payload.tenure !== undefined && !Number.isFinite(payload.tenure)) {
        delete payload.tenure
      }

      if (payload.interestType !== 'none' && (!Number.isFinite(payload.interestRate) || payload.interestRate <= 0)) {
        throw new Error('Interest rate must be greater than 0')
      }

      if (payload.interestType !== 'compound') {
        delete payload.compoundFrequency
      }

      if (editingDebt) {
        await api.patch(`/api/debts/${editingDebt._id}`, payload)
      } else {
        await api.post('/api/debts', payload)
      }
      
      await fetchDebts()
      setShowModal(false)
      setEditingDebt(null)
      resetForm()
    } catch (error) {
      console.error('Error saving debt:', error?.response?.data?.error || error.message || error)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...paymentFormData,
        amountPaid: Number(paymentFormData.amountPaid)
      }

      if (!Number.isFinite(payload.amountPaid) || payload.amountPaid <= 0) {
        throw new Error('Amount paid must be a valid number greater than 0')
      }

      await api.post(`/api/debts/${selectedDebt._id}/payments`, payload)
      
      await fetchDebts()
      setShowPaymentModal(false)
      setSelectedDebt(null)
      resetPaymentForm()
    } catch (error) {
      console.error('Error adding payment:', error?.response?.data?.error || error.message || error)
    }
  }

  const handleEdit = (debt) => {
    setEditingDebt(debt)
    setFormData({
      lenderName: debt.lenderName,
      debtType: debt.debtType,
      principalAmount: String(debt.principalAmount),
      startDate: debt.startDate.split('T')[0],
      tenure: debt.tenure ? String(debt.tenure) : '',
      interestType: debt.interestType,
      interestRate: debt.interestRate ? String(debt.interestRate) : '',
      compoundFrequency: debt.compoundFrequency,
      notes: debt.notes || '',
      status: debt.status
    })
    setShowModal(true)
  }

  const handleDelete = async (debtId) => {
    if (window.confirm('Are you sure you want to delete this debt? This will also delete all associated payments.')) {
      try {
        await api.delete(`/api/debts/${debtId}`)
        await fetchDebts()
      } catch (error) {
        console.error('Error deleting debt:', error)
      }
    }
  }

  const handleCloseDebt = async (debtId) => {
    if (window.confirm('Are you sure you want to close this debt?')) {
      try {
        await api.patch(`/api/debts/${debtId}/close`)
        await fetchDebts()
      } catch (error) {
        console.error('Error closing debt:', error)
      }
    }
  }

  const handleViewDetail = async (debt) => {
    try {
      const response = await api.get(`/api/debts/${debt._id}`)
      setSelectedDebt(response.data)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Error fetching debt details:', error)
    }
  }

  const handleAddPayment = (debt) => {
    setSelectedDebt(debt)
    setPaymentFormData({
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: '',
      paymentMode: 'cash',
      notes: ''
    })
    setShowPaymentModal(true)
  }

  const resetForm = () => {
    setFormData({
      lenderName: '',
      debtType: 'personal',
      principalAmount: '',
      startDate: '',
      tenure: '',
      interestType: 'none',
      interestRate: '',
      compoundFrequency: 'yearly',
      notes: '',
      status: 'active'
    })
  }

  const resetPaymentForm = () => {
    setPaymentFormData({
      paymentDate: '',
      amountPaid: '',
      paymentMode: 'cash',
      notes: ''
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getDebtTypeIcon = (type) => {
    switch (type) {
      case 'bank': return <Banknote className="h-4 w-4" />
      case 'personal': return <User className="h-4 w-4" />
      case 'informal': return <CreditCard className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Debt Manager</h1>
          <button
            onClick={() => {
              resetForm()
              setEditingDebt(null)
              setShowModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Debt</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalOutstandingDebt)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interest Accrued</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(summary.totalInterestAccrued)}</p>
              </div>
              <Calculator className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.totalPaidSoFar)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Debts</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.activeDebtsCount}/{summary.totalDebtsCount}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Debt List */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Debt List</h2>
            
            {debts.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No debts recorded yet</p>
                <button
                  onClick={() => {
                    resetForm()
                    setEditingDebt(null)
                    setShowModal(true)
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Your First Debt
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {debts.map((debt) => (
                  <div key={debt._id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getDebtTypeIcon(debt.debtType)}
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{debt.lenderName}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(debt.status)}`}>
                            {debt.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Principal</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(debt.principalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Outstanding</p>
                            <p className="font-medium text-red-600 dark:text-red-400">{formatCurrency(debt.outstandingBalance)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Interest</p>
                            <p className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(debt.interestAccrued)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Start Date</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(debt.startDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleViewDetail(debt)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={() => handleAddPayment(debt)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Add Payment"
                          disabled={debt.status === 'closed'}
                        >
                          <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={() => handleEdit(debt)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        {debt.status === 'active' && (
                          <button
                            onClick={() => handleCloseDebt(debt._id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Close Debt"
                          >
                            <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(debt._id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Debt Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingDebt ? 'Edit Debt' : 'Add New Debt'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lender Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lenderName}
                      onChange={(e) => setFormData({...formData, lenderName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Debt Type *
                    </label>
                    <select
                      value={formData.debtType}
                      onChange={(e) => setFormData({...formData, debtType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    >
                      <option value="personal">Personal</option>
                      <option value="bank">Bank</option>
                      <option value="informal">Informal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Principal Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.principalAmount}
                      onChange={(e) => setFormData({...formData, principalAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tenure (months)
                    </label>
                    <input
                      type="number"
                      value={formData.tenure}
                      onChange={(e) => setFormData({...formData, tenure: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interest Type *
                    </label>
                    <select
                      value={formData.interestType}
                      onChange={(e) => setFormData({...formData, interestType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    >
                      <option value="none">No Interest</option>
                      <option value="simple">Simple Interest</option>
                      <option value="compound">Compound Interest</option>
                    </select>
                  </div>
                  
                  {formData.interestType !== 'none' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Interest Rate (%) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.interestRate}
                          onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                          required
                        />
                      </div>
                      
                      {formData.interestType === 'compound' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Compound Frequency *
                          </label>
                          <select
                            value={formData.compoundFrequency}
                            onChange={(e) => setFormData({...formData, compoundFrequency: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                      rows="3"
                      placeholder="Optional notes about this debt"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingDebt ? 'Update Debt' : 'Add Debt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showPaymentModal && selectedDebt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Add Payment - {selectedDebt.lenderName}
                </h2>
              </div>
              
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.paymentDate}
                    onChange={(e) => setPaymentFormData({...paymentFormData, paymentDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount Paid *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentFormData.amountPaid}
                    onChange={(e) => setPaymentFormData({...paymentFormData, amountPaid: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentFormData.paymentMode}
                    onChange={(e) => setPaymentFormData({...paymentFormData, paymentMode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                  >
                    <option value="cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={paymentFormData.notes}
                    onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-100"
                    rows="3"
                    placeholder="Optional notes about this payment"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Debt Detail Modal */}
        {showDetailModal && selectedDebt && (
          <DebtDetailModal 
            debt={selectedDebt} 
            onClose={() => setShowDetailModal(false)}
            onEdit={() => {
              handleEdit(selectedDebt)
              setShowDetailModal(false)
            }}
            onAddPayment={() => {
              handleAddPayment(selectedDebt)
              setShowDetailModal(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Debt Detail Modal Component
const DebtDetailModal = ({ debt, onClose, onEdit, onAddPayment }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{debt.lenderName}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Principal Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(debt.principalAmount)}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Balance</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(debt.outstandingBalance)}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Interest Accrued</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(debt.interestAccrued)}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(debt.totalPaid)}</p>
            </div>
          </div>

          {/* Debt Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Debt Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{debt.debtType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(debt.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interest Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{debt.interestType}</p>
              </div>
              {debt.interestType !== 'none' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{debt.interestRate}% per year</p>
                  </div>
                  {debt.interestType === 'compound' && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Compound Frequency</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{debt.compoundFrequency}</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  debt.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {debt.status}
                </span>
              </div>
              {debt.tenure && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tenure</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{debt.tenure} months</p>
                </div>
              )}
            </div>
            {debt.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{debt.notes}</p>
              </div>
            )}
          </div>

          {/* Calculation Explanation */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Interest Calculation</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">{debt.calculationExplanation}</p>
            </div>
          </div>

          {/* Predictor Card */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Future Projection</h3>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100">If this continues for the next 2 years...</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Projected Interest</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(debt.projectedInterest2Years)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Projected Total</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(debt.projectedOutstanding2Years)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment History</h3>
            {debt.payments && debt.payments.length > 0 ? (
              <div className="space-y-2">
                {debt.payments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(payment.amountPaid)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMode}</p>
                      {payment.notes && <p className="text-sm text-gray-500 dark:text-gray-400">{payment.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No payments made yet</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Edit Debt
            </button>
            {debt.status === 'active' && (
              <button
                onClick={onAddPayment}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebtManager
