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

interface BillFormState {
  name: string;
  amount: string;
  dueDate: string;
}

interface SubscriptionFormState {
  name: string;
  provider: string;
  monthlyCost: string;
  renewalDate: string;
  category: string;
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
  monthlyHistory: Array<{ month: string; saved: number; goalsCompleted: number; manualSaved?: number }>;
  totalGoalsCompleted: number;
  averageMonthlySaving: number;
  bestMonth: { month: string; saved: number } | null;
  currentStreak: number;
  totalMonths: number;
}

interface MonthlyTransactionFlow {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
}

interface OverallTransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
}

interface StockPerformance {
  totalInvested: number;
  currentValue: number;
  totalPnL: number;
}

interface PurchaseGoal {
  id: string;
  name: string;
  amount: number;
}

const SalaryPlanner: React.FC = () => {
  const { user } = useAuth()
  const { formatAmount, currencyMeta } = useCurrency()

  const normalizePurchaseGoals = (goals: any[]): PurchaseGoal[] =>
    (Array.isArray(goals) ? goals : [])
      .map((goal: any) => ({
        id: String(goal._id || goal.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        name: String(goal.name || '').trim(),
        amount: Number(goal.amount) || 0
      }))
      .filter((goal: PurchaseGoal) => goal.name && goal.amount > 0)

  const getPurchaseGoalsStorageKey = (month: string) => {
    const userKey = String((user as any)?._id || (user as any)?.id || (user as any)?.email || 'anonymous')
    return `salaryPlanner_purchaseGoals_${userKey}_${month}`
  }
  
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
  const [monthlyTransactionFlow, setMonthlyTransactionFlow] = useState<MonthlyTransactionFlow>({
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0
  })
  const [overallTransactionSummary, setOverallTransactionSummary] = useState<OverallTransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0
  })
  const [stockPerformance, setStockPerformance] = useState<StockPerformance>({
    totalInvested: 0,
    currentValue: 0,
    totalPnL: 0
  })
  const [showBillForm, setShowBillForm] = useState<boolean>(false)
  const [showGoalForm, setShowGoalForm] = useState<boolean>(false)
  const [showSubscriptionForm, setShowSubscriptionForm] = useState<boolean>(false)
  const [editingBill, setEditingBill] = useState<Partial<FixedBill> | null>(null)
  const [editingGoal, setEditingGoal] = useState<Partial<SavingsGoal> | null>(null)
  const [editingSubscription, setEditingSubscription] = useState<Partial<Subscription> | null>(null)
  const [billForm, setBillForm] = useState<BillFormState>({ name: '', amount: '', dueDate: '01' })
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionFormState>({
    name: '',
    provider: '',
    monthlyCost: '',
    renewalDate: '01',
    category: 'Entertainment'
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [currentMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)
  const [purchaseGoals, setPurchaseGoals] = useState<PurchaseGoal[]>([])
  const [purchaseGoalName, setPurchaseGoalName] = useState<string>('')
  const [purchaseGoalAmount, setPurchaseGoalAmount] = useState<string>('')

  const showActionMessage = (type: 'success' | 'info' | 'error', text: string) => {
    setActionMessage({ type, text })
    window.setTimeout(() => setActionMessage(null), 3000)
  }

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
        const backendPurchaseGoals = normalizePurchaseGoals(data.purchaseGoals || [])
        if (backendPurchaseGoals.length > 0) {
          setPurchaseGoals(backendPurchaseGoals)
          localStorage.setItem(getPurchaseGoalsStorageKey(month), JSON.stringify(backendPurchaseGoals))
        } else {
          const rawLocalGoals = localStorage.getItem(getPurchaseGoalsStorageKey(month))
          if (rawLocalGoals) {
            try {
              const localGoals = normalizePurchaseGoals(JSON.parse(rawLocalGoals))
              setPurchaseGoals(localGoals)
            } catch {
              setPurchaseGoals([])
            }
          } else {
            setPurchaseGoals([])
          }
        }
        setSubscriptions(data.subscriptions || [])
        setMonthlyTransactionFlow(data.transactionFlow || { totalIncome: 0, totalExpenses: 0, netFlow: 0 })
        
        // Initialize default bills and subscriptions if empty
        if ((!data.fixedBills || data.fixedBills.length === 0) && 
            (!data.subscriptions || data.subscriptions.length === 0)) {
          await initializeDefaults(month)
        }
      }
      
      await loadSubscriptionSummary(month)
      await loadCumulativeSavings()
      await loadStockPerformance()
      await loadOverallTransactionSummary()
    } catch (error) {
      console.error('Error loading salary planner:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOverallTransactionSummary = async () => {
    try {
      const response = await api.get('/api/transactions/summary')
      setOverallTransactionSummary({
        totalIncome: Number(response.data?.totalIncome) || 0,
        totalExpenses: Number(response.data?.totalExpenses) || 0,
        netFlow: Number(response.data?.netFlow) || 0
      })
    } catch (error) {
      console.error('Error loading overall transaction summary:', error)
      setOverallTransactionSummary({
        totalIncome: 0,
        totalExpenses: 0,
        netFlow: 0
      })
    }
  }

  const loadStockPerformance = async () => {
    try {
      const response = await api.get('/api/portfolio')
      const stats = response.data?.stats || {}
      setStockPerformance({
        totalInvested: Number(stats.totalInvested) || 0,
        currentValue: Number(stats.currentValue) || 0,
        totalPnL: Number(stats.totalPnL) || 0
      })
    } catch (error) {
      console.error('Error loading stock performance:', error)
      setStockPerformance({
        totalInvested: 0,
        currentValue: 0,
        totalPnL: 0
      })
    }
  }

  const initializeDefaults = async (month: string) => {
    try {
      // Check if defaults already exist
      const existingBillNames = fixedBills.map(bill => bill.name.toLowerCase())
      const existingSubscriptionNames = subscriptions.map(sub => sub.name.toLowerCase())
      
      // Default bills
      const defaultBills = [
        { name: 'Rent', amount: 15000, dueDate: '01', status: 'unpaid' },
        { name: 'Electricity', amount: 2000, dueDate: '05', status: 'unpaid' },
        { name: 'Water', amount: 800, dueDate: '10', status: 'unpaid' }
      ]
      
      // Default subscriptions
      const defaultSubscriptions = [
        { name: 'Netflix', provider: 'Netflix', monthlyCost: 649, renewalDate: '15', category: 'Entertainment', status: 'active' },
        { name: 'Amazon Prime', provider: 'Amazon', monthlyCost: 299, renewalDate: '20', category: 'Shopping', status: 'active' },
        { name: 'Hotstar', provider: 'Disney+ Hotstar', monthlyCost: 399, renewalDate: '25', category: 'Entertainment', status: 'active' }
      ]
      
      // Add only bills that don't exist
      const billsToAdd = defaultBills.filter(bill => !existingBillNames.includes(bill.name.toLowerCase()))
      for (const bill of billsToAdd) {
        await api.post('/api/salary-planner/fixed-bill', {
          month,
          bill: { ...bill, status: 'unpaid' }
        })
      }
      
      // Add only subscriptions that don't exist
      const subscriptionsToAdd = defaultSubscriptions.filter(sub => !existingSubscriptionNames.includes(sub.name.toLowerCase()))
      for (const subscription of subscriptionsToAdd) {
        await api.post('/api/salary-planner/subscription', {
          month,
          subscription: { ...subscription, status: 'active' }
        })
      }
      
      // Reload data after adding defaults
      await loadSalaryPlanner(month)
      
      if (billsToAdd.length > 0 || subscriptionsToAdd.length > 0) {
        showActionMessage('success', `${billsToAdd.length} bills and ${subscriptionsToAdd.length} subscriptions added. You can edit them as needed.`)
      } else {
        showActionMessage('info', 'All default bills and subscriptions already exist.')
      }
    } catch (error) {
      console.error('Error initializing defaults:', error)
      showActionMessage('error', 'Failed to add defaults.')
    }
  }

  const removeDefaults = async (month: string) => {
    try {
      const defaultBillNames = ['rent', 'electricity', 'water']
      const defaultSubscriptionNames = ['netflix', 'amazon prime', 'hotstar']
      
      // Remove default bills
      const billsToRemove = fixedBills.filter(bill => defaultBillNames.includes(bill.name.toLowerCase()))
      for (const bill of billsToRemove) {
        await api.delete('/api/salary-planner/fixed-bill', {
          data: { month, billId: bill._id }
        })
      }
      
      // Remove default subscriptions
      const subscriptionsToRemove = subscriptions.filter(sub => defaultSubscriptionNames.includes(sub.name.toLowerCase()))
      for (const subscription of subscriptionsToRemove) {
        await api.delete('/api/salary-planner/subscription', {
          data: { month, subscriptionId: subscription._id }
        })
      }
      
      // Reload data after removing defaults
      await loadSalaryPlanner(month)
      showActionMessage('success', `${billsToRemove.length} bills and ${subscriptionsToRemove.length} subscriptions removed.`)
    } catch (error) {
      console.error('Error removing defaults:', error)
      showActionMessage('error', 'Failed to remove defaults.')
    }
  }

  const hasDefaults = () => {
    const defaultBillNames = ['rent', 'electricity', 'water']
    const defaultSubscriptionNames = ['netflix', 'amazon prime', 'hotstar']
    
    const hasDefaultBills = fixedBills.some(bill => defaultBillNames.includes(bill.name.toLowerCase()))
    const hasDefaultSubscriptions = subscriptions.some(sub => defaultSubscriptionNames.includes(sub.name.toLowerCase()))
    
    return hasDefaultBills || hasDefaultSubscriptions
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
      const currentMonthSaved =
        savingsGoals.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0) +
        manualSavings +
        monthlyTransactionFlow.netFlow
      const goalsCompleted = savingsGoals.filter(goal => goal.savedAmount >= goal.targetAmount).length
      
      await api.put('/api/salary-planner/cumulative-savings', {
        month: currentMonth,
        saved: currentMonthSaved,
        manualSaved: manualSavings,
        goalsCompleted
      })
      
      await loadCumulativeSavings()
    } catch (error) {
      console.error('Error updating cumulative savings:', error)
    }
  }

  const saveSalaryPlanner = async (updates: any, successMessage?: string) => {
    try {
      setSaving(true)
      await api.put('/api/salary-planner', {
        month: currentMonth,
        updates
      })
      await loadSalaryPlanner(currentMonth)
      if (successMessage) {
        showActionMessage('success', successMessage)
      }
    } catch (error) {
      console.error('Error saving salary planner:', error)
      showActionMessage('error', 'Failed to save salary planner data.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadSalaryPlanner()
    }
  }, [user, currentMonth])

  useEffect(() => {
    const handlePortfolioUpdated = () => {
      loadStockPerformance()
    }

    window.addEventListener('portfolio-updated', handlePortfolioUpdated)
    return () => {
      window.removeEventListener('portfolio-updated', handlePortfolioUpdated)
    }
  }, [])

  useEffect(() => {
    const handleTransactionUpdated = () => {
      loadOverallTransactionSummary()
    }

    window.addEventListener('transaction-updated', handleTransactionUpdated)
    return () => {
      window.removeEventListener('transaction-updated', handleTransactionUpdated)
    }
  }, [])

  useEffect(() => {
    if (!showBillForm) return
    setBillForm({
      name: editingBill?.name || '',
      amount: editingBill?.amount !== undefined ? String(editingBill.amount) : '',
      dueDate: editingBill?.dueDate || '01'
    })
  }, [showBillForm, editingBill])

  useEffect(() => {
    if (!showSubscriptionForm) return
    setSubscriptionForm({
      name: editingSubscription?.name || '',
      provider: editingSubscription?.provider || '',
      monthlyCost: editingSubscription?.monthlyCost !== undefined ? String(editingSubscription.monthlyCost) : '',
      renewalDate: editingSubscription?.renewalDate || '01',
      category: editingSubscription?.category || 'Entertainment'
    })
  }, [showSubscriptionForm, editingSubscription])

  const getDaysLeftInMonth = () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return lastDay - now.getDate()
  }

  const calculateSafeDailySpending = () => {
    const remainingAfterFixed = salary.amount - fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? bill.amount : 0), 0)
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
        // For editing, send billId in the request body as expected by backend
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
      showActionMessage('success', editingBill?._id ? 'Bill updated successfully.' : 'Bill added successfully.')
      setEditingBill(null)
      setShowBillForm(false)
    } catch (error) {
      console.error('Error saving bill:', error)
      showActionMessage('error', 'Failed to save bill. Please try again.')
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
      showActionMessage('success', 'Bill deleted successfully.')
    } catch (error) {
      console.error('Error deleting bill:', error)
      showActionMessage('error', 'Failed to delete bill. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleBillStatus = async (billId: string) => {
    try {
      setSaving(true)
      const bill = fixedBills.find(b => b._id === billId)
      if (bill) {
        const nextStatus = bill.status === 'paid' ? 'unpaid' : 'paid'
        await api.put('/api/salary-planner/fixed-bill', {
          month: currentMonth,
          billId,
          updates: { ...bill, status: nextStatus }
        })
        await loadSalaryPlanner(currentMonth)
        window.dispatchEvent(new CustomEvent('salary-planner-updated', {
          detail: {
            action: 'fixed-bill-status-changed',
            month: currentMonth,
            bill: {
              ...bill,
              status: nextStatus
            }
          }
        }))
        showActionMessage('success', `${bill.name} marked as ${nextStatus === 'paid' ? 'paid' : 'unpaid'} for ${currentMonth}. Monthly amount updated.`)
      }
    } catch (error) {
      console.error('Error toggling bill status:', error)
      showActionMessage('error', 'Failed to update bill status.')
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
      showActionMessage('success', editingGoal?._id ? 'Goal updated successfully.' : 'Goal created successfully.')
      setEditingGoal(null)
      setShowGoalForm(false)
    } catch (error) {
      console.error('Error saving goal:', error)
      showActionMessage('error', 'Failed to save goal.')
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
      showActionMessage('success', 'Goal deleted successfully.')
    } catch (error) {
      console.error('Error deleting goal:', error)
      showActionMessage('error', 'Failed to delete goal.')
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
        showActionMessage('success', 'Goal contribution updated.')
      }
    } catch (error) {
      console.error('Error updating goal contribution:', error)
      showActionMessage('error', 'Failed to update contribution.')
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
          updates: {
            ...subscriptionData,
            status: editingSubscription.status || 'active'
          }
        })
      } else {
        await api.post('/api/salary-planner/subscription', {
          month: currentMonth,
          subscription: { ...subscriptionData, status: 'active' }
        })
      }
      await loadSalaryPlanner(currentMonth)
      showActionMessage('success', editingSubscription?._id ? 'Subscription updated successfully.' : 'Subscription added successfully.')
      setEditingSubscription(null)
      setShowSubscriptionForm(false)
    } catch (error) {
      console.error('Error saving subscription:', error)
      showActionMessage('error', 'Failed to save subscription.')
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
      showActionMessage('success', 'Subscription deleted successfully.')
    } catch (error) {
      console.error('Error deleting subscription:', error)
      showActionMessage('error', 'Failed to delete subscription.')
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
        showActionMessage('info', `${subscription.name} is now ${newStatus}. Monthly amount updated.`)
      }
    } catch (error) {
      console.error('Error toggling subscription status:', error)
      showActionMessage('error', 'Failed to update subscription status.')
    } finally {
      setSaving(false)
    }
  }

  const addManualSavings = async (amount: number) => {
    try {
      setSaving(true)
      const newTotal = manualSavings + amount
      setManualSavings(newTotal)
      const goalSavings = savingsGoals.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0)
      await api.put('/api/salary-planner/cumulative-savings', {
        month: currentMonth,
        saved: goalSavings + newTotal + monthlyTransactionFlow.netFlow,
        manualSaved: newTotal,
        goalsCompleted: savingsGoals.filter(goal => goal.savedAmount >= goal.targetAmount).length
      })
      await loadCumulativeSavings()
      showActionMessage('success', 'Savings updated successfully.')
    } catch (error) {
      console.error('Error adding manual savings:', error)
      showActionMessage('error', 'Failed to add savings.')
    } finally {
      setSaving(false)
    }
  }

  const withdrawManualSavings = async (amount: number) => {
    try {
      setSaving(true)
      const newTotal = Math.max(0, manualSavings - amount)
      setManualSavings(newTotal)
      const goalSavings = savingsGoals.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0)
      await api.put('/api/salary-planner/cumulative-savings', {
        month: currentMonth,
        saved: goalSavings + newTotal + monthlyTransactionFlow.netFlow,
        manualSaved: newTotal,
        goalsCompleted: savingsGoals.filter(goal => goal.savedAmount >= goal.targetAmount).length
      })
      await loadCumulativeSavings()
      showActionMessage('success', 'Savings updated successfully.')
    } catch (error) {
      console.error('Error withdrawing manual savings:', error)
      showActionMessage('error', 'Failed to withdraw savings.')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => formatAmount(amount)
  const convertUsdToInr = (amountInUsd: number) => {
    const usdPerInr = Number(currencyMeta?.USD?.rateFromINR) || 0.012
    if (usdPerInr <= 0) return amountInUsd
    return amountInUsd / usdPerInr
  }

  const totalFixedBills = fixedBills.reduce((sum, bill) => sum + (bill.status === 'paid' ? bill.amount : 0), 0)
  const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' ? sub.monthlyCost : 0), 0)
  const remainingAfterFixed = salary.amount - totalFixedBills
  const remainingAfterSubscriptions = remainingAfterFixed - totalSubscriptionCost
  const availableToSpend = remainingAfterSubscriptions + monthlyTransactionFlow.netFlow
  const currentMonthSavings = availableToSpend
  const stockPnlInInr = convertUsdToInr(stockPerformance.totalPnL)
  const stockCurrentValueInInr = convertUsdToInr(stockPerformance.currentValue)
  const stockInvestedValueInInr = convertUsdToInr(stockPerformance.totalInvested)
  const previousMonthsSavings = cumulativeSavings.monthlyHistory
    .filter((entry) => entry.month !== currentMonth)
    .reduce((sum, entry) => sum + (Number(entry.saved) || 0), 0)
  const totalSavingsValue =
    previousMonthsSavings +
    currentMonthSavings +
    stockPnlInInr +
    overallTransactionSummary.netFlow
  const purchaseGoalsTotal = purchaseGoals.reduce((sum, goal) => sum + goal.amount, 0)
  const totalSavingsAfterGoals = totalSavingsValue - purchaseGoalsTotal
  const safeDailySpending = calculateSafeDailySpending()
  const projectedOverspend = calculateProjectedOverspend()

  const savePurchaseGoals = async (goals: PurchaseGoal[]) => {
    localStorage.setItem(getPurchaseGoalsStorageKey(currentMonth), JSON.stringify(goals))
    try {
      await api.put('/api/salary-planner', {
        month: currentMonth,
        updates: {
          purchaseGoals: goals.map((goal) => ({ name: goal.name, amount: goal.amount }))
        }
      })
    } catch (error) {
      console.error('Error saving purchase goals:', error)
      showActionMessage('error', 'Saved locally. Failed to sync savings goals to server.')
    }
  }

  const addPurchaseGoal = () => {
    const name = purchaseGoalName.trim()
    const amount = Number.parseFloat(purchaseGoalAmount)
    if (!name || !Number.isFinite(amount) || amount <= 0) {
      showActionMessage('error', 'Enter a valid goal name and amount.')
      return
    }

    const nextGoals = [
      ...purchaseGoals,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        amount
      }
    ]
    setPurchaseGoals(nextGoals)
    void savePurchaseGoals(nextGoals)
    setPurchaseGoalName('')
    setPurchaseGoalAmount('')
  }

  const removePurchaseGoal = (id: string) => {
    const nextGoals = purchaseGoals.filter((goal) => goal.id !== id)
    setPurchaseGoals(nextGoals)
    void savePurchaseGoals(nextGoals)
  }

  useEffect(() => {
    if (!user || loading) return

    const goalsCompleted = savingsGoals.filter(goal => goal.savedAmount >= goal.targetAmount).length
    const syncCurrentMonthSavings = async () => {
      try {
        await api.put('/api/salary-planner/cumulative-savings', {
          month: currentMonth,
          saved: currentMonthSavings,
          manualSaved: manualSavings,
          goalsCompleted
        })
        await loadCumulativeSavings()
      } catch (error) {
        console.error('Error syncing current month savings:', error)
      }
    }

    void syncCurrentMonthSavings()
  }, [user, loading, currentMonth, currentMonthSavings, manualSavings, savingsGoals])

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

        {actionMessage && (
          <div className={`mb-4 rounded-lg p-3 text-sm border ${actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
              : actionMessage.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}>
            {actionMessage.text}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
              Monthly Salary
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salary Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">â‚¹</span>
                <input
                  type="number"
                  value={salary.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const newAmount = parseFloat(e.target.value) || 0
                    setSalary(prev => ({ ...prev, amount: newAmount }))
                  }}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="45000"
                  disabled={saving}
                />
              </div>
            </div>
            <button
              onClick={() => saveSalaryPlanner(
                {
                  salary: {
                    ...salary,
                    amount: Number(salary.amount) || 0
                  }
                },
                'Salary is updated successfully.'
              )}
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Salary'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Fixed Bills Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 h-full flex flex-col md:min-h-[400px]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fixed Bills</h3>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                {hasDefaults() ? (
                  <button onClick={() => removeDefaults(currentMonth)} className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center text-sm">
                    <Trash2 className="h-4 w-4 mr-2" /> Remove Defaults
                  </button>
                ) : (
                  <button onClick={() => initializeDefaults(currentMonth)} className="w-full sm:w-auto px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center text-sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Defaults
                  </button>
                )}
                <button onClick={() => { setEditingBill(null); setBillForm({ name: '', amount: '', dueDate: '01' }); setShowBillForm(true) }} className="w-full sm:w-auto px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center text-sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Bill
                </button>
              </div>
            </div>

            {showBillForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingBill ? 'Edit Bill' : 'Add Bill'}</h3>
                    <button onClick={() => { setShowBillForm(false); setEditingBill(null); setBillForm({ name: '', amount: '', dueDate: '01' }) }}><X className="h-5 w-5 text-gray-500" /></button>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Bill name" value={billForm.name} onChange={(e: ChangeEvent<HTMLInputElement>) => setBillForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                    <input type="number" placeholder="Amount" value={billForm.amount} onChange={(e: ChangeEvent<HTMLInputElement>) => setBillForm((prev) => ({ ...prev, amount: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                    <select value={billForm.dueDate} onChange={(e: ChangeEvent<HTMLSelectElement>) => setBillForm((prev) => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>{day}{day === 1 ? 'st' : 'th'}</option>
                      ))}
                    </select>
                    <button onClick={() => {
                        const name = billForm.name.trim()
                        const amount = Number.parseFloat(billForm.amount) || 0
                        const dueDate = billForm.dueDate || '01'
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
                        <button onClick={() => { setEditingBill(bill); setShowBillForm(true); }} className="p-2 rounded border border-slate-300/80 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => toggleBillStatus(bill._id)} className="p-2 rounded text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"><Check className="h-4 w-4" /></button>
                        <button onClick={() => deleteBill(bill._id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Paid Total:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(totalFixedBills)}</span>
            </div>
          </div>

          {/* Subscriptions Row (center) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subscriptions</h3>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                {hasDefaults() ? (
                  <button onClick={() => removeDefaults(currentMonth)} className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center text-sm">
                    <Trash2 className="h-4 w-4 mr-2" /> Remove Defaults
                  </button>
                ) : (
                  <button onClick={() => initializeDefaults(currentMonth)} className="w-full sm:w-auto px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center text-sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Defaults
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingSubscription(null)
                    setSubscriptionForm({
                      name: '',
                      provider: '',
                      monthlyCost: '',
                      renewalDate: '01',
                      category: 'Entertainment'
                    })
                    setShowSubscriptionForm(true)
                  }}
                  className="w-full sm:w-auto px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add
                </button>
              </div>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No subscriptions added yet</div>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub._id} className="p-3 border rounded-lg bg-purple-50 border-purple-200 dark:bg-violet-900/35 dark:border-violet-700">
                    <div className="flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm break-words">{sub.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 break-words">{sub.provider}</p>
                        <p className="text-xs text-purple-700 dark:text-violet-300 font-bold">{formatCurrency(sub.monthlyCost)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status: {sub.status}</p>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingSubscription(sub)
                            setShowSubscriptionForm(true)
                          }}
                          className="p-2 rounded border border-slate-300/80 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70"
                          title="Edit subscription"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleSubscriptionStatus(sub._id)}
                          className="p-2 text-purple-700 dark:text-violet-300 hover:bg-purple-100 dark:hover:bg-violet-900/40 rounded"
                          title={sub.status === 'active' ? 'Pause subscription' : 'Activate subscription'}
                        >
                          {sub.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteSubscription(sub._id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete subscription"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 text-sm flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Subs:</span>
              <span className="font-semibold text-purple-700 dark:text-violet-300">{formatCurrency(totalSubscriptionCost)}</span>
            </div>
          </div>

          {/* Variable Expenses Section (right) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6 h-full flex flex-col md:min-h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Variable Expenses</h3>
            <div className="space-y-4 flex-1">
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Month Spending</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-rose-300">{formatCurrency(monthlyTransactionFlow.netFlow || 0)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Income {formatCurrency(monthlyTransactionFlow.totalIncome || 0)} - Expenses {formatCurrency(monthlyTransactionFlow.totalExpenses || 0)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-amber-900/30 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-amber-100 mb-2">Remaining After Bills</h4>
                <p className="text-2xl font-bold text-yellow-700 dark:text-amber-300">{formatCurrency(remainingAfterFixed)}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-violet-900/35 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-violet-100 mb-2">Available to Spend</h4>
                <p className="text-2xl font-bold text-purple-700 dark:text-violet-300">{formatCurrency(availableToSpend)}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Stocks P/L</h4>
                <p className={`text-2xl font-bold ${stockPnlInInr >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                  {formatCurrency(stockPnlInInr)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Current Value {formatCurrency(stockCurrentValueInInr)} | Invested {formatCurrency(stockInvestedValueInInr)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings & Tracker Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-6 mt-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold flex items-center"><TrendingUp className="h-6 w-6 mr-2" /> Monthly Savings</h3>
              <div className="flex space-x-2">
                <button onClick={() => { const a = prompt('Amount:'); if(a) addManualSavings(parseFloat(a)) }} className="px-2 py-1 bg-white/20 rounded text-xs">Add</button>
                <button onClick={() => { const a = prompt('Amount:'); if(a) withdrawManualSavings(parseFloat(a)) }} className="px-2 py-1 bg-white/20 rounded text-xs">Withdraw</button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2 break-words">{formatCurrency(currentMonthSavings)}</div>
              <p className="text-blue-100 text-sm">Tracked this month</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold flex items-center"><PiggyBank className="h-6 w-6 mr-2" /> Total Savings</h3>
              <div className="flex items-center"><Flame className="h-4 w-4 mr-1" /> <span>{cumulativeSavings.currentStreak}mo streak</span></div>
            </div>
            <div className="flex-1">
              <div className="text-center mb-4">
                <div className="text-3xl sm:text-4xl font-bold mb-2 break-words">{formatCurrency(totalSavingsValue)}</div>
                <p className="text-emerald-100 text-sm">Portfolio Value</p>
              </div>

              <div className="rounded-lg bg-white/12 border border-white/30 p-3 mb-3">
                <p className="text-sm font-semibold mb-2">Savings Goals (Items to Buy)</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Goal name (e.g. Laptop)"
                    value={purchaseGoalName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPurchaseGoalName(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-white/40 bg-white text-gray-900 placeholder:text-gray-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={purchaseGoalAmount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPurchaseGoalAmount(e.target.value)}
                    className="w-full sm:w-36 px-3 py-2 rounded-lg border border-white/40 bg-white text-gray-900 placeholder:text-gray-500"
                  />
                  <button
                    onClick={addPurchaseGoal}
                    className="px-3 py-2 rounded-lg bg-white/25 hover:bg-white/35 border border-white/40 text-sm font-semibold"
                  >
                    Add Goal
                  </button>
                </div>

                {purchaseGoals.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-28 overflow-y-auto pr-1">
                    {purchaseGoals.map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between bg-black/20 border border-white/20 rounded-lg px-2 py-1.5">
                        <span className="text-sm truncate pr-2">{goal.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold">{formatCurrency(goal.amount)}</span>
                          <button onClick={() => removePurchaseGoal(goal.id)} className="text-xs px-2 py-1 rounded bg-red-500/40 hover:bg-red-500/55 border border-red-300/40">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white/20 pt-3 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100">Goals Total</span>
                  <span className="font-semibold">{formatCurrency(purchaseGoalsTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100">After Goals</span>
                  <span className={`font-bold ${totalSavingsAfterGoals >= 0 ? 'text-white' : 'text-rose-200'}`}>
                    {formatCurrency(totalSavingsAfterGoals)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSubscriptionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingSubscription?._id ? 'Edit Subscription' : 'Add Subscription'}
              </h3>
              <button onClick={() => { setShowSubscriptionForm(false); setEditingSubscription(null) }}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subscription name"
                value={subscriptionForm.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSubscriptionForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <input
                type="text"
                placeholder="Provider"
                value={subscriptionForm.provider}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSubscriptionForm((prev) => ({ ...prev, provider: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <input
                type="number"
                placeholder="Monthly cost"
                value={subscriptionForm.monthlyCost}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSubscriptionForm((prev) => ({ ...prev, monthlyCost: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <select
                value={subscriptionForm.renewalDate}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubscriptionForm((prev) => ({ ...prev, renewalDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString().padStart(2, '0')}>
                    {day.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                value={subscriptionForm.category}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubscriptionForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Productivity">Productivity</option>
                <option value="Education">Education</option>
                <option value="Shopping">Shopping</option>
                <option value="Finance">Finance</option>
              </select>
              <button
                onClick={() => {
                  const name = subscriptionForm.name.trim()
                  const provider = subscriptionForm.provider.trim()
                  const monthlyCost = Number.parseFloat(subscriptionForm.monthlyCost || '0')
                  const renewalDate = subscriptionForm.renewalDate || '01'
                  const category = subscriptionForm.category || 'Entertainment'
                  if (name && provider && monthlyCost > 0) {
                    handleSubscriptionSubmit({ name, provider, monthlyCost, renewalDate, category })
                  }
                }}
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingSubscription?._id ? 'Update Subscription' : 'Add Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forms for Goals */}
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


