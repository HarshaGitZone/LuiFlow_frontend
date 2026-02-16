import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api'

export interface Budget {
  _id: string
  category: string
  amount: number
  spent: number
  remaining: number
  period: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface BudgetsState {
  budgets: Budget[]
  loading: boolean
  error: string | null
  summary: {
    totalBudgeted: number
    totalSpent: number
    totalRemaining: number
    utilizationRate: number
  }
}

const initialState: BudgetsState = {
  budgets: [],
  loading: false,
  error: null,
  summary: {
    totalBudgeted: 0,
    totalSpent: 0,
    totalRemaining: 0,
    utilizationRate: 0
  }
}

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (params: { isActive?: boolean; period?: string }) => {
    const response = await api.get('/api/budgets', { params })
    return response.data
  }
)

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt' | 'spent' | 'remaining'>) => {
    const response = await api.post('/api/budgets', budget)
    return response.data
  }
)

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, budget }: { id: string; budget: Partial<Budget> }) => {
    const response = await api.put(`/api/budgets/${id}`, budget)
    return response.data
  }
)

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string) => {
    await api.delete(`/api/budgets/${id}`)
    return id
  }
)

export const fetchBudgetSummary = createAsyncThunk(
  'budgets/fetchSummary',
  async (params: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/api/budgets/summary', { params })
    return response.data
  }
)

// Slice
const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateSpentAmount: (state, action: PayloadAction<{ category: string; amount: number }>) => {
      const budget = state.budgets.find(b => b.category === action.payload.category)
      if (budget) {
        budget.spent = action.payload.amount
        budget.remaining = budget.amount - budget.spent
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false
        state.budgets = action.payload.budgets || action.payload
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch budgets'
      })
      // Create budget
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload)
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create budget'
      })
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.budgets[index] = action.payload
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update budget'
      })
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter(b => b._id !== action.payload)
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete budget'
      })
      // Fetch summary
      .addCase(fetchBudgetSummary.fulfilled, (state, action) => {
        state.summary = action.payload
      })
      .addCase(fetchBudgetSummary.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch budget summary'
      })
  }
})

export const { clearError, updateSpentAmount } = budgetsSlice.actions
export default budgetsSlice.reducer
