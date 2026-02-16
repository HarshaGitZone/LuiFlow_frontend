import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api'

export interface ImportHistory {
  _id: string
  fileName: string
  status: 'success' | 'partial' | 'failed'
  summary: {
    totalRows: number
    insertedRows: number
    skippedRows: number
    duplicateRows: number
    errors: number
  }
  importDate: string
  errors?: Array<{
    row: number
    error: string
    data?: any
  }>
}

export interface ImportSession {
  id: string
  file: File | null
  preview: {
    headers: string[]
    data: any[]
    pagination: {
      page: number
      limit: number
      totalRows: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
  columnMapping: Record<string, string>
  importStep: 'upload' | 'mapping' | 'validation' | 'import' | 'complete'
  importResult: {
    success: boolean
    summary: {
      totalRows: number
      insertedRows: number
      skippedRows: number
      duplicateRows: number
      errors: number
    }
    errors: Array<{
      row: number
      error: string
      data?: any
    }>
  } | null
  dryRunResult: {
    success: boolean
    dryRun: boolean
    summary: {
      totalRows: number
      validRows: number
      errorRows: number
      duplicateRows: number
      totalErrors: number
    }
    validation: {
      validTransactions: any[]
      errors: any[]
      duplicates: any[]
    }
  } | null
  currentPage: number
  isProcessing: boolean
  progress: {
    current: number
    total: number
    percentage: number
  }
  concurrentImports: number
}

interface ImportState {
  session: ImportSession | null
  history: ImportHistory[]
  loading: boolean
  error: string | null
  settings: {
    maxConcurrentImports: number
    chunkSize: number
    retryAttempts: number
  }
}

const initialState: ImportState = {
  session: null,
  history: [],
  loading: false,
  error: null,
  settings: {
    maxConcurrentImports: 3,
    chunkSize: 100,
    retryAttempts: 3
  }
}

// Async thunks
export const previewCSV = createAsyncThunk(
  'import/previewCSV',
  async (params: { file: File; page?: number; limit?: number }) => {
    const formData = new FormData()
    formData.append('file', params.file)
    if (params.page) formData.append('page', params.page.toString())
    if (params.limit) formData.append('limit', params.limit.toString())

    const response = await api.post('/api/csv/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
)

export const dryRunImport = createAsyncThunk(
  'import/dryRunImport',
  async (params: { file: File; columnMapping: Record<string, string> }) => {
    const formData = new FormData()
    formData.append('file', params.file)
    formData.append('columnMapping', JSON.stringify(params.columnMapping))

    const response = await api.post('/api/csv/dry-run', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
)

export const importCSV = createAsyncThunk(
  'import/importCSV',
  async (params: { file: File; columnMapping: Record<string, string> }) => {
    const formData = new FormData()
    formData.append('file', params.file)
    formData.append('columnMapping', JSON.stringify(params.columnMapping))

    const response = await api.post('/api/csv/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
)

export const fetchImportHistory = createAsyncThunk(
  'import/fetchHistory',
  async () => {
    const response = await api.get('/api/csv/history')
    return response.data
  }
)

export const retryFailedRows = createAsyncThunk(
  'import/retryFailedRows',
  async (params: { sessionId: string; rows: any[]; columnMapping: Record<string, string> }) => {
    const response = await api.post('/api/csv/retry', params)
    return response.data
  }
)

// Slice
const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    startNewSession: (state) => {
      state.session = {
        id: Date.now().toString(),
        file: null,
        preview: {
          headers: [],
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            totalRows: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        columnMapping: {},
        importStep: 'upload',
        importResult: null,
        dryRunResult: null,
        currentPage: 1,
        isProcessing: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0
        },
        concurrentImports: 0
      }
    },
    updateSession: (state, action: PayloadAction<Partial<ImportSession>>) => {
      if (state.session) {
        state.session = { ...state.session, ...action.payload }
      }
    },
    setColumnMapping: (state, action: PayloadAction<Record<string, string>>) => {
      if (state.session) {
        state.session.columnMapping = action.payload
      }
    },
    setImportStep: (state, action: PayloadAction<ImportSession['importStep']>) => {
      if (state.session) {
        state.session.importStep = action.payload
      }
    },
    updateProgress: (state, action: PayloadAction<Partial<ImportSession['progress']>>) => {
      if (state.session) {
        state.session.progress = { ...state.session.progress, ...action.payload }
      }
    },
    clearSession: (state) => {
      state.session = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateSettings: (state, action: PayloadAction<Partial<ImportState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Preview CSV
      .addCase(previewCSV.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(previewCSV.fulfilled, (state, action) => {
        state.loading = false
        if (state.session) {
          state.session.preview = action.payload
        }
      })
      .addCase(previewCSV.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to preview CSV'
      })
      // Dry run import
      .addCase(dryRunImport.pending, (state) => {
        state.loading = true
        state.error = null
        if (state.session) {
          state.session.isProcessing = true
        }
      })
      .addCase(dryRunImport.fulfilled, (state, action) => {
        state.loading = false
        if (state.session) {
          state.session.dryRunResult = action.payload
          state.session.isProcessing = false
        }
      })
      .addCase(dryRunImport.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to validate CSV'
        if (state.session) {
          state.session.isProcessing = false
        }
      })
      // Import CSV
      .addCase(importCSV.pending, (state) => {
        state.loading = true
        state.error = null
        if (state.session) {
          state.session.isProcessing = true
          state.session.progress = { current: 0, total: 0, percentage: 0 }
        }
      })
      .addCase(importCSV.fulfilled, (state, action) => {
        state.loading = false
        if (state.session) {
          state.session.importResult = action.payload
          state.session.isProcessing = false
          state.session.importStep = 'complete'
        }
      })
      .addCase(importCSV.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to import CSV'
        if (state.session) {
          state.session.isProcessing = false
        }
      })
      // Fetch history
      .addCase(fetchImportHistory.fulfilled, (state, action) => {
        state.history = action.payload
      })
      .addCase(fetchImportHistory.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch import history'
      })
      // Retry failed rows
      .addCase(retryFailedRows.fulfilled, (state, action) => {
        if (state.session && state.session.importResult) {
          state.session.importResult = action.payload
        }
      })
      .addCase(retryFailedRows.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to retry failed rows'
      })
  }
})

export const {
  startNewSession,
  updateSession,
  setColumnMapping,
  setImportStep,
  updateProgress,
  clearSession,
  clearError,
  updateSettings
} = importSlice.actions

export default importSlice.reducer
