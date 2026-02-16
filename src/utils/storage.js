// Storage utility for persistent state management

const STORAGE_KEYS = {
  CSV_IMPORT_STATE: 'csv_import_state',
  USER_PREFERENCES: 'user_preferences',
  AUTH_TOKEN: 'auth_token'
}

// Generic storage operations
export const storage = {
  // Save data to localStorage
  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
    }
  },

  // Get data from localStorage
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return defaultValue
    }
  },

  // Remove data from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

// CSV Import State Management
export const csvImportStorage = {
  // Save import state
  saveState: (state) => {
    const importState = {
      file: state.file ? {
        name: state.file.name,
        size: state.file.size,
        type: state.file.type,
        lastModified: state.file.lastModified
      } : null,
      preview: state.preview,
      columnMapping: state.columnMapping,
      importStep: state.importStep,
      importResult: state.importResult,
      dryRunResult: state.dryRunResult,
      currentPage: state.currentPage,
      timestamp: Date.now()
    }
    storage.set(STORAGE_KEYS.CSV_IMPORT_STATE, importState)
  },

  // Load import state
  loadState: () => {
    const state = storage.get(STORAGE_KEYS.CSV_IMPORT_STATE)
    
    // Clear state if it's older than 24 hours to prevent stale data
    if (state && state.timestamp && (Date.now() - state.timestamp) > 24 * 60 * 60 * 1000) {
      storage.remove(STORAGE_KEYS.CSV_IMPORT_STATE)
      return null
    }
    
    return state
  },

  // Clear import state
  clearState: () => {
    storage.remove(STORAGE_KEYS.CSV_IMPORT_STATE)
  },

  // Check if there's a saved state
  hasState: () => {
    const state = storage.get(STORAGE_KEYS.CSV_IMPORT_STATE)
    return state && state.timestamp && (Date.now() - state.timestamp) < 24 * 60 * 60 * 1000
  }
}

// User Preferences Management
export const preferencesStorage = {
  savePreferences: (preferences) => {
    storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences)
  },

  loadPreferences: () => {
    return storage.get(STORAGE_KEYS.USER_PREFERENCES, {
      theme: 'light',
      currency: 'INR',
      dateFormat: 'MMM DD, YYYY',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    })
  },

  clearPreferences: () => {
    storage.remove(STORAGE_KEYS.USER_PREFERENCES)
  }
}

// Auth Token Management
export const authStorage = {
  saveToken: (token) => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token)
  },

  getToken: () => {
    return storage.get(STORAGE_KEYS.AUTH_TOKEN)
  },

  clearToken: () => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN)
  }
}

// Clear all user data on logout
export const clearUserData = () => {
  storage.remove(STORAGE_KEYS.CSV_IMPORT_STATE)
  storage.remove(STORAGE_KEYS.USER_PREFERENCES)
  storage.remove(STORAGE_KEYS.AUTH_TOKEN)
}
