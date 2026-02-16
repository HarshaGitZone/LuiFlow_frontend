import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
    autoClose?: boolean
  }>
  modals: {
    addTransaction: boolean
    editTransaction: boolean
    deleteConfirm: boolean
    budgetForm: boolean
    importProgress: boolean
    filterPanel: boolean
  }
  loading: {
    global: boolean
    transactions: boolean
    analytics: boolean
    budgets: boolean
    import: boolean
  }
  filters: {
    transactions: {
      search: string
      type: 'all' | 'income' | 'expense'
      category: string
      dateRange: {
        startDate: string
        endDate: string
      }
      sortBy: 'date' | 'amount' | 'category' | 'description'
      sortOrder: 'asc' | 'desc'
    }
    analytics: {
      period: 'month' | 'quarter' | 'year'
      dateRange: {
        startDate: string
        endDate: string
      }
    }
  }
  preferences: {
    currency: string
    dateFormat: string
    pageSize: number
    autoRefresh: boolean
    compactView: boolean
  }
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  modals: {
    addTransaction: false,
    editTransaction: false,
    deleteConfirm: false,
    budgetForm: false,
    importProgress: false,
    filterPanel: false
  },
  loading: {
    global: false,
    transactions: false,
    analytics: false,
    budgets: false,
    import: false
  },
  filters: {
    transactions: {
      search: '',
      type: 'all',
      category: '',
      dateRange: {
        startDate: '',
        endDate: ''
      },
      sortBy: 'date',
      sortOrder: 'desc'
    },
    analytics: {
      period: 'month',
      dateRange: {
        startDate: '',
        endDate: ''
      }
    }
  },
  preferences: {
    currency: 'INR',
    dateFormat: 'MMM DD, YYYY',
    pageSize: 50,
    autoRefresh: true,
    compactView: false
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now()
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false
      })
    },
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
    updateTransactionFilters: (state, action: PayloadAction<Partial<UIState['filters']['transactions']>>) => {
      state.filters.transactions = { ...state.filters.transactions, ...action.payload }
    },
    resetTransactionFilters: (state) => {
      state.filters.transactions = initialState.filters.transactions
    },
    updateAnalyticsFilters: (state, action: PayloadAction<Partial<UIState['filters']['analytics']>>) => {
      state.filters.analytics = { ...state.filters.analytics, ...action.payload }
    },
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    }
  }
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setGlobalLoading,
  updateTransactionFilters,
  resetTransactionFilters,
  updateAnalyticsFilters,
  updatePreferences
} = uiSlice.actions

export default uiSlice.reducer
