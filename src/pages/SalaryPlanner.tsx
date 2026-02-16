import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Target, Calculator, Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import { api } from '../api'
import API from '../api'
import { useCurrency } from '../contexts/CurrencyContext'

interface SalaryGoal {
  _id: string
  title: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  targetDate: string
  createdAt: string
  updatedAt: string
}

interface SalaryFormData {
  title: string
  targetAmount: number
  monthlyContribution: number
  targetDate: string
}

const SalaryPlanner: React.FC = () => {
  const { formatAmount } = useCurrency()
  const [goals, setGoals] = useState<SalaryGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SalaryGoal | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<SalaryGoal | null>(null)
  const [formData, setFormData] = useState<SalaryFormData>({
    title: '',
    targetAmount: 0,
    monthlyContribution: 0,
    targetDate: ''
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/salary-goals')
      setGoals(response.data || [])
    } catch (error) {
      console.error('Failed to fetch salary goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/salary-goals', formData)
      setShowAddModal(false)
      setFormData({
        title: '',
        targetAmount: 0,
        monthlyContribution: 0,
        targetDate: ''
      })
      fetchGoals()
    } catch (error) {
      console.error('Failed to add salary goal:', error)
    }
  }

  const handleEdit = (goal: SalaryGoal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount,
      monthlyContribution: goal.monthlyContribution,
      targetDate: goal.targetDate
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGoal) return

    try {
      await api.put(`/api/salary-goals/${editingGoal._id}`, formData)
      setShowEditModal(false)
      setEditingGoal(null)
      setFormData({
        title: '',
        targetAmount: 0,
        monthlyContribution: 0,
        targetDate: ''
      })
      fetchGoals()
    } catch (error) {
      console.error('Failed to update salary goal:', error)
    }
  }

  const handleDelete = (goal: SalaryGoal) => {
    setDeletingGoal(goal)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return

    try {
      await api.delete(`/api/salary-goals/${deletingGoal._id}`)
      setShowDeleteModal(false)
      setDeletingGoal(null)
      fetchGoals()
    } catch (error) {
      console.error('Failed to delete salary goal:', error)
    }
  }

  const calculateProgress = (goal: SalaryGoal): number => {
    return goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
  }

  const calculateMonthsRemaining = (targetDate: string): number => {
    const target = new Date(targetDate)
    const now = new Date()
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
    return Math.max(0, months)
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  const getProjectedAmount = (goal: SalaryGoal): number => {
    const monthsRemaining = calculateMonthsRemaining(goal.targetDate)
    return goal.currentAmount + (goal.monthlyContribution * monthsRemaining)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Planner</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan and track your financial goals</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-md p-3">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Goals</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {goals.length}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Target</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatAmount(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Saved</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatAmount(goals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Goal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monthly
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Target Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {goals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No salary goals found
                  </td>
                </tr>
              ) : (
                goals.map((goal) => {
                  const progress = calculateProgress(goal)
                  const monthsRemaining = calculateMonthsRemaining(goal.targetDate)
                  const projectedAmount = getProjectedAmount(goal)
                  const projectedProgress = goal.targetAmount > 0 ? (projectedAmount / goal.targetAmount) * 100 : 0

                  return (
                    <tr key={goal._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {new Date(goal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatAmount(goal.targetAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <p>{formatAmount(goal.currentAmount)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Projected: {formatAmount(projectedAmount)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatAmount(goal.monthlyContribution)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(progress)}`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Projected: {projectedProgress.toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <p>{new Date(goal.targetDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {monthsRemaining} months remaining
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
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
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Add Salary Goal</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Title</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            placeholder="e.g., Emergency Fund, Vacation, New Car"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.targetAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Contribution</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.monthlyContribution}
                            onChange={(e) => setFormData(prev => ({ ...prev, monthlyContribution: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Date</label>
                          <input
                            type="date"
                            value={formData.targetDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            min={new Date().toISOString().split('T')[0]}
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
                    Add Goal
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

      {/* Edit Goal Modal */}
      {showEditModal && editingGoal && (
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
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Edit Salary Goal</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Title</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.targetAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Contribution</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.monthlyContribution}
                            onChange={(e) => setFormData(prev => ({ ...prev, monthlyContribution: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Date</label>
                          <input
                            type="date"
                            value={formData.targetDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            min={new Date().toISOString().split('T')[0]}
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

      {/* Delete Goal Modal */}
      {showDeleteModal && deletingGoal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Salary Goal</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this salary goal? This action cannot be undone.
                      </p>
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{deletingGoal.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Target: {formatAmount(deletingGoal.targetAmount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Current: {formatAmount(deletingGoal.currentAmount)}
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

export default SalaryPlanner
