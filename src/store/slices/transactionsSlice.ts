import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api'

export interface Transaction {
  _id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  tags?: string[]
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

interface TransactionsState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    type?: 'income' | 'expense'
    category?: string
    search?: string
    startDate?: string
    endDate?: string
  }
}

const initialState: TransactionsState = {
  transactions: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  },
  filters: {}
}

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params: { page?: number; limit?: number; filters?: Partial<TransactionsState['filters']> }) => {
    const response = await api.get('/api/transactions', { params })
    return response.data
  }
)

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transaction: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/api/transactions', transaction)
    return response.data
  }
)

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transaction }: { id: string; transaction: Partial<Transaction> }) => {
    const response = await api.put(`/api/transactions/${id}`, transaction)
    return response.data
  }
)

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string) => {
    await api.delete(`/api/transactions/${id}`)
    return id
  }
)

export const fetchTransactionsSummary = createAsyncThunk(
  'transactions/fetchSummary',
  async () => {
    const response = await api.get('/api/transactions/summary')
    return response.data
  }
)

// Slice
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TransactionsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload.transactions
        state.pagination = action.payload.pagination
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch transactions'
      })
      // Create transaction
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload)
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create transaction'
      })
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t._id === action.payload._id)
        if (index !== -1) {
          state.transactions[index] = action.payload
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update transaction'
      })
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t._id !== action.payload)
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete transaction'
      })
  }
})

export const { setFilters, clearFilters, clearError } = transactionsSlice.actions
export default transactionsSlice.reducer
