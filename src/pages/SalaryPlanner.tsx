// // import React, { useState, useEffect } from 'react'
// // import { DollarSign, TrendingUp, Target, Plus, Edit2, Trash2 } from 'lucide-react'
// // import { api } from '../api'
// // import { useCurrency } from '../contexts/CurrencyContext'

// // interface SalaryGoal {
// //   _id: string
// //   title: string
// //   targetAmount: number
// //   currentAmount: number
// //   monthlyContribution: number
// //   targetDate: string
// //   createdAt: string
// //   updatedAt: string
// // }

// // interface SalaryFormData {
// //   title: string
// //   targetAmount: number
// //   monthlyContribution: number
// //   targetDate: string
// // }

// // const SalaryPlanner: React.FC = () => {
// //   const { formatAmount } = useCurrency()
// //   const [goals, setGoals] = useState<SalaryGoal[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [showAddModal, setShowAddModal] = useState(false)
// //   const [showEditModal, setShowEditModal] = useState(false)
// //   const [showDeleteModal, setShowDeleteModal] = useState(false)
// //   const [editingGoal, setEditingGoal] = useState<SalaryGoal | null>(null)
// //   const [deletingGoal, setDeletingGoal] = useState<SalaryGoal | null>(null)
// //   const [formData, setFormData] = useState<SalaryFormData>({
// //     title: '',
// //     targetAmount: 0,
// //     monthlyContribution: 0,
// //     targetDate: ''
// //   })

// //   useEffect(() => {
// //     fetchGoals()
// //   }, [])

// //   const fetchGoals = async () => {
// //     try {
// //       setLoading(true)
// //       const response = await api.get('/api/salary-goals')
// //       setGoals(response.data || [])
// //     } catch (error) {
// //       console.error('Failed to fetch salary goals:', error)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const handleAddSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     try {
// //       await api.post('/api/salary-goals', formData)
// //       setShowAddModal(false)
// //       setFormData({
// //         title: '',
// //         targetAmount: 0,
// //         monthlyContribution: 0,
// //         targetDate: ''
// //       })
// //       fetchGoals()
// //     } catch (error) {
// //       console.error('Failed to add salary goal:', error)
// //     }
// //   }

// //   const handleEdit = (goal: SalaryGoal) => {
// //     setEditingGoal(goal)
// //     setFormData({
// //       title: goal.title,
// //       targetAmount: goal.targetAmount,
// //       monthlyContribution: goal.monthlyContribution,
// //       targetDate: goal.targetDate
// //     })
// //     setShowEditModal(true)
// //   }

// //   const handleEditSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     if (!editingGoal) return

// //     try {
// //       await api.put(`/api/salary-goals/${editingGoal._id}`, formData)
// //       setShowEditModal(false)
// //       setEditingGoal(null)
// //       setFormData({
// //         title: '',
// //         targetAmount: 0,
// //         monthlyContribution: 0,
// //         targetDate: ''
// //       })
// //       fetchGoals()
// //     } catch (error) {
// //       console.error('Failed to update salary goal:', error)
// //     }
// //   }

// //   const handleDelete = (goal: SalaryGoal) => {
// //     setDeletingGoal(goal)
// //     setShowDeleteModal(true)
// //   }

// //   const handleDeleteConfirm = async () => {
// //     if (!deletingGoal) return

// //     try {
// //       await api.delete(`/api/salary-goals/${deletingGoal._id}`)
// //       setShowDeleteModal(false)
// //       setDeletingGoal(null)
// //       fetchGoals()
// //     } catch (error) {
// //       console.error('Failed to delete salary goal:', error)
// //     }
// //   }

// //   const calculateProgress = (goal: SalaryGoal): number => {
// //     return goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
// //   }

// //   const calculateMonthsRemaining = (targetDate: string): number => {
// //     const target = new Date(targetDate)
// //     const now = new Date()
// //     const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
// //     return Math.max(0, months)
// //   }

// //   const getProgressColor = (percentage: number): string => {
// //     if (percentage >= 100) return 'bg-green-500'
// //     if (percentage >= 75) return 'bg-blue-500'
// //     if (percentage >= 50) return 'bg-yellow-500'
// //     return 'bg-gray-300'
// //   }

// //   const getProjectedAmount = (goal: SalaryGoal): number => {
// //     const monthsRemaining = calculateMonthsRemaining(goal.targetDate)
// //     return goal.currentAmount + (goal.monthlyContribution * monthsRemaining)
// //   }

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center h-64">
// //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
// //         <div>
// //           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Planner</h1>
// //           <p className="text-gray-600 dark:text-gray-400">Plan and track your financial goals</p>
// //         </div>
// //         <div className="mt-4 sm:mt-0">
// //           <button
// //             onClick={() => setShowAddModal(true)}
// //             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary"
// //           >
// //             <Plus className="h-4 w-4 mr-2" />
// //             Add Goal
// //           </button>
// //         </div>
// //       </div>

// //       {/* Goals Summary */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
// //           <div className="flex items-center">
// //             <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-md p-3">
// //               <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
// //             </div>
// //             <div className="ml-5 w-0 flex-1">
// //               <dl>
// //                 <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Goals</dt>
// //                 <dd className="flex items-baseline">
// //                   <span className="text-2xl font-semibold text-gray-900 dark:text-white">
// //                     {goals.length}
// //                   </span>
// //                 </dd>
// //               </dl>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
// //           <div className="flex items-center">
// //             <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-md p-3">
// //               <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
// //             </div>
// //             <div className="ml-5 w-0 flex-1">
// //               <dl>
// //                 <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Target</dt>
// //                 <dd className="flex items-baseline">
// //                   <span className="text-2xl font-semibold text-gray-900 dark:text-white">
// //                     {formatAmount(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
// //                   </span>
// //                 </dd>
// //               </dl>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
// //           <div className="flex items-center">
// //             <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-md p-3">
// //               <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
// //             </div>
// //             <div className="ml-5 w-0 flex-1">
// //               <dl>
// //                 <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Saved</dt>
// //                 <dd className="flex items-baseline">
// //                   <span className="text-2xl font-semibold text-gray-900 dark:text-white">
// //                     {formatAmount(goals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
// //                   </span>
// //                 </dd>
// //               </dl>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Goals List */}
// //       <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
// //             <thead className="bg-gray-50 dark:bg-slate-900">
// //               <tr>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Goal
// //                 </th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Target
// //                 </th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Current
// //                 </th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Monthly
// //                 </th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Progress
// //                 </th>
// //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Target Date
// //                 </th>
// //                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
// //                   Actions
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
// //               {goals.length === 0 ? (
// //                 <tr>
// //                   <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
// //                     No salary goals found
// //                   </td>
// //                 </tr>
// //               ) : (
// //                 goals.map((goal) => {
// //                   const progress = calculateProgress(goal)
// //                   const monthsRemaining = calculateMonthsRemaining(goal.targetDate)
// //                   const projectedAmount = getProjectedAmount(goal)
// //                   const projectedProgress = goal.targetAmount > 0 ? (projectedAmount / goal.targetAmount) * 100 : 0

// //                   return (
// //                     <tr key={goal._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                         <div>
// //                           <p className="font-medium">{goal.title}</p>
// //                           <p className="text-xs text-gray-500 dark:text-gray-400">
// //                             Created: {new Date(goal.createdAt).toLocaleDateString()}
// //                           </p>
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                         {formatAmount(goal.targetAmount)}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                         <div>
// //                           <p>{formatAmount(goal.currentAmount)}</p>
// //                           <p className="text-xs text-gray-500 dark:text-gray-400">
// //                             Projected: {formatAmount(projectedAmount)}
// //                           </p>
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                         {formatAmount(goal.monthlyContribution)}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="space-y-2">
// //                           <div className="flex items-center">
// //                             <div className="flex-1">
// //                               <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
// //                                 <div
// //                                   className={`h-2 rounded-full ${getProgressColor(progress)}`}
// //                                   style={{ width: `${Math.min(progress, 100)}%` }}
// //                                 />
// //                               </div>
// //                             </div>
// //                             <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
// //                               {progress.toFixed(1)}%
// //                             </span>
// //                           </div>
// //                           <div className="text-xs text-gray-500 dark:text-gray-400">
// //                             Projected: {projectedProgress.toFixed(1)}%
// //                           </div>
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                         <div>
// //                           <p>{new Date(goal.targetDate).toLocaleDateString()}</p>
// //                           <p className="text-xs text-gray-500 dark:text-gray-400">
// //                             {monthsRemaining} months remaining
// //                           </p>
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
// //                         <button
// //                           onClick={() => handleEdit(goal)}
// //                           className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
// //                         >
// //                           <Edit2 className="h-4 w-4" />
// //                         </button>
// //                         <button
// //                           onClick={() => handleDelete(goal)}
// //                           className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
// //                         >
// //                           <Trash2 className="h-4 w-4" />
// //                         </button>
// //                       </td>
// //                     </tr>
// //                   )
// //                 })
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* Add Goal Modal */}
// //       {showAddModal && (
// //         <div className="fixed inset-0 z-50 overflow-y-auto">
// //           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
// //             <div className="fixed inset-0 transition-opacity" onClick={() => setShowAddModal(false)}>
// //               <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
// //             </div>
// //             <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
// //               <form onSubmit={handleAddSubmit}>
// //                 <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
// //                   <div className="sm:flex sm:items-start">
// //                     <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
// //                       <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Add Salary Goal</h3>
// //                       <div className="mt-4 space-y-4">
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Title</label>
// //                           <input
// //                             type="text"
// //                             value={formData.title}
// //                             onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             placeholder="e.g., Emergency Fund, Vacation, New Car"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount</label>
// //                           <input
// //                             type="number"
// //                             step="0.01"
// //                             value={formData.targetAmount}
// //                             onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Contribution</label>
// //                           <input
// //                             type="number"
// //                             step="0.01"
// //                             value={formData.monthlyContribution}
// //                             onChange={(e) => setFormData(prev => ({ ...prev, monthlyContribution: parseFloat(e.target.value) }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Date</label>
// //                           <input
// //                             type="date"
// //                             value={formData.targetDate}
// //                             onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             min={new Date().toISOString().split('T')[0]}
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
// //                     Add Goal
// //                   </button>
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowAddModal(false)}
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

// //       {/* Edit Goal Modal */}
// //       {showEditModal && editingGoal && (
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
// //                       <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Edit Salary Goal</h3>
// //                       <div className="mt-4 space-y-4">
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Title</label>
// //                           <input
// //                             type="text"
// //                             value={formData.title}
// //                             onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount</label>
// //                           <input
// //                             type="number"
// //                             step="0.01"
// //                             value={formData.targetAmount}
// //                             onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Contribution</label>
// //                           <input
// //                             type="number"
// //                             step="0.01"
// //                             value={formData.monthlyContribution}
// //                             onChange={(e) => setFormData(prev => ({ ...prev, monthlyContribution: parseFloat(e.target.value) }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Date</label>
// //                           <input
// //                             type="date"
// //                             value={formData.targetDate}
// //                             onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
// //                             className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
// //                             min={new Date().toISOString().split('T')[0]}
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

// //       {/* Delete Goal Modal */}
// //       {showDeleteModal && deletingGoal && (
// //         <div className="fixed inset-0 z-50 overflow-y-auto">
// //           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
// //             <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteModal(false)}>
// //               <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
// //             </div>
// //             <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
// //               <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
// //                 <div className="sm:flex sm:items-start">
// //                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
// //                     <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Salary Goal</h3>
// //                     <div className="mt-2">
// //                       <p className="text-sm text-gray-500 dark:text-gray-400">
// //                         Are you sure you want to delete this salary goal? This action cannot be undone.
// //                       </p>
// //                       <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
// //                         <p className="text-sm font-medium text-gray-900 dark:text-white">{deletingGoal.title}</p>
// //                         <p className="text-sm text-gray-500 dark:text-gray-400">
// //                           Target: {formatAmount(deletingGoal.targetAmount)}
// //                         </p>
// //                         <p className="text-sm text-gray-500 dark:text-gray-400">
// //                           Current: {formatAmount(deletingGoal.currentAmount)}
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

// // export default SalaryPlanner
// import React, { useEffect, useMemo, useState } from 'react'
// import { useAuth } from '../contexts/AuthContext'
// import { api } from '../api'
// import { useCurrency } from '../contexts/CurrencyContext'
// import {
//   DollarSign,
//   TrendingUp,
//   AlertTriangle,
//   Plus,
//   Edit2,
//   Trash2,
//   Check,
//   X,
//   Loader2,
//   CreditCard,
//   Bell,
//   Pause,
//   Play,
//   PiggyBank,
//   TrendingDown,
//   Award,
//   Flame
// } from 'lucide-react'
// import type { AxiosError } from 'axios'

// type BillStatus = 'paid' | 'unpaid'
// type SubscriptionStatus = 'active' | 'paused' | 'cancelled'

// type ActiveTab = 'overview' | 'bills' | 'subscriptions' | 'goals'

// interface Salary {
//   amount: number
//   creditDate: string // "01".."31"
//   month: string // "YYYY-MM"
// }

// interface FixedBill {
//   _id: string
//   name: string
//   amount: number
//   dueDate: string // "01".."31"
//   status: BillStatus
// }

// interface VariableExpenseCategory {
//   category: string
//   amount: number
// }

// interface VariableExpenses {
//   totalSpent: number
//   categories: VariableExpenseCategory[]
// }

// interface SavingsGoal {
//   _id: string
//   title: string
//   targetAmount: number
//   targetDate?: string
//   savedAmount: number
//   monthlyContribution?: number
//   status?: 'active' | 'completed'
// }

// interface Subscription {
//   _id: string
//   name: string
//   provider: string
//   monthlyCost: number
//   renewalDate: string // "01".."31"
//   category: string
//   status: SubscriptionStatus
// }

// interface SubscriptionWarning {
//   message: string
//   totalMonthlyCost?: number
//   threshold?: number
// }

// interface MonthlyHistoryItem {
//   month: string
//   saved: number
//   goalsCompleted: number
// }

// interface BestMonth {
//   month: string
//   saved: number
// }

// interface CumulativeSavings {
//   totalSaved: number
//   monthlyHistory: MonthlyHistoryItem[]
//   totalGoalsCompleted: number
//   averageMonthlySaving: number
//   bestMonth: BestMonth | null
//   currentStreak: number
//   totalMonths: number
// }

// interface SalaryPlannerData {
//   salary?: Salary
//   fixedBills?: FixedBill[]
//   variableExpenses?: VariableExpenses
//   savingsGoals?: SavingsGoal[]
//   subscriptions?: Subscription[]
// }

// interface SalaryPlannerResponse {
//   data: SalaryPlannerData
// }

// interface CumulativeSavingsResponse {
//   data: CumulativeSavings
// }

// interface SubscriptionSummaryResponse {
//   data: {
//     warning: SubscriptionWarning | null
//   }
// }

// const SalaryPlanner: React.FC = () => {
//   const { user } = useAuth()
//   const { formatAmount } = useCurrency()

//   // State
//   const [salary, setSalary] = useState<Salary>({
//     amount: 0,
//     creditDate: '01',
//     month: new Date().toISOString().slice(0, 7)
//   })

//   const [fixedBills, setFixedBills] = useState<FixedBill[]>([])
//   const [variableExpenses, setVariableExpenses] = useState<VariableExpenses>({
//     totalSpent: 0,
//     categories: []
//   })
//   const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
//   const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
//   const [subscriptionWarning, setSubscriptionWarning] = useState<SubscriptionWarning | null>(null)

//   const [cumulativeSavings, setCumulativeSavings] = useState<CumulativeSavings>({
//     totalSaved: 0,
//     monthlyHistory: [],
//     totalGoalsCompleted: 0,
//     averageMonthlySaving: 0,
//     bestMonth: null,
//     currentStreak: 0,
//     totalMonths: 0
//   })

//   const [manualSavings, setManualSavings] = useState<number>(0)

//   const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
//   const [showBillForm, setShowBillForm] = useState<boolean>(false)
//   const [showGoalForm, setShowGoalForm] = useState<boolean>(false)
//   const [showSubscriptionForm, setShowSubscriptionForm] = useState<boolean>(false)

//   const [editingBill, setEditingBill] = useState<FixedBill | null>(null)
//   const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
//   const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

//   const [loading, setLoading] = useState<boolean>(true)
//   const [saving, setSaving] = useState<boolean>(false)
//   const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().slice(0, 7))

//   // Helpers
//   const formatCurrency = (amount: number) => formatAmount(amount)

//   const getDaysLeftInMonth = (): number => {
//     const now = new Date()
//     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
//     return lastDay - now.getDate()
//   }

//   const calculateSafeDailySpending = (): number => {
//     const remainingAfterFixed =
//       salary.amount - fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount), 0)

//     const remainingAfterSubscriptions =
//       remainingAfterFixed -
//       subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' ? sub.monthlyCost : 0), 0)

//     const daysLeft = getDaysLeftInMonth()
//     return daysLeft > 0 ? Math.max(0, remainingAfterSubscriptions / daysLeft) : 0
//   }

//   const calculateProjectedOverspend = (): number => {
//     const safeDaily = calculateSafeDailySpending()
//     const projectedMonthly = safeDaily * getDaysLeftInMonth()
//     const currentSpending = variableExpenses.totalSpent || 0
//     return currentSpending > projectedMonthly ? currentSpending - projectedMonthly : 0
//   }

//   // API: Load cumulative savings
//   const loadCumulativeSavings = async (): Promise<void> => {
//     try {
//       const response = await api.get<CumulativeSavingsResponse>('/api/salary-planner/cumulative-savings')
//       setCumulativeSavings(response.data.data)
//     } catch (error) {
//       console.error('Error loading cumulative savings:', error)
//     }
//   }

//   // API: Subscription summary
//   const loadSubscriptionSummary = async (month = currentMonth): Promise<void> => {
//     try {
//       const response = await api.get<SubscriptionSummaryResponse>(
//         `/api/salary-planner/subscriptions?month=${month}&warningThreshold=1000`
//       )
//       setSubscriptionWarning(response.data.data.warning)
//     } catch (error) {
//       console.error('Error loading subscription summary:', error)
//     }
//   }

//   // API: Load planner
//   const loadSalaryPlanner = async (month = currentMonth): Promise<void> => {
//     try {
//       setLoading(true)

//       const response = await api.get<SalaryPlannerResponse>(`/api/salary-planner?month=${month}`)
//       const data = response.data.data

//       if (data) {
//         setSalary(data.salary || { amount: 0, creditDate: '01', month })
//         setFixedBills(data.fixedBills || [])
//         setVariableExpenses(data.variableExpenses || { totalSpent: 0, categories: [] })
//         setSavingsGoals(data.savingsGoals || [])
//         setSubscriptions(data.subscriptions || [])
//       }

//       await loadSubscriptionSummary(month)
//       await loadCumulativeSavings()
//     } catch (error) {
//       console.error('Error loading salary planner:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // API: Save planner (generic)
//   const saveSalaryPlanner = async (updates: Partial<SalaryPlannerData>): Promise<void> => {
//     try {
//       setSaving(true)
//       await api.put('/api/salary-planner', { month: currentMonth, updates })
//       await loadSalaryPlanner(currentMonth)
//     } catch (error) {
//       console.error('Error saving salary planner:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Update cumulative savings when goals/manual changes
//   const updateCumulativeSavings = async (): Promise<void> => {
//     try {
//       const currentMonthSaved =
//         savingsGoals.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0) + manualSavings

//       const goalsCompleted = savingsGoals.filter((goal) => goal.savedAmount >= goal.targetAmount).length

//       await api.put('/api/salary-planner/cumulative-savings', {
//         month: currentMonth,
//         saved: currentMonthSaved,
//         goalsCompleted
//       })

//       await loadCumulativeSavings()
//     } catch (error) {
//       console.error('Error updating cumulative savings:', error)
//     }
//   }

//   // Fixed bills
//   const handleBillSubmit = async (billData: Pick<FixedBill, 'name' | 'amount' | 'dueDate'>): Promise<void> => {
//     try {
//       setSaving(true)

//       if (editingBill) {
//         await api.put('/api/salary-planner/fixed-bill', {
//           month: currentMonth,
//           billId: editingBill._id,
//           updates: billData
//         })
//       } else {
//         await api.post('/api/salary-planner/fixed-bill', {
//           month: currentMonth,
//           bill: { ...billData, status: 'unpaid' as BillStatus }
//         })
//       }

//       await loadSalaryPlanner(currentMonth)
//       setEditingBill(null)
//       setShowBillForm(false)
//     } catch (error) {
//       console.error('Error saving bill:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const deleteBill = async (billId: string): Promise<void> => {
//     try {
//       setSaving(true)
//       await api.delete('/api/salary-planner/fixed-bill', { data: { month: currentMonth, billId } })
//       await loadSalaryPlanner(currentMonth)
//     } catch (error) {
//       console.error('Error deleting bill:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const toggleBillStatus = async (billId: string): Promise<void> => {
//     try {
//       setSaving(true)
//       const bill = fixedBills.find((b) => b._id === billId)

//       if (!bill) return

//       await api.put('/api/salary-planner/fixed-bill', {
//         month: currentMonth,
//         billId,
//         updates: { ...bill, status: bill.status === 'paid' ? 'unpaid' : 'paid' }
//       })

//       await loadSalaryPlanner(currentMonth)
//     } catch (error) {
//       console.error('Error toggling bill status:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Savings goals
//   const handleGoalSubmit = async (
//     goalData: Pick<SavingsGoal, 'title' | 'targetAmount' | 'targetDate'>
//   ): Promise<void> => {
//     try {
//       setSaving(true)

//       if (editingGoal) {
//         await api.put('/api/salary-planner/savings-goal', {
//           month: currentMonth,
//           goalId: editingGoal._id,
//           updates: goalData
//         })
//       } else {
//         await api.post('/api/salary-planner/savings-goal', {
//           month: currentMonth,
//           goal: {
//             ...goalData,
//             savedAmount: 0,
//             monthlyContribution: 0,
//             status: 'active'
//           }
//         })
//       }

//       await loadSalaryPlanner(currentMonth)
//       await updateCumulativeSavings()
//       setEditingGoal(null)
//       setShowGoalForm(false)
//     } catch (error) {
//       console.error('Error saving goal:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const deleteGoal = async (goalId: string): Promise<void> => {
//     try {
//       setSaving(true)
//       await api.delete('/api/salary-planner/savings-goal', { data: { month: currentMonth, goalId } })
//       await loadSalaryPlanner(currentMonth)
//       await updateCumulativeSavings()
//     } catch (error) {
//       console.error('Error deleting goal:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const updateGoalContribution = async (goalId: string, amount: number): Promise<void> => {
//     try {
//       setSaving(true)
//       const goal = savingsGoals.find((g) => g._id === goalId)

//       if (!goal) return

//       await api.put('/api/salary-planner/savings-goal', {
//         month: currentMonth,
//         goalId,
//         updates: { ...goal, savedAmount: (goal.savedAmount || 0) + amount }
//       })

//       await loadSalaryPlanner(currentMonth)
//       await updateCumulativeSavings()
//     } catch (error) {
//       console.error('Error updating goal contribution:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Subscriptions
//   const handleSubscriptionSubmit = async (
//     subscriptionData: Pick<Subscription, 'name' | 'provider' | 'monthlyCost' | 'renewalDate' | 'category'>
//   ): Promise<void> => {
//     try {
//       setSaving(true)

//       if (editingSubscription) {
//         await api.put('/api/salary-planner/subscription', {
//           month: currentMonth,
//           subscriptionId: editingSubscription._id,
//           updates: subscriptionData
//         })
//       } else {
//         await api.post('/api/salary-planner/subscription', {
//           month: currentMonth,
//           subscription: { ...subscriptionData, status: 'active' as SubscriptionStatus }
//         })
//       }

//       await loadSalaryPlanner(currentMonth)
//       setEditingSubscription(null)
//       setShowSubscriptionForm(false)
//     } catch (error) {
//       console.error('Error saving subscription:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const deleteSubscription = async (subscriptionId: string): Promise<void> => {
//     try {
//       setSaving(true)
//       await api.delete('/api/salary-planner/subscription', { data: { month: currentMonth, subscriptionId } })
//       await loadSalaryPlanner(currentMonth)
//     } catch (error) {
//       console.error('Error deleting subscription:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const toggleSubscriptionStatus = async (subscriptionId: string): Promise<void> => {
//     try {
//       setSaving(true)
//       const subscription = subscriptions.find((s) => s._id === subscriptionId)
//       if (!subscription) return

//       const newStatus: SubscriptionStatus = subscription.status === 'active' ? 'paused' : 'active'

//       await api.put('/api/salary-planner/subscription', {
//         month: currentMonth,
//         subscriptionId,
//         updates: { ...subscription, status: newStatus }
//       })

//       await loadSalaryPlanner(currentMonth)
//     } catch (error) {
//       console.error('Error toggling subscription status:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Manual savings
//   const addManualSavings = async (amount: number): Promise<void> => {
//     try {
//       setSaving(true)
//       const newTotal = manualSavings + amount
//       setManualSavings(newTotal)

//       await api.put('/api/salary-planner/cumulative-savings', {
//         month: currentMonth,
//         saved: newTotal,
//         goalsCompleted: savingsGoals.filter((goal) => goal.savedAmount >= goal.targetAmount).length
//       })

//       await loadCumulativeSavings()
//     } catch (error) {
//       console.error('Error adding manual savings:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const withdrawManualSavings = async (amount: number): Promise<void> => {
//     try {
//       setSaving(true)
//       const newTotal = Math.max(0, manualSavings - amount)
//       setManualSavings(newTotal)

//       await api.put('/api/salary-planner/cumulative-savings', {
//         month: currentMonth,
//         saved: newTotal,
//         goalsCompleted: savingsGoals.filter((goal) => goal.savedAmount >= goal.targetAmount).length
//       })

//       await loadCumulativeSavings()
//     } catch (error) {
//       console.error('Error withdrawing manual savings:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   useEffect(() => {
//     if (user) loadSalaryPlanner()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, currentMonth])

//   // Derived values
//   const totalFixedBills = useMemo(() => {
//     return fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount), 0)
//   }, [fixedBills])

//   const totalSubscriptionCost = useMemo(() => {
//     return subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' ? sub.monthlyCost : 0), 0)
//   }, [subscriptions])

//   const remainingAfterFixed = salary.amount - totalFixedBills
//   const remainingAfterSubscriptions = remainingAfterFixed - totalSubscriptionCost
//   const safeDailySpending = calculateSafeDailySpending()
//   const projectedOverspend = calculateProjectedOverspend()

//   if (!user || loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 sm:mb-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Salary Planner</h1>
//           <p className="text-gray-600 text-sm sm:text-base">
//             Manage your monthly budget, track expenses, and achieve your savings goals
//           </p>
//         </div>

//         {/* Salary Setup Card */}
//         <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-900 flex items-center">
//               <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
//               Monthly Salary
//             </h2>
//             <button
//               onClick={() => setEditingBill({} as FixedBill)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
//             >
//               <Edit2 className="h-4 w-4 mr-2" />
//               Edit Salary
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Salary Amount</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-3 text-gray-500">₹</span>
//                 <input
//                   type="number"
//                   value={salary.amount}
//                   onChange={(e) => {
//                     const newAmount = parseFloat(e.target.value) || 0
//                     setSalary((prev) => ({ ...prev, amount: newAmount }))
//                   }}
//                   onBlur={() => {
//                     saveSalaryPlanner({ salary: { ...salary, amount: Number(salary.amount) || 0 } })
//                   }}
//                   className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="45000"
//                   disabled={saving}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Credit Date</label>
//               <select
//                 value={salary.creditDate}
//                 onChange={(e) => {
//                   const newCreditDate = e.target.value
//                   setSalary((prev) => ({ ...prev, creditDate: newCreditDate }))
//                   saveSalaryPlanner({ salary: { ...salary, creditDate: newCreditDate } })
//                 }}
//                 className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 disabled={saving}
//               >
//                 {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
//                   <option key={day} value={day.toString().padStart(2, '0')}>
//                     {day}
//                     {day === 1 ? 'st' : 'th'}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
//               <input
//                 type="month"
//                 value={salary.month}
//                 onChange={(e) => setSalary((prev) => ({ ...prev, month: e.target.value }))}
//                 className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>

//         {/* MAIN GRID */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
//           {/* Fixed Bills Section */}
//           <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col min-h-[400px]">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Fixed Bills</h3>
//               <button
//                 onClick={() => setShowBillForm(true)}
//                 className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Bill
//               </button>
//             </div>

//             {/* Bill Form Modal */}
//             {showBillForm && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-xl p-6 w-96">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-semibold">{editingBill ? 'Edit Bill' : 'Add Bill'}</h3>
//                     <button
//                       onClick={() => {
//                         setShowBillForm(false)
//                         setEditingBill(null)
//                       }}
//                     >
//                       <X className="h-5 w-5 text-gray-500" />
//                     </button>
//                   </div>

//                   <div className="space-y-4">
//                     <input
//                       type="text"
//                       placeholder="Bill name"
//                       defaultValue={editingBill?.name || ''}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="billName"
//                     />

//                     <input
//                       type="number"
//                       placeholder="Amount"
//                       defaultValue={editingBill?.amount || ''}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="billAmount"
//                     />

//                     <select
//                       defaultValue={editingBill?.dueDate || '01'}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="billDueDate"
//                     >
//                       {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
//                         <option key={day} value={day.toString().padStart(2, '0')}>
//                           {day}
//                           {day === 1 ? 'st' : 'th'}
//                         </option>
//                       ))}
//                     </select>

//                     <button
//                       onClick={() => {
//                         const name = (document.getElementById('billName') as HTMLInputElement | null)?.value || ''
//                         const amount =
//                           parseFloat((document.getElementById('billAmount') as HTMLInputElement | null)?.value || '') ||
//                           0
//                         const dueDate =
//                           (document.getElementById('billDueDate') as HTMLSelectElement | null)?.value || '01'

//                         if (name && amount > 0) {
//                           handleBillSubmit({ name, amount, dueDate })
//                         }
//                       }}
//                       className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     >
//                       {editingBill ? 'Update Bill' : 'Add Bill'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {fixedBills.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <p className="text-sm text-gray-600 mb-2">No bills added yet</p>
//                   <p className="text-xs text-gray-500">Add your fixed monthly bills to track your expenses</p>
//                 </div>
//               ) : (
//                 fixedBills
//                   .sort((a, b) => Number(a.dueDate) - Number(b.dueDate))
//                   .map((bill) => (
//                     <div
//                       key={bill._id}
//                       className={`p-4 border rounded-lg ${
//                         bill.status === 'paid'
//                           ? 'bg-green-50 border-green-200'
//                           : parseInt(bill.dueDate) < new Date().getDate()
//                             ? 'bg-red-50 border-red-200'
//                             : 'bg-yellow-50 border-yellow-200'
//                       }`}
//                     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h4 className="font-medium text-gray-900">{bill.name}</h4>
//                           <p className="text-sm text-gray-600">{formatCurrency(bill.amount)}</p>
//                           <p className="text-xs text-gray-500">
//                             Due: {bill.dueDate}
//                             {bill.dueDate === '01' ? 'st' : 'th'}
//                           </p>
//                         </div>

//                         <div className="flex space-x-2">
//                           <button
//                             onClick={() => setEditingBill(bill)}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                             disabled={saving}
//                           >
//                             <Edit2 className="h-4 w-4" />
//                           </button>

//                           <button
//                             onClick={() => toggleBillStatus(bill._id)}
//                             className={`p-2 rounded ${
//                               bill.status === 'paid'
//                                 ? 'text-green-600 hover:bg-green-50'
//                                 : 'text-yellow-600 hover:bg-yellow-50'
//                             }`}
//                             disabled={saving}
//                           >
//                             <Check className="h-4 w-4" />
//                           </button>

//                           <button
//                             onClick={() => deleteBill(bill._id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded"
//                             disabled={saving}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//               )}
//             </div>

//             <div className="mt-4 pt-4 border-t">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Total Fixed Bills:</span>
//                 <span className="font-semibold text-red-600">{formatCurrency(totalFixedBills)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Variable Expenses Summary */}
//           <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col min-h-[400px]">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Variable Expenses</h3>

//             <div className="space-y-4 flex-1">
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <h4 className="font-medium text-gray-900 mb-2">Current Month Spending</h4>
//                 <p className="text-2xl font-bold text-blue-600">{formatCurrency(variableExpenses.totalSpent || 0)}</p>
//               </div>

//               <div className="p-4 bg-yellow-50 rounded-lg">
//                 <h4 className="font-medium text-gray-900 mb-2">Remaining After Fixed Bills</h4>
//                 <p className="text-2xl font-bold text-yellow-600">{formatCurrency(remainingAfterFixed)}</p>
//               </div>

//               <div className="p-4 bg-purple-50 rounded-lg">
//                 <h4 className="font-medium text-gray-900 mb-2">Available for Spending</h4>
//                 <p className="text-2xl font-bold text-purple-600">{formatCurrency(remainingAfterSubscriptions)}</p>
//                 <p className="text-xs text-gray-500 mt-1">After fixed bills and subscriptions</p>
//               </div>
//             </div>
//           </div>

//           {/* Safe Spending Meter */}
//           <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Safe Spending Meter</h3>

//             <div className="space-y-4 flex-1">
//               <div className="text-center">
//                 <div className="mb-4">
//                   <p className="text-sm text-gray-600 mb-2">Safe Daily Spending Limit</p>
//                   <p className="text-3xl font-bold text-blue-600">{formatCurrency(safeDailySpending)}</p>
//                   <p className="text-xs text-gray-500">per day</p>
//                 </div>

//                 <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
//                   <div
//                     className={`h-4 rounded-full ${projectedOverspend > 0 ? 'bg-red-600' : 'bg-green-600'}`}
//                     style={{
//                       width: `${Math.min(
//                         100,
//                         ((variableExpenses.totalSpent || 0) / (safeDailySpending * getDaysLeftInMonth())) * 100
//                       )}%`
//                     }}
//                   ></div>
//                 </div>

//                 {projectedOverspend > 0 && (
//                   <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <p className="text-sm text-red-600 font-medium">
//                       <AlertTriangle className="h-4 w-4 inline mr-2" />
//                       If you continue at this rate, you will exceed budget by {formatCurrency(projectedOverspend)}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Savings Goals */}
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Savings Goals</h3>
//               <button
//                 onClick={() => setShowGoalForm(true)}
//                 className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Goal
//               </button>
//             </div>

//             {/* Goal Form Modal */}
//             {showGoalForm && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-xl p-6 w-96">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-semibold">{editingGoal ? 'Edit Goal' : 'Add Goal'}</h3>
//                     <button
//                       onClick={() => {
//                         setShowGoalForm(false)
//                         setEditingGoal(null)
//                       }}
//                     >
//                       <X className="h-5 w-5 text-gray-500" />
//                     </button>
//                   </div>

//                   <div className="space-y-4">
//                     <input
//                       type="text"
//                       placeholder="Goal title"
//                       defaultValue={editingGoal?.title || ''}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="goalTitle"
//                     />

//                     <input
//                       type="number"
//                       placeholder="Target amount"
//                       defaultValue={editingGoal?.targetAmount || ''}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="goalTarget"
//                     />

//                     <input
//                       type="date"
//                       defaultValue={editingGoal?.targetDate || ''}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="goalTargetDate"
//                     />

//                     <button
//                       onClick={() => {
//                         const title = (document.getElementById('goalTitle') as HTMLInputElement | null)?.value || ''
//                         const targetAmount =
//                           parseFloat((document.getElementById('goalTarget') as HTMLInputElement | null)?.value || '') ||
//                           0
//                         const targetDate =
//                           (document.getElementById('goalTargetDate') as HTMLInputElement | null)?.value || undefined

//                         if (title && targetAmount > 0) {
//                           handleGoalSubmit({ title, targetAmount, targetDate })
//                         }
//                       }}
//                       className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                     >
//                       {editingGoal ? 'Update Goal' : 'Add Goal'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {savingsGoals.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <p className="text-sm text-gray-600 mb-2">No savings goals yet</p>
//                   <p className="text-xs text-gray-500">Set goals to track your savings progress</p>
//                 </div>
//               ) : (
//                 savingsGoals.map((goal) => {
//                   const progress =
//                     goal.targetAmount > 0 ? ((goal.savedAmount || 0) / goal.targetAmount) * 100 : 0

//                   const monthlyRecommended = goal.targetDate
//                     ? Math.max(
//                         0,
//                         (goal.targetAmount - (goal.savedAmount || 0)) /
//                           Math.max(
//                             1,
//                             Math.ceil(
//                               (new Date(goal.targetDate).getTime() - new Date().getTime()) /
//                                 (1000 * 60 * 60 * 24 * 30)
//                             )
//                           )
//                       )
//                     : 0

//                   return (
//                     <div key={goal._id} className="p-4 border border-gray-200 rounded-lg">
//                       <div className="flex justify-between items-start mb-2">
//                         <h4 className="font-medium text-gray-900">{goal.title}</h4>
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => setEditingGoal(goal)}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                             disabled={saving}
//                           >
//                             <Edit2 className="h-4 w-4" />
//                           </button>

//                           <button
//                             onClick={() => deleteGoal(goal._id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded"
//                             disabled={saving}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>

//                       <div className="space-y-2">
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">Progress:</span>
//                           <span className="font-medium">{progress.toFixed(1)}%</span>
//                         </div>

//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div className="h-2 rounded-full bg-purple-600" style={{ width: `${Math.min(100, progress)}%` }} />
//                         </div>

//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">Saved:</span>
//                           <span className="font-medium">{formatCurrency(goal.savedAmount || 0)}</span>
//                         </div>

//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">Target:</span>
//                           <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
//                         </div>

//                         {monthlyRecommended > 0 && (
//                           <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-600">
//                             Recommended monthly saving: {formatCurrency(monthlyRecommended)}
//                           </div>
//                         )}

//                         <div className="flex space-x-2 mt-2">
//                           <input
//                             type="number"
//                             placeholder="Add contribution"
//                             className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
//                             id={`contribution-${goal._id}`}
//                           />
//                           <button
//                             onClick={() => {
//                               const el = document.getElementById(`contribution-${goal._id}`) as HTMLInputElement | null
//                               const amount = parseFloat(el?.value || '') || 0
//                               if (amount > 0) {
//                                 updateGoalContribution(goal._id, amount)
//                                 if (el) el.value = ''
//                               }
//                             }}
//                             className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
//                             disabled={saving}
//                           >
//                             {saving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Add'}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )
//                 })
//               )}
//             </div>
//           </div>

//           {/* Subscriptions Manager */}
//           <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <CreditCard className="h-6 w-6 mr-2 text-purple-600" />
//                 Subscriptions
//               </h3>
//               <button
//                 onClick={() => setShowSubscriptionForm(true)}
//                 className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add
//               </button>
//             </div>

//             {subscriptionWarning && (
//               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <div className="flex items-center">
//                   <Bell className="h-4 w-4 text-red-600 mr-2" />
//                   <p className="text-sm text-red-600 font-medium">{subscriptionWarning.message}</p>
//                 </div>
//               </div>
//             )}

//             {/* Subscription Form Modal */}
//             {showSubscriptionForm && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-xl p-6 w-96">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-semibold">
//                       {editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
//                     </h3>
//                     <button
//                       onClick={() => {
//                         setShowSubscriptionForm(false)
//                         setEditingSubscription(null)
//                       }}
//                     >
//                       <X className="h-5 w-5 text-gray-500" />
//                     </button>
//                   </div>

//                   <div className="space-y-4">
//                     <input
//                       type="text"
//                       placeholder="Subscription name"
//                       defaultValue={editingSubscription?.name || ''}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="subscriptionName"
//                     />

//                     <input
//                       type="text"
//                       placeholder="Provider (Netflix, Spotify, etc.)"
//                       defaultValue={editingSubscription?.provider || ''}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="subscriptionProvider"
//                     />

//                     <input
//                       type="number"
//                       placeholder="Monthly cost"
//                       defaultValue={editingSubscription?.monthlyCost || ''}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="subscriptionCost"
//                     />

//                     <select
//                       defaultValue={editingSubscription?.renewalDate || '01'}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="subscriptionRenewalDate"
//                     >
//                       {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
//                         <option key={day} value={day.toString().padStart(2, '0')}>
//                           {day}
//                           {day === 1 ? 'st' : 'th'}
//                         </option>
//                       ))}
//                     </select>

//                     <select
//                       defaultValue={editingSubscription?.category || 'Entertainment'}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       id="subscriptionCategory"
//                     >
//                       <option value="Entertainment">Entertainment</option>
//                       <option value="Productivity">Productivity</option>
//                       <option value="Education">Education</option>
//                       <option value="News">News</option>
//                       <option value="Health">Health & Fitness</option>
//                       <option value="Other">Other</option>
//                     </select>

//                     <button
//                       onClick={() => {
//                         const name =
//                           (document.getElementById('subscriptionName') as HTMLInputElement | null)?.value || ''
//                         const provider =
//                           (document.getElementById('subscriptionProvider') as HTMLInputElement | null)?.value || ''
//                         const monthlyCost =
//                           parseFloat(
//                             (document.getElementById('subscriptionCost') as HTMLInputElement | null)?.value || ''
//                           ) || 0
//                         const renewalDate =
//                           (document.getElementById('subscriptionRenewalDate') as HTMLSelectElement | null)?.value || '01'
//                         const category =
//                           (document.getElementById('subscriptionCategory') as HTMLSelectElement | null)?.value ||
//                           'Entertainment'

//                         if (name && provider && monthlyCost > 0) {
//                           handleSubscriptionSubmit({ name, provider, monthlyCost, renewalDate, category })
//                         }
//                       }}
//                       className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                     >
//                       {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="space-y-3 max-h-80 overflow-y-auto flex-1">
//               {subscriptions.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <p className="text-sm text-gray-600 mb-2">No subscriptions yet</p>
//                   <p className="text-xs text-gray-500">Track your recurring monthly expenses</p>
//                 </div>
//               ) : (
//                 subscriptions
//                   .sort((a, b) => Number(a.renewalDate) - Number(b.renewalDate))
//                   .map((subscription) => (
//                     <div
//                       key={subscription._id}
//                       className={`p-4 border rounded-lg ${
//                         subscription.status === 'paused'
//                           ? 'bg-gray-50 border-gray-200'
//                           : subscription.status === 'cancelled'
//                             ? 'bg-red-50 border-red-200'
//                             : 'bg-purple-50 border-purple-200'
//                       }`}
//                     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h4 className="font-medium text-gray-900">{subscription.name}</h4>
//                           <p className="text-sm text-gray-600">{subscription.provider}</p>
//                           <p className="text-sm font-semibold text-purple-600">
//                             {formatCurrency(subscription.monthlyCost)}
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             Renews: {subscription.renewalDate}
//                             {subscription.renewalDate === '01' ? 'st' : 'th'}
//                           </p>
//                           <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded mt-1">
//                             {subscription.category}
//                           </span>
//                         </div>

//                         <div className="flex space-x-2">
//                           <button
//                             onClick={() => setEditingSubscription(subscription)}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                             disabled={saving}
//                           >
//                             <Edit2 className="h-4 w-4" />
//                           </button>

//                           <button
//                             onClick={() => toggleSubscriptionStatus(subscription._id)}
//                             className={`p-2 rounded ${
//                               subscription.status === 'active'
//                                 ? 'text-purple-600 hover:bg-purple-50'
//                                 : 'text-gray-600 hover:bg-gray-50'
//                             }`}
//                             disabled={saving}
//                           >
//                             {subscription.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
//                           </button>

//                           <button
//                             onClick={() => deleteSubscription(subscription._id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded"
//                             disabled={saving}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//               )}
//             </div>

//             <div className="mt-4 pt-4 border-t">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Monthly Subscriptions:</span>
//                 <span className={`font-semibold ${subscriptionWarning ? 'text-red-600' : 'text-purple-600'}`}>
//                   {formatCurrency(totalSubscriptionCost)}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Monthly Savings */}
//           <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm p-6 h-full flex flex-col">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-white flex items-center">
//                 <TrendingUp className="h-6 w-6 mr-2" />
//                 Monthly Savings
//               </h3>

//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => {
//                     const amount = prompt('Enter amount to save:')
//                     if (amount && !isNaN(Number(amount))) addManualSavings(parseFloat(amount))
//                   }}
//                   className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center"
//                   disabled={saving}
//                 >
//                   <Plus className="h-3 w-3 mr-1" />
//                   Add
//                 </button>

//                 <button
//                   onClick={() => {
//                     const amount = prompt('Enter amount to withdraw:')
//                     if (amount && !isNaN(Number(amount))) withdrawManualSavings(parseFloat(amount))
//                   }}
//                   className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center"
//                   disabled={saving}
//                 >
//                   <TrendingDown className="h-3 w-3 mr-1" />
//                   Withdraw
//                 </button>
//               </div>
//             </div>

//             <div className="text-center mb-6">
//               <div className={`text-3xl font-bold mb-2 ${manualSavings < 0 ? 'text-red-200' : 'text-white'}`}>
//                 {formatCurrency(manualSavings)}
//               </div>
//               <p className="text-blue-100 text-sm">{manualSavings < 0 ? 'Withdrawn this month' : 'Saved this month'}</p>
//             </div>

//             <div className="space-y-3 mb-4 flex-1">
//               <h4 className="text-blue-100 text-sm font-medium">Goals Progress</h4>

//               {savingsGoals.length === 0 ? (
//                 <p className="text-blue-200 text-sm">No goals set yet</p>
//               ) : (
//                 savingsGoals.map((goal) => {
//                   const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0

//                   return (
//                     <div key={goal._id} className="bg-white/20 rounded-lg p-3">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm font-medium">{goal.title}</span>
//                         <span className="text-xs">
//                           {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
//                         </span>
//                       </div>

//                       <div className="w-full bg-white/30 rounded-full h-2">
//                         <div
//                           className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-400' : 'bg-blue-300'}`}
//                           style={{ width: `${Math.min(100, progress)}%` }}
//                         />
//                       </div>

//                       <div className="flex justify-between items-center mt-2">
//                         <input
//                           type="number"
//                           placeholder="Add contribution"
//                           className="flex-1 px-2 py-1 bg-white/20 border border-white/30 rounded text-sm text-white placeholder-blue-200"
//                           id={`goal-contribution-${goal._id}`}
//                         />
//                         <button
//                           onClick={() => {
//                             const el = document.getElementById(`goal-contribution-${goal._id}`) as HTMLInputElement | null
//                             const amount = parseFloat(el?.value || '') || 0
//                             if (amount > 0) {
//                               updateGoalContribution(goal._id, amount)
//                               if (el) el.value = ''
//                             }
//                           }}
//                           className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs"
//                           disabled={saving}
//                         >
//                           Add
//                         </button>
//                       </div>
//                     </div>
//                   )
//                 })
//               )}
//             </div>

//             <div className="bg-white/20 rounded-lg p-3">
//               <div className="flex justify-between text-sm">
//                 <span className="text-blue-100">Total Goals:</span>
//                 <span className="font-medium">{savingsGoals.length}</span>
//               </div>
//               <div className="flex justify-between text-sm mt-1">
//                 <span className="text-blue-100">Goals Completed:</span>
//                 <span className="font-medium">
//                   {savingsGoals.filter((goal) => goal.savedAmount >= goal.targetAmount).length}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm mt-1">
//                 <span className="text-blue-100">Total in Goals:</span>
//                 <span className="font-medium">
//                   {formatCurrency(savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0))}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Total Savings Tracker */}
//           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-sm p-6 h-full flex flex-col">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-white flex items-center">
//                 <PiggyBank className="h-6 w-6 mr-2" />
//                 Total Savings
//               </h3>

//               <div className="flex items-center">
//                 {cumulativeSavings.currentStreak > 0 && (
//                   <div className="flex items-center mr-2">
//                     <Flame className="h-4 w-4 mr-1" />
//                     <span className="text-sm">{cumulativeSavings.currentStreak}mo</span>
//                   </div>
//                 )}
//                 <Award className="h-5 w-5" />
//               </div>
//             </div>

//             <div className="text-center mb-6 flex-1">
//               <div
//                 className={`text-4xl font-bold mb-2 ${
//                   cumulativeSavings.totalSaved + manualSavings < 0 ? 'text-red-200' : 'text-white'
//                 }`}
//               >
//                 {formatCurrency(cumulativeSavings.totalSaved + manualSavings)}
//               </div>

//               <p className="text-emerald-100 text-sm">
//                 Across {cumulativeSavings.totalMonths} months
//                 {cumulativeSavings.totalSaved + manualSavings < 0 && (
//                   <span className="block text-red-200 text-xs mt-1">
//                     ⚠️ Negative balance - withdrawals exceeded savings
//                   </span>
//                 )}
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
//               <div className="bg-white/20 rounded-lg p-3 text-center">
//                 <p className="text-emerald-100 text-xs mb-1">Monthly Average</p>
//                 <p className="font-semibold">{formatCurrency(cumulativeSavings.averageMonthlySaving)}</p>
//               </div>

//               <div className="bg-white/20 rounded-lg p-3 text-center">
//                 <p className="text-emerald-100 text-xs mb-1">Goals Completed</p>
//                 <p className="font-semibold">{cumulativeSavings.totalGoalsCompleted}</p>
//               </div>
//             </div>

//             {cumulativeSavings.bestMonth && (
//               <div className="bg-white/20 rounded-lg p-3 mb-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-emerald-100 text-xs">Best Month</p>
//                     <p className="font-semibold">{cumulativeSavings.bestMonth.month}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold">{formatCurrency(cumulativeSavings.bestMonth.saved)}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {cumulativeSavings.monthlyHistory.length > 0 && (
//               <div className="mt-4 pt-4 border-t border-emerald-400">
//                 <p className="text-emerald-100 text-xs mb-2">Recent Months</p>
//                 <div className="space-y-1 max-h-24 overflow-y-auto">
//                   {cumulativeSavings.monthlyHistory
//                     .slice(-3)
//                     .reverse()
//                     .map((month) => (
//                       <div key={month.month} className="flex justify-between text-sm">
//                         <span className="text-emerald-100">{month.month}</span>
//                         <span className="font-medium">
//                           {formatCurrency(month.saved)}
//                           {month.goalsCompleted > 0 && (
//                             <span className="ml-1 text-xs bg-white/20 px-1 rounded">{month.goalsCompleted} ✓</span>
//                           )}
//                         </span>
//                       </div>
//                     ))}
//                 </div>
//               </div>
//             )}

//             {cumulativeSavings.totalSaved > 0 && (
//               <div className="mt-4 text-center">
//                 <p className="text-emerald-100 text-sm">🎉 Great job! You're building wealth consistently!</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default SalaryPlanner

import React, { useState, useEffect, ChangeEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  CreditCard,
  Bell,
  Pause,
  Play,
  PiggyBank,
  TrendingDown,
  Award,
  Flame
} from 'lucide-react'

// --- Interfaces ---
interface Salary {
  amount: number;
  creditDate: string;
  month: string;
}

interface FixedBill {
  _id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid';
}

interface Subscription {
  _id: string;
  name: string;
  provider: string;
  monthlyCost: number;
  renewalDate: string;
  category: string;
  status: 'active' | 'paused' | 'cancelled';
}

interface SavingsGoal {
  _id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  status: string;
}

interface CumulativeSavings {
  totalSaved: number;
  monthlyHistory: Array<{ month: string; saved: number; goalsCompleted: number }>;
  totalGoalsCompleted: number;
  averageMonthlySaving: number;
  bestMonth: { month: string; saved: number } | null;
  currentStreak: number;
  totalMonths: number;
}

const SalaryPlanner: React.FC = () => {
  const { user } = useAuth()
  const { formatAmount } = useCurrency()
  
  // State management
  const [salary, setSalary] = useState<Salary>({ amount: 0, creditDate: '01', month: new Date().toISOString().slice(0, 7) })
  const [fixedBills, setFixedBills] = useState<FixedBill[]>([])
  const [variableExpenses, setVariableExpenses] = useState({ totalSpent: 0, categories: [] })
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subscriptionWarning, setSubscriptionWarning] = useState<{ message: string } | null>(null)
  const [cumulativeSavings, setCumulativeSavings] = useState<CumulativeSavings>({
    totalSaved: 0,
    monthlyHistory: [],
    totalGoalsCompleted: 0,
    averageMonthlySaving: 0,
    bestMonth: null,
    currentStreak: 0,
    totalMonths: 0
  })
  const [manualSavings, setManualSavings] = useState<number>(0)
  const [showBillForm, setShowBillForm] = useState<boolean>(false)
  const [showGoalForm, setShowGoalForm] = useState<boolean>(false)
  const [showSubscriptionForm, setShowSubscriptionForm] = useState<boolean>(false)
  const [editingBill, setEditingBill] = useState<Partial<FixedBill> | null>(null)
  const [editingGoal, setEditingGoal] = useState<Partial<SavingsGoal> | null>(null)
  const [editingSubscription, setEditingSubscription] = useState<Partial<Subscription> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [currentMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  const loadSalaryPlanner = async (month = currentMonth) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/salary-planner?month=${month}`)
      const data = response.data.data
      
      if (data) {
        setSalary(data.salary || { amount: 0, creditDate: '01', month })
        setFixedBills(data.fixedBills || [])
        setVariableExpenses(data.variableExpenses || { totalSpent: 0, categories: [] })
        setSavingsGoals(data.savingsGoals || [])
        setSubscriptions(data.subscriptions || [])
      }
      
      await loadSubscriptionSummary(month)
      await loadCumulativeSavings()
    } catch (error) {
      console.error('Error loading salary planner:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCumulativeSavings = async () => {
    try {
      const response = await api.get('/api/salary-planner/cumulative-savings')
      setCumulativeSavings(response.data.data)
    } catch (error) {
      console.error('Error loading cumulative savings:', error)
    }
  }

  const updateCumulativeSavings = async () => {
    try {
      const currentMonthSaved = savingsGoals.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0) + manualSavings
      const goalsCompleted = savingsGoals.filter(goal => goal.savedAmount >= goal.targetAmount).length
      
      await api.put('/api/salary-planner/cumulative-savings', {
        month: currentMonth,
        saved: currentMonthSaved,
        goalsCompleted
      })
      
      await loadCumulativeSavings()
    } catch (error) {
      console.error('Error updating cumulative savings:', error)
    }
  }

  const saveSalaryPlanner = async (updates: any) => {
    try {
      setSaving(true)
      await api.put('/api/salary-planner', {
        month: currentMonth,
        updates
      })
      await loadSalaryPlanner(currentMonth)
    } catch (error) {
      console.error('Error saving salary planner:', error)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadSalaryPlanner()
    }
  }, [user, currentMonth])

  const getDaysLeftInMonth = () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return lastDay - now.getDate()
  }

  const calculateSafeDailySpending = () => {
    const remainingAfterFixed = salary.amount - fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount), 0)
    const remainingAfterSubscriptions = remainingAfterFixed - subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' ? sub.monthlyCost : 0), 0)
    const daysLeft = getDaysLeftInMonth()
    return daysLeft > 0 ? Math.max(0, remainingAfterSubscriptions / daysLeft) : 0
  }

  const calculateProjectedOverspend = () => {
    const safeDaily = calculateSafeDailySpending()
    const projectedMonthly = safeDaily * getDaysLeftInMonth()
    const currentSpending = variableExpenses.totalSpent || 0
    return currentSpending > projectedMonthly ? currentSpending - projectedMonthly : 0
  }

  const handleBillSubmit = async (billData: any) => {
    try {
      setSaving(true)
      if (editingBill?._id) {
        await api.put('/api/salary-planner/fixed-bill', {
          month: currentMonth,
          billId: editingBill._id,
          updates: billData
        })
      } else {
        await api.post('/api/salary-planner/fixed-bill', {
          month: currentMonth,
          bill: { ...billData, status: 'unpaid' }
        })
      }
      await loadSalaryPlanner(currentMonth)
      setEditingBill(null)
      setShowBillForm(false)
    } catch (error) {
      console.error('Error saving bill:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteBill = async (billId: string) => {
    try {
      setSaving(true)
      await api.delete('/api/salary-planner/fixed-bill', {
        data: { month: currentMonth, billId }
      })
      await loadSalaryPlanner(currentMonth)
    } catch (error) {
      console.error('Error deleting bill:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleBillStatus = async (billId: string) => {
    try {
      setSaving(true)
      const bill = fixedBills.find(b => b._id === billId)
      if (bill) {
        await api.put('/api/salary-planner/fixed-bill', {
          month: currentMonth,
          billId,
          updates: { ...bill, status: bill.status === 'paid' ? 'unpaid' : 'paid' }
        })
        await loadSalaryPlanner(currentMonth)
      }
    } catch (error) {
      console.error('Error toggling bill status:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleGoalSubmit = async (goalData: any) => {
    try {
      setSaving(true)
      if (editingGoal?._id) {
        await api.put('/api/salary-planner/savings-goal', {
          month: currentMonth,
          goalId: editingGoal._id,
          updates: goalData
        })
      } else {
        await api.post('/api/salary-planner/savings-goal', {
          month: currentMonth,
          goal: { ...goalData, savedAmount: 0, monthlyContribution: 0, status: 'active' }
        })
      }
      await loadSalaryPlanner(currentMonth)
      await updateCumulativeSavings()
      setEditingGoal(null)
      setShowGoalForm(false)
    } catch (error) {
      console.error('Error saving goal:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      setSaving(true)
      await api.delete('/api/salary-planner/savings-goal', {
        data: { month: currentMonth, goalId }
      })
      await loadSalaryPlanner(currentMonth)
      await updateCumulativeSavings()
    } catch (error) {
      console.error('Error deleting goal:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateGoalContribution = async (goalId: string, amount: number) => {
    try {
      setSaving(true)
      const goal = savingsGoals.find(g => g._id === goalId)
      if (goal) {
        await api.put('/api/salary-planner/savings-goal', {
          month: currentMonth,
          goalId,
          updates: { ...goal, savedAmount: goal.savedAmount + amount }
        })
        await loadSalaryPlanner(currentMonth)
        await updateCumulativeSavings()
      }
    } catch (error) {
      console.error('Error updating goal contribution:', error)
    } finally {
      setSaving(false)
    }
  }

  const loadSubscriptionSummary = async (month = currentMonth) => {
    try {
      const response = await api.get(`/api/salary-planner/subscriptions?month=${month}&warningThreshold=1000`)
      setSubscriptionWarning(response.data.data.warning)
    } catch (error) {
      console.error('Error loading subscription summary:', error)
    }
  }

  const handleSubscriptionSubmit = async (subscriptionData: any) => {
    try {
      setSaving(true)
      if (editingSubscription?._id) {
        await api.put('/api/salary-planner/subscription', {
          month: currentMonth,
          subscriptionId: editingSubscription._id,
          updates: subscriptionData
        })
      } else {
        await api.post('/api/salary-planner/subscription', {
          month: currentMonth,
          subscription: { ...subscriptionData, status: 'active' }
        })
      }
      await loadSalaryPlanner(currentMonth)
      setEditingSubscription(null)
      setShowSubscriptionForm(false)
    } catch (error) {
      console.error('Error saving subscription:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteSubscription = async (subscriptionId: string) => {
    try {
      setSaving(true)
      await api.delete('/api/salary-planner/subscription', {
        data: { month: currentMonth, subscriptionId }
      })
      await loadSalaryPlanner(currentMonth)
    } catch (error) {
      console.error('Error deleting subscription:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleSubscriptionStatus = async (subscriptionId: string) => {
    try {
      setSaving(true)
      const subscription = subscriptions.find(s => s._id === subscriptionId)
      if (subscription) {
        const newStatus = subscription.status === 'active' ? 'paused' : 'active'
        await api.put('/api/salary-planner/subscription', {
          month: currentMonth,
          subscriptionId,
          updates: { ...subscription, status: newStatus }
        })
        await loadSalaryPlanner(currentMonth)
      }
    } catch (error) {
      console.error('Error toggling subscription status:', error)
    } finally {
      setSaving(false)
    }
  }

  const addManualSavings = async (amount: number) => {
    try {
      setSaving(true)
      const newTotal = manualSavings + amount
      setManualSavings(newTotal)
      await api.put('/api/salary-planner/cumulative-savings', {
        month: currentMonth,
        saved: newTotal,
        goalsCompleted: savingsGoals.filter(goal => goal.savedAmount >= goal.targetAmount).length
      })
      await loadCumulativeSavings()
    } catch (error) {
      console.error('Error adding manual savings:', error)
    } finally {
      setSaving(false)
    }
  }

  const withdrawManualSavings = async (amount: number) => {
    try {
      setSaving(true)
      const newTotal = Math.max(0, manualSavings - amount)
      setManualSavings(newTotal)
      await api.put('/api/salary-planner/cumulative-savings', {
        month: currentMonth,
        saved: newTotal,
        goalsCompleted: savingsGoals.filter(goal => goal.savedAmount >= goal.targetAmount).length
      })
      await loadCumulativeSavings()
    } catch (error) {
      console.error('Error withdrawing manual savings:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => formatAmount(amount)

  const totalFixedBills = fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount), 0)
  const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' ? sub.monthlyCost : 0), 0)
  const remainingAfterFixed = salary.amount - totalFixedBills
  const remainingAfterSubscriptions = remainingAfterFixed - totalSubscriptionCost
  const safeDailySpending = calculateSafeDailySpending()
  const projectedOverspend = calculateProjectedOverspend()

  if (!user || loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Salary Planner</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Manage your monthly budget, track expenses, and achieve your savings goals</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
              Monthly Salary
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salary Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  value={salary.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const newAmount = parseFloat(e.target.value) || 0
                    setSalary(prev => ({ ...prev, amount: newAmount }))
                  }}
                  onBlur={() => saveSalaryPlanner({ salary: { ...salary, amount: Number(salary.amount) || 0 } })}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="45000"
                  disabled={saving}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credit Date</label>
              <select
                value={salary.creditDate}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const newCreditDate = e.target.value
                  setSalary(prev => ({ ...prev, creditDate: newCreditDate }))
                  saveSalaryPlanner({ salary: { ...salary, creditDate: newCreditDate } })
                }}
                className="w-full px-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString().padStart(2, '0')}>
                    {day}{day === 1 ? 'st' : 'th'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
              <input
                type="month"
                value={salary.month}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSalary(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Fixed Bills Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 h-full flex flex-col md:min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fixed Bills</h3>
              <button onClick={() => setShowBillForm(true)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center whitespace-nowrap text-sm">
                <Plus className="h-4 w-4 mr-2" /> Add Bill
              </button>
            </div>

            {showBillForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingBill ? 'Edit Bill' : 'Add Bill'}</h3>
                    <button onClick={() => {setShowBillForm(false); setEditingBill(null)}}><X className="h-5 w-5 text-gray-500" /></button>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Bill name" defaultValue={editingBill?.name || ''} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" id="billName" />
                    <input type="number" placeholder="Amount" defaultValue={editingBill?.amount || ''} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" id="billAmount" />
                    <select defaultValue={editingBill?.dueDate || '01'} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" id="billDueDate">
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>{day}{day === 1 ? 'st' : 'th'}</option>
                      ))}
                    </select>
                    <button onClick={() => {
                        const name = (document.getElementById('billName') as HTMLInputElement).value
                        const amount = parseFloat((document.getElementById('billAmount') as HTMLInputElement).value) || 0
                        const dueDate = (document.getElementById('billDueDate') as HTMLSelectElement).value
                        if (name && amount > 0) handleBillSubmit({ name, amount, dueDate })
                      }} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {editingBill ? 'Update Bill' : 'Add Bill'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {fixedBills.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No bills added yet</div>
              ) : (
                fixedBills.map(bill => (
                  <div key={bill._id} className={`p-4 border rounded-lg ${bill.status === 'paid' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' : 'bg-yellow-50 border-yellow-200 dark:bg-amber-900/25 dark:border-amber-700'}`}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 break-words">{bill.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{formatCurrency(bill.amount)}</p>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2 shrink-0">
                        <button onClick={() => { setEditingBill(bill); setShowBillForm(true); }} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => toggleBillStatus(bill._id)} className="p-2 rounded text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"><Check className="h-4 w-4" /></button>
                        <button onClick={() => deleteBill(bill._id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Total:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(totalFixedBills)}</span>
            </div>
          </div>

          {/* Variable Expenses Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 h-full flex flex-col md:min-h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Variable Expenses</h3>
            <div className="space-y-4 flex-1">
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Month Spending</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-rose-300">{formatCurrency(variableExpenses.totalSpent || 0)}</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-amber-900/30 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-amber-100 mb-2">Remaining After Bills</h4>
                <p className="text-2xl font-bold text-yellow-700 dark:text-amber-300">{formatCurrency(remainingAfterFixed)}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-violet-900/35 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-violet-100 mb-2">Available to Spend</h4>
                <p className="text-2xl font-bold text-purple-700 dark:text-violet-300">{formatCurrency(remainingAfterSubscriptions)}</p>
              </div>
            </div>
          </div>

          {/* Safe Spending Meter */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Safe Spending Meter</h3>
            <div className="text-center flex-1">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Safe Daily Spending Limit</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-rose-300">{formatCurrency(safeDailySpending)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">per day</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 mb-4 overflow-hidden">
                <div 
                  className={`h-4 rounded-full transition-all ${projectedOverspend > 0 ? 'bg-red-600' : 'bg-green-600'}`}
                  style={{ width: `${Math.min(100, ((variableExpenses.totalSpent || 0) / (safeDailySpending * getDaysLeftInMonth() || 1)) * 100)}%` }}
                />
              </div>
              {projectedOverspend > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4 inline mr-2" /> Projected overspend: {formatCurrency(projectedOverspend)}
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions Row */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subscriptions</h3>
              <button onClick={() => setShowSubscriptionForm(true)} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center whitespace-nowrap text-sm">
                <Plus className="h-4 w-4 mr-2" /> Add
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {subscriptions.map(sub => (
                <div key={sub._id} className="p-3 border rounded-lg bg-purple-50 border-purple-200 dark:bg-violet-900/35 dark:border-violet-700">
                  <div className="flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm break-words">{sub.name}</h4>
                      <p className="text-xs text-purple-700 dark:text-violet-300 font-bold">{formatCurrency(sub.monthlyCost)}</p>
                    </div>
                    <button onClick={() => toggleSubscriptionStatus(sub._id)} className="text-purple-700 dark:text-violet-300">
                      {sub.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 text-sm flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Subs:</span>
              <span className="font-semibold text-purple-700 dark:text-violet-300">{formatCurrency(totalSubscriptionCost)}</span>
            </div>
          </div>
        </div>

        {/* Savings & Tracker Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold flex items-center"><TrendingUp className="h-6 w-6 mr-2" /> Monthly Savings</h3>
              <div className="flex space-x-2">
                <button onClick={() => { const a = prompt('Amount:'); if(a) addManualSavings(parseFloat(a)) }} className="px-2 py-1 bg-white/20 rounded text-xs">Add</button>
                <button onClick={() => { const a = prompt('Amount:'); if(a) withdrawManualSavings(parseFloat(a)) }} className="px-2 py-1 bg-white/20 rounded text-xs">Withdraw</button>
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl sm:text-4xl font-bold mb-2 break-words">{formatCurrency(manualSavings)}</div>
              <p className="text-blue-100 text-sm">Tracked this month</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold flex items-center"><PiggyBank className="h-6 w-6 mr-2" /> Total Savings</h3>
              <div className="flex items-center"><Flame className="h-4 w-4 mr-1" /> <span>{cumulativeSavings.currentStreak}mo streak</span></div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl sm:text-4xl font-bold mb-2 break-words">{formatCurrency(cumulativeSavings.totalSaved + manualSavings)}</div>
              <p className="text-emerald-100 text-sm">Portfolio Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forms for Goals and Subscriptions remain structurally the same as Bills modal example */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 w-full max-w-md">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Savings Goal</h3>
                <button onClick={() => setShowGoalForm(false)}><X className="h-5 w-5 text-gray-500" /></button>
             </div>
             <div className="space-y-4">
                <input type="text" id="goalTitle" placeholder="Goal Name" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                <input type="number" id="goalTarget" placeholder="Target Amount" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                <button onClick={() => {
                  const title = (document.getElementById('goalTitle') as HTMLInputElement).value;
                  const target = parseFloat((document.getElementById('goalTarget') as HTMLInputElement).value);
                  if (title && target) handleGoalSubmit({ title, targetAmount: target });
                }} className="w-full py-2 bg-purple-600 text-white rounded-lg">Save Goal</button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryPlanner
