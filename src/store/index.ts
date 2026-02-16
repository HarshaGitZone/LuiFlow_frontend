import { configureStore } from '@reduxjs/toolkit'
import transactionsReducer from './slices/transactionsSlice'
import analyticsReducer from './slices/analyticsSlice'
import budgetsReducer from './slices/budgetsSlice'
import importReducer from './slices/importSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    analytics: analyticsReducer,
    budgets: budgetsReducer,
    import: importReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
