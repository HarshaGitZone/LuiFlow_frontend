import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  DollarSign, 
  Calendar, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react'

const SalaryPlanner = () => {
  const { user } = useAuth()
  
  // State management
  const [salary, setSalary] = useState({ amount: 0, creditDate: '01', month: new Date().toISOString().slice(0, 7) })
  const [fixedBills, setFixedBills] = useState([])
  const [variableExpenses, setVariableExpenses] = useState({ total: 0, categories: {} })
  const [savingsGoals, setSavingsGoals] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [showBillForm, setShowBillForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)

  // Calculate days left in month
  const getDaysLeftInMonth = () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return lastDay - now.getDate()
  }

  // Calculate safe daily spending
  const calculateSafeDailySpending = () => {
    const remainingAfterFixed = salary.amount - fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount), 0)
    const remainingAfterSavings = remainingAfterFixed - (savingsGoals.reduce((sum, goal) => sum + goal.monthlyContribution, 0))
    const daysLeft = getDaysLeftInMonth()
    return daysLeft > 0 ? Math.max(0, remainingAfterSavings / daysLeft) : 0
  }

  // Calculate projected overspend
  const calculateProjectedOverspend = () => {
    const safeDaily = calculateSafeDailySpending()
    const projectedMonthly = safeDaily * getDaysLeftInMonth()
    const currentSpending = variableExpenses.total
    return currentSpending > projectedMonthly ? currentSpending - projectedMonthly : 0
  }

  // Add/Edit Fixed Bill
  const handleBillSubmit = (billData) => {
    if (editingBill) {
      setFixedBills(prev => prev.map(bill => 
        bill.id === editingBill.id ? { ...bill, ...billData } : bill
      ))
      setEditingBill(null)
    } else {
      const newBill = {
        id: Date.now(),
        ...billData,
        status: 'unpaid'
      }
      setFixedBills(prev => [...prev, newBill])
    }
    setShowBillForm(false)
  }

  // Delete Bill
  const deleteBill = (id) => {
    setFixedBills(prev => prev.filter(bill => bill.id !== id))
  }

  // Toggle Bill Status
  const toggleBillStatus = (id) => {
    setFixedBills(prev => prev.map(bill => 
      bill.id === id ? { ...bill, status: bill.status === 'paid' ? 'unpaid' : 'paid' } : bill
    ))
  }

  // Add/Edit Savings Goal
  const handleGoalSubmit = (goalData) => {
    if (editingGoal) {
      setSavingsGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id ? { ...goal, ...goalData } : goal
      ))
      setEditingGoal(null)
    } else {
      const newGoal = {
        id: Date.now(),
        ...goalData,
        saved: 0,
        monthlyContribution: 0
      }
      setSavingsGoals(prev => [...prev, newGoal])
    }
    setShowGoalForm(false)
  }

  // Delete Goal
  const deleteGoal = (id) => {
    setSavingsGoals(prev => prev.filter(goal => goal.id !== id))
  }

  // Update Goal Contribution
  const updateGoalContribution = (id, amount) => {
    setSavingsGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, saved: goal.saved + amount } : goal
    ))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const totalFixedBills = fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount), 0)
  const totalSavingsContributions = savingsGoals.reduce((sum, goal) => sum + goal.monthlyContribution, 0)
  const remainingAfterFixed = salary.amount - totalFixedBills
  const remainingAfterSavings = remainingAfterFixed - totalSavingsContributions
  const safeDailySpending = calculateSafeDailySpending()
  const projectedOverspend = calculateProjectedOverspend()

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Salary Planner</h1>
          <p className="text-gray-600">Plan your monthly budget and track your financial goals</p>
        </div>

        {/* Salary Setup Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
              Monthly Salary
            </h2>
            <button
              onClick={() => setEditingBill({})}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Salary
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  value={salary.amount}
                  onChange={(e) => setSalary(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="45000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Date</label>
              <select
                value={salary.creditDate}
                onChange={(e) => setSalary(prev => ({ ...prev, creditDate: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString().padStart(2, '0')}>
                    {day}{day === 1 ? 'st' : 'th'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <input
                type="month"
                value={salary.month}
                onChange={(e) => setSalary(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fixed Bills Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Fixed Bills</h3>
              <button
                onClick={() => setShowBillForm(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bill
              </button>
            </div>

            {/* Bill Form Modal */}
            {showBillForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-96">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{editingBill ? 'Edit Bill' : 'Add Bill'}</h3>
                    <button onClick={() => {setShowBillForm(false); setEditingBill(null)}}>
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Bill name"
                      defaultValue={editingBill?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="billName"
                    />
                    
                    <input
                      type="number"
                      placeholder="Amount"
                      defaultValue={editingBill?.amount || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="billAmount"
                    />
                    
                    <select
                      defaultValue={editingBill?.dueDate || '01'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="billDueDate"
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>
                          {day}{day === 1 ? 'st' : 'th'}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => {
                        const name = document.getElementById('billName').value
                        const amount = parseFloat(document.getElementById('billAmount').value) || 0
                        const dueDate = document.getElementById('billDueDate').value
                        if (name && amount > 0) {
                          handleBillSubmit({ name, amount, dueDate })
                        }
                      }}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingBill ? 'Update Bill' : 'Add Bill'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {fixedBills.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No bills added yet</p>
                </div>
              ) : (
                fixedBills
                  .sort((a, b) => a.dueDate - b.dueDate)
                  .map(bill => (
                    <div key={bill.id} className={`p-4 border rounded-lg ${
                      bill.status === 'paid' ? 'bg-green-50 border-green-200' : 
                      bill.dueDate < new Date().getDate() ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{bill.name}</h4>
                          <p className="text-sm text-gray-600">{formatCurrency(bill.amount)}</p>
                          <p className="text-xs text-gray-500">Due: {bill.dueDate}{bill.dueDate === 1 ? 'st' : 'th'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingBill(bill)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleBillStatus(bill.id)}
                            className={`p-2 rounded ${
                              bill.status === 'paid' ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteBill(bill.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Fixed Bills:</span>
                <span className="font-semibold text-red-600">{formatCurrency(totalFixedBills)}</span>
              </div>
            </div>
          </div>

          {/* Variable Expenses Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Variable Expenses</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Month Spending</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(variableExpenses.total)}</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Remaining After Fixed Bills</h4>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(remainingAfterFixed)}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">After Savings Goals</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(remainingAfterSavings)}</p>
              </div>
            </div>
          </div>

          {/* Safe Spending Meter */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safe Spending Meter</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Safe Daily Spending Limit</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(safeDailySpending)}</p>
                  <p className="text-xs text-gray-500">per day</p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className={`h-4 rounded-full ${
                      projectedOverspend > 0 ? 'bg-red-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(100, (variableExpenses.total / (safeDailySpending * getDaysLeftInMonth())) * 100)}%` }}
                  ></div>
                </div>
                
                {projectedOverspend > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      If you continue at this rate, you will exceed budget by {formatCurrency(projectedOverspend)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Savings Goals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Savings Goals</h3>
              <button
                onClick={() => setShowGoalForm(true)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </button>
            </div>

            {/* Goal Form Modal */}
            {showGoalForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-96">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{editingGoal ? 'Edit Goal' : 'Add Goal'}</h3>
                    <button onClick={() => {setShowGoalForm(false); setEditingGoal(null)}}>
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Goal title"
                      defaultValue={editingGoal?.title || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="goalTitle"
                    />
                    
                    <input
                      type="number"
                      placeholder="Target amount"
                      defaultValue={editingGoal?.target || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="goalTarget"
                    />
                    
                    <input
                      type="date"
                      defaultValue={editingGoal?.targetDate || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="goalTargetDate"
                    />
                    
                    <button
                      onClick={() => {
                        const title = document.getElementById('goalTitle').value
                        const target = parseFloat(document.getElementById('goalTarget').value) || 0
                        const targetDate = document.getElementById('goalTargetDate').value
                        if (title && target > 0) {
                          handleGoalSubmit({ title, target, targetDate })
                        }
                      }}
                      className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {editingGoal ? 'Update Goal' : 'Add Goal'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savingsGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No savings goals yet</p>
                </div>
              ) : (
                savingsGoals.map(goal => {
                  const progress = (goal.saved / goal.target) * 100
                  const monthlyRecommended = goal.targetDate ? 
                    (goal.target - goal.saved) / Math.max(1, Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30))) : 0
                  
                  return (
                    <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <button
                          onClick={() => setEditingGoal(goal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress:</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-purple-600"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Saved:</span>
                          <span className="font-medium">{formatCurrency(goal.saved)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium">{formatCurrency(goal.target)}</span>
                        </div>
                        
                        {monthlyRecommended > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-600">
                            Recommended monthly saving: {formatCurrency(monthlyRecommended)}
                          </div>
                        )}
                        
                        <div className="flex space-x-2 mt-2">
                          <input
                            type="number"
                            placeholder="Add contribution"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            id={`contribution-${goal.id}`}
                          />
                          <button
                            onClick={() => {
                              const amount = parseFloat(document.getElementById(`contribution-${goal.id}`).value) || 0
                              if (amount > 0) {
                                updateGoalContribution(goal.id, amount)
                                document.getElementById(`contribution-${goal.id}`).value = ''
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalaryPlanner
