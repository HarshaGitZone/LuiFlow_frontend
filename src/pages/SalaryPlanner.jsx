import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api'
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

const SalaryPlanner = () => {
  const { user } = useAuth()
  
  // State management
  const [salary, setSalary] = useState({ amount: 0, creditDate: '01', month: new Date().toISOString().slice(0, 7) })
  const [fixedBills, setFixedBills] = useState([])
  const [variableExpenses, setVariableExpenses] = useState({ totalSpent: 0, categories: [] })
  const [savingsGoals, setSavingsGoals] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [subscriptionWarning, setSubscriptionWarning] = useState(null)
  const [cumulativeSavings, setCumulativeSavings] = useState({
    totalSaved: 0,
    monthlyHistory: [],
    totalGoalsCompleted: 0,
    averageMonthlySaving: 0,
    bestMonth: null,
    currentStreak: 0,
    totalMonths: 0
  })
  const [manualSavings, setManualSavings] = useState(0) // New state for manual savings
  const [activeTab, setActiveTab] = useState('overview')
  const [showBillForm, setShowBillForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7))

  // Load salary planner data from backend
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
      
      // Load subscription summary and warnings
      await loadSubscriptionSummary(month)
      
      // Load cumulative savings data
      await loadCumulativeSavings()
    } catch (error) {
      console.error('Error loading salary planner:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load cumulative savings data
  const loadCumulativeSavings = async () => {
    try {
      const response = await api.get('/api/salary-planner/cumulative-savings')
      setCumulativeSavings(response.data.data)
    } catch (error) {
      console.error('Error loading cumulative savings:', error)
    }
  }

  // Update cumulative savings when goals change
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

  // Save salary planner data to backend
  const saveSalaryPlanner = async (updates) => {
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

  // Calculate days left in month
  const getDaysLeftInMonth = () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return lastDay - now.getDate()
  }

  // Calculate safe daily spending
  const calculateSafeDailySpending = () => {
    const remainingAfterFixed = salary.amount - fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount), 0)
    const remainingAfterSubscriptions = remainingAfterFixed - subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' ? sub.monthlyCost : 0), 0)
    // Remove savings goals from calculation - they are tracked separately now
    const remainingAfterSavings = remainingAfterSubscriptions
    const daysLeft = getDaysLeftInMonth()
    return daysLeft > 0 ? Math.max(0, remainingAfterSavings / daysLeft) : 0
  }

  // Calculate projected overspend
  const calculateProjectedOverspend = () => {
    const safeDaily = calculateSafeDailySpending()
    const projectedMonthly = safeDaily * getDaysLeftInMonth()
    const currentSpending = variableExpenses.totalSpent || 0
    return currentSpending > projectedMonthly ? currentSpending - projectedMonthly : 0
  }

  // Add/Edit Fixed Bill
  const handleBillSubmit = async (billData) => {
    try {
      setSaving(true)
      
      if (editingBill) {
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

  // Delete Bill
  const deleteBill = async (billId) => {
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

  // Toggle Bill Status
  const toggleBillStatus = async (billId) => {
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

  // Add/Edit Savings Goal
  const handleGoalSubmit = async (goalData) => {
    try {
      setSaving(true)
      
      if (editingGoal) {
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

  // Delete Goal
  const deleteGoal = async (goalId) => {
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

  // Update Goal Contribution
  const updateGoalContribution = async (goalId, amount) => {
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

  // Load subscription summary and warnings
  const loadSubscriptionSummary = async (month = currentMonth) => {
    try {
      const response = await api.get(`/api/salary-planner/subscriptions?month=${month}&warningThreshold=1000`)
      setSubscriptionWarning(response.data.data.warning)
    } catch (error) {
      console.error('Error loading subscription summary:', error)
    }
  }

  // Add/Edit Subscription
  const handleSubscriptionSubmit = async (subscriptionData) => {
    try {
      setSaving(true)
      
      if (editingSubscription) {
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

  // Delete Subscription
  const deleteSubscription = async (subscriptionId) => {
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

  // Toggle Subscription Status
  const toggleSubscriptionStatus = async (subscriptionId) => {
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

  // Manual Savings Management
  const addManualSavings = async (amount) => {
    try {
      setSaving(true)
      const newTotal = manualSavings + amount
      setManualSavings(newTotal)
      
      // Update cumulative savings to include manual savings
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

  const withdrawManualSavings = async (amount) => {
    try {
      setSaving(true)
      const newTotal = Math.max(0, manualSavings - amount)
      setManualSavings(newTotal)
      
      // Update cumulative savings to include manual savings withdrawal
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const totalFixedBills = fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount), 0)
  const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' ? sub.monthlyCost : 0), 0)
  const remainingAfterFixed = salary.amount - totalFixedBills
  const remainingAfterSubscriptions = remainingAfterFixed - totalSubscriptionCost
  // Remove savings goals from monthly calculation - they are now tracked separately
  const remainingAfterSavings = remainingAfterSubscriptions
  const safeDailySpending = calculateSafeDailySpending()
  const projectedOverspend = calculateProjectedOverspend()

  if (!user || loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Salary Planner</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your monthly budget, track expenses, and achieve your savings goals</p>
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
                  onChange={(e) => {
                    const newAmount = parseFloat(e.target.value) || 0
                    setSalary(prev => ({ ...prev, amount: newAmount }))
                  }}
                  onBlur={() => {
                    saveSalaryPlanner({ salary: { ...salary, amount: Number(salary.amount) || 0 } })
                  }}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="45000"
                  disabled={saving}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Date</label>
              <select
                value={salary.creditDate}
                onChange={(e) => {
                  const newCreditDate = e.target.value
                  setSalary(prev => ({ ...prev, creditDate: newCreditDate }))
                  saveSalaryPlanner({ salary: { ...salary, creditDate: newCreditDate } })
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Fixed Bills Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col min-h-[400px]">
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
                  <p className="text-sm text-gray-600 mb-2">No bills added yet</p>
                  <p className="text-xs text-gray-500">Add your fixed monthly bills to track your expenses</p>
                </div>
              ) : (
                fixedBills
                  .sort((a, b) => a.dueDate - b.dueDate)
                  .map(bill => (
                    <div key={bill._id} className={`p-4 border rounded-lg ${
                      bill.status === 'paid' ? 'bg-green-50 border-green-200' : 
                      parseInt(bill.dueDate) < new Date().getDate() ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
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
                            disabled={saving}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleBillStatus(bill._id)}
                            className={`p-2 rounded ${
                              bill.status === 'paid' ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'
                            }`}
                            disabled={saving}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteBill(bill._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            disabled={saving}
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
          <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col min-h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Variable Expenses</h3>
            
            <div className="space-y-4 flex-1">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Month Spending</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(variableExpenses.totalSpent || 0)}</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Remaining After Fixed Bills</h4>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(remainingAfterFixed)}</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Available for Spending</h4>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(remainingAfterSubscriptions)}</p>
                <p className="text-xs text-gray-500 mt-1">After fixed bills and subscriptions</p>
              </div>
            </div>
          </div>

          {/* Safe Spending Meter */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safe Spending Meter</h3>
            
            <div className="space-y-4 flex-1">
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
                    style={{ width: `${Math.min(100, ((variableExpenses.totalSpent || 0) / (safeDailySpending * getDaysLeftInMonth())) * 100)}%` }}
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
                  <p className="text-sm text-gray-600 mb-2">No savings goals yet</p>
                  <p className="text-xs text-gray-500">Set goals to track your savings progress</p>
                </div>
              ) : (
                savingsGoals.map(goal => {
                  const progress = goal.targetAmount > 0 ? ((goal.savedAmount || 0) / goal.targetAmount) * 100 : 0
                  const monthlyRecommended = goal.targetDate ? 
                    Math.max(0, (goal.targetAmount - (goal.savedAmount || 0)) / Math.max(1, Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)))) : 0
                  
                  return (
                    <div key={goal._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <button
                          onClick={() => setEditingGoal(goal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          disabled={saving}
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
                          <span className="font-medium">{formatCurrency(goal.savedAmount || 0)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
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
                            id={`contribution-${goal._id}`}
                          />
                          <button
                            onClick={() => {
                              const amount = parseFloat(document.getElementById(`contribution-${goal._id}`).value) || 0
                              if (amount > 0) {
                                updateGoalContribution(goal._id, amount)
                                document.getElementById(`contribution-${goal._id}`).value = ''
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            disabled={saving}
                          >
                            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Subscriptions Manager */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-purple-600" />
                Subscriptions
              </h3>
              <button
                onClick={() => setShowSubscriptionForm(true)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </button>
            </div>

            {/* Subscription Warning */}
            {subscriptionWarning && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-600 font-medium">
                    {subscriptionWarning.message}
                  </p>
                </div>
              </div>
            )}

            {/* Subscription Form Modal */}
            {showSubscriptionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-96">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{editingSubscription ? 'Edit Subscription' : 'Add Subscription'}</h3>
                    <button onClick={() => {setShowSubscriptionForm(false); setEditingSubscription(null)}}>
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Subscription name"
                      defaultValue={editingSubscription?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="subscriptionName"
                    />
                    
                    <input
                      type="text"
                      placeholder="Provider (Netflix, Spotify, etc.)"
                      defaultValue={editingSubscription?.provider || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="subscriptionProvider"
                    />
                    
                    <input
                      type="number"
                      placeholder="Monthly cost"
                      defaultValue={editingSubscription?.monthlyCost || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="subscriptionCost"
                    />
                    
                    <select
                      defaultValue={editingSubscription?.renewalDate || '01'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="subscriptionRenewalDate"
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>
                          {day}{day === 1 ? 'st' : 'th'}
                        </option>
                      ))}
                    </select>

                    <select
                      defaultValue={editingSubscription?.category || 'Entertainment'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      id="subscriptionCategory"
                    >
                      <option value="Entertainment">Entertainment</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Education">Education</option>
                      <option value="News">News</option>
                      <option value="Health">Health & Fitness</option>
                      <option value="Other">Other</option>
                    </select>
                    
                    <button
                      onClick={() => {
                        const name = document.getElementById('subscriptionName').value
                        const provider = document.getElementById('subscriptionProvider').value
                        const monthlyCost = parseFloat(document.getElementById('subscriptionCost').value) || 0
                        const renewalDate = document.getElementById('subscriptionRenewalDate').value
                        const category = document.getElementById('subscriptionCategory').value
                        if (name && provider && monthlyCost > 0) {
                          handleSubscriptionSubmit({ name, provider, monthlyCost, renewalDate, category })
                        }
                      }}
                      className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto flex-1">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm text-gray-600 mb-2">No subscriptions yet</p>
                  <p className="text-xs text-gray-500">Track your recurring monthly expenses</p>
                </div>
              ) : (
                subscriptions
                  .sort((a, b) => a.renewalDate - b.renewalDate)
                  .map(subscription => (
                    <div key={subscription._id} className={`p-4 border rounded-lg ${
                      subscription.status === 'paused' ? 'bg-gray-50 border-gray-200' : 
                      subscription.status === 'cancelled' ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{subscription.name}</h4>
                          <p className="text-sm text-gray-600">{subscription.provider}</p>
                          <p className="text-sm font-semibold text-purple-600">{formatCurrency(subscription.monthlyCost)}</p>
                          <p className="text-xs text-gray-500">Renews: {subscription.renewalDate}{subscription.renewalDate === 1 ? 'st' : 'th'}</p>
                          <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded mt-1">
                            {subscription.category}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingSubscription(subscription)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            disabled={saving}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleSubscriptionStatus(subscription._id)}
                            className={`p-2 rounded ${
                              subscription.status === 'active' ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            disabled={saving}
                          >
                            {subscription.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => deleteSubscription(subscription._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            disabled={saving}
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
                <span className="text-gray-600">Monthly Subscriptions:</span>
                <span className={`font-semibold ${subscriptionWarning ? 'text-red-600' : 'text-purple-600'}`}>
                  {formatCurrency(totalSubscriptionCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Savings Row */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="h-6 w-6 mr-2" />
                Monthly Savings
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const amount = prompt('Enter amount to save:')
                    if (amount && !isNaN(amount)) {
                      addManualSavings(parseFloat(amount))
                    }
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center"
                  disabled={saving}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </button>
                <button
                  onClick={() => {
                    const amount = prompt('Enter amount to withdraw:')
                    if (amount && !isNaN(amount)) {
                      withdrawManualSavings(parseFloat(amount))
                    }
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center"
                  disabled={saving}
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Withdraw
                </button>
              </div>
            </div>

            {/* Current Month Savings */}
            <div className="text-center mb-6">
              <div className={`text-3xl font-bold mb-2 ${manualSavings < 0 ? 'text-red-200' : 'text-white'}`}>
                {formatCurrency(manualSavings)}
              </div>
              <p className="text-blue-100 text-sm">
                {manualSavings < 0 ? 'Withdrawn this month' : 'Saved this month'}
              </p>
            </div>

            {/* Goals Progress */}
            <div className="space-y-3 mb-4 flex-1">
              <h4 className="text-blue-100 text-sm font-medium">Goals Progress</h4>
              {savingsGoals.length === 0 ? (
                <p className="text-blue-200 text-sm">No goals set yet</p>
              ) : (
                savingsGoals.map(goal => {
                  const progress = (goal.savedAmount / goal.targetAmount) * 100
                  return (
                    <div key={goal._id} className="bg-white/20 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{goal.title}</span>
                        <span className="text-xs">
                          {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            progress >= 100 ? 'bg-green-400' : 'bg-blue-300'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <input
                          type="number"
                          placeholder="Add contribution"
                          className="flex-1 px-2 py-1 bg-white/20 border border-white/30 rounded text-sm text-white placeholder-blue-200"
                          id={`goal-contribution-${goal._id}`}
                        />
                        <button
                          onClick={() => {
                            const amount = parseFloat(document.getElementById(`goal-contribution-${goal._id}`).value) || 0
                            if (amount > 0) {
                              updateGoalContribution(goal._id, amount)
                              document.getElementById(`goal-contribution-${goal._id}`).value = ''
                            }
                          }}
                          className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs"
                          disabled={saving}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Monthly Summary */}
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Total Goals:</span>
                <span className="font-medium">{savingsGoals.length}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-blue-100">Goals Completed:</span>
                <span className="font-medium">
                  {savingsGoals.filter(goal => goal.savedAmount >= goal.targetAmount).length}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-blue-100">Total in Goals:</span>
                <span className="font-medium">
                  {formatCurrency(savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Total Savings Tracker */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <PiggyBank className="h-6 w-6 mr-2" />
                Total Savings
              </h3>
              <div className="flex items-center">
                {cumulativeSavings.currentStreak > 0 && (
                  <div className="flex items-center mr-2">
                    <Flame className="h-4 w-4 mr-1" />
                    <span className="text-sm">{cumulativeSavings.currentStreak}mo</span>
                  </div>
                )}
                <Award className="h-5 w-5" />
              </div>
            </div>

            {/* Main Total Display */}
            <div className="text-center mb-6 flex-1">
              <div className={`text-4xl font-bold mb-2 ${(cumulativeSavings.totalSaved + manualSavings) < 0 ? 'text-red-200' : 'text-white'}`}>
                {formatCurrency(cumulativeSavings.totalSaved + manualSavings)}
              </div>
              <p className="text-emerald-100 text-sm">
                Across {cumulativeSavings.totalMonths} months
                {(cumulativeSavings.totalSaved + manualSavings) < 0 && (
                  <span className="block text-red-200 text-xs mt-1">
                    ⚠️ Negative balance - withdrawals exceeded savings
                  </span>
                )}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-emerald-100 text-xs mb-1">Monthly Average</p>
                <p className="font-semibold">
                  {formatCurrency(cumulativeSavings.averageMonthlySaving)}
                </p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-emerald-100 text-xs mb-1">Goals Completed</p>
                <p className="font-semibold">{cumulativeSavings.totalGoalsCompleted}</p>
              </div>
            </div>

            {/* Best Month */}
            {cumulativeSavings.bestMonth && (
              <div className="bg-white/20 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs">Best Month</p>
                    <p className="font-semibold">{cumulativeSavings.bestMonth.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(cumulativeSavings.bestMonth.saved)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Months Trend */}
            {cumulativeSavings.monthlyHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-400">
                <p className="text-emerald-100 text-xs mb-2">Recent Months</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {cumulativeSavings.monthlyHistory
                    .slice(-3)
                    .reverse()
                    .map((month, index) => (
                      <div key={month.month} className="flex justify-between text-sm">
                        <span className="text-emerald-100">{month.month}</span>
                        <span className="font-medium">
                          {formatCurrency(month.saved)}
                          {month.goalsCompleted > 0 && (
                            <span className="ml-1 text-xs bg-white/20 px-1 rounded">
                              {month.goalsCompleted} ✓
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Motivational Message */}
            {cumulativeSavings.totalSaved > 0 && (
              <div className="mt-4 text-center">
                <p className="text-emerald-100 text-sm">
                  🎉 Great job! You're building wealth consistently!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalaryPlanner
