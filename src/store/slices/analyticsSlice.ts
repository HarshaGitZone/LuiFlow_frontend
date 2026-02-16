import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api'

export interface AnalyticsData {
  totalIncome: number
  totalExpenses: number
  netFlow: number
  categoryBreakdown: Array<{
    category: string
    amount: number
    type: 'income' | 'expense'
    percentage: number
  }>
  monthlyTrends: Array<{
    month: string
    income: number
    expenses: number
    netFlow: number
  }>
  topSpendingCategories: Array<{
    category: string
    amount: number
    count: number
  }>
  budgetComparison: Array<{
    category: string
    budgeted: number
    actual: number
    variance: number
    percentage: number
  }>
  periodComparison: {
    currentPeriod: {
      income: number
      expenses: number
      netFlow: number
    }
    previousPeriod: {
      income: number
      expenses: number
      netFlow: number
    }
    incomeChange: number
    expenseChange: number
    netFlowChange: number
  }
}

interface AnalyticsState {
  data: AnalyticsData | null
  loading: boolean
  error: string | null
  dateRange: {
    startDate: string
    endDate: string
  }
  comparison: {
    type: 'month' | 'quarter' | 'year'
    periods: number
  }
}

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
  dateRange: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date().toISOString()
  },
  comparison: {
    type: 'month',
    periods: 1
  }
}

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (params: { startDate?: string; endDate?: string; comparisonType?: string }) => {
    const response = await api.get('/api/analytics', { params })
    return response.data
  }
)

export const fetchCategoryBreakdown = createAsyncThunk(
  'analytics/fetchCategoryBreakdown',
  async (params: { type: 'income' | 'expense'; startDate?: string; endDate?: string }) => {
    const response = await api.get('/api/analytics/category-breakdown', { params })
    return response.data
  }
)

export const fetchMonthlyTrends = createAsyncThunk(
  'analytics/fetchMonthlyTrends',
  async (params: { months?: number }) => {
    const response = await api.get('/api/analytics/monthly-trends', { params })
    return response.data
  }
)

export const fetchBudgetComparison = createAsyncThunk(
  'analytics/fetchBudgetComparison',
  async (params: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/api/analytics/budget-comparison', { params })
    return response.data
  }
)

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.dateRange = action.payload
    },
    setComparison: (state, action: PayloadAction<Partial<AnalyticsState['comparison']>>) => {
      state.comparison = { ...state.comparison, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch analytics'
      })
      // Fetch category breakdown
      .addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
        if (state.data) {
          state.data.categoryBreakdown = action.payload
        }
      })
      .addCase(fetchCategoryBreakdown.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch category breakdown'
      })
      // Fetch monthly trends
      .addCase(fetchMonthlyTrends.fulfilled, (state, action) => {
        if (state.data) {
          state.data.monthlyTrends = action.payload
        }
      })
      .addCase(fetchMonthlyTrends.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch monthly trends'
      })
      // Fetch budget comparison
      .addCase(fetchBudgetComparison.fulfilled, (state, action) => {
        if (state.data) {
          state.data.budgetComparison = action.payload
        }
      })
      .addCase(fetchBudgetComparison.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch budget comparison'
      })
  }
})

export const { setDateRange, setComparison, clearError } = analyticsSlice.actions
export default analyticsSlice.reducer
