import { useCallback, useEffect, useMemo, useState } from 'react'
import { preferencesStorage } from './storage'

export const DEFAULT_DATE_FORMAT = 'MMM DD, YYYY'
export const DEFAULT_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export const DATE_FORMAT_OPTIONS = [
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Feb 16, 2026)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (16/02/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (02/16/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-02-16)' },
  { value: 'MMMM DD, YYYY', label: 'MMMM DD, YYYY (February 16, 2026)' }
]

const DATE_PREFERENCES_EVENT = 'date-preferences-updated'
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime())

const toDate = (value) => {
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const safeTimeZone = (timeZone) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
    return timeZone
  } catch (error) {
    return 'UTC'
  }
}

const getDateParts = (date, timeZone) => {
  const tz = safeTimeZone(timeZone)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)

  const partMap = {}
  for (const part of parts) {
    if (part.type !== 'literal') {
      partMap[part.type] = part.value
    }
  }

  const year = Number(partMap.year)
  const month = Number(partMap.month)
  const day = Number(partMap.day)

  return {
    year,
    month,
    day,
    monthShort: MONTH_SHORT[month - 1],
    monthLong: MONTH_LONG[month - 1],
    dd: String(day).padStart(2, '0'),
    mm: String(month).padStart(2, '0')
  }
}

const formatByPattern = (date, dateFormat, timeZone) => {
  const parts = getDateParts(date, timeZone)

  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return `${parts.dd}/${parts.mm}/${parts.year}`
    case 'MM/DD/YYYY':
      return `${parts.mm}/${parts.dd}/${parts.year}`
    case 'YYYY-MM-DD':
      return `${parts.year}-${parts.mm}-${parts.dd}`
    case 'MMMM DD, YYYY':
      return `${parts.monthLong} ${parts.dd}, ${parts.year}`
    case 'MMM DD, YYYY':
    default:
      return `${parts.monthShort} ${parts.dd}, ${parts.year}`
  }
}

export const getDatePreferences = () => {
  const preferences = preferencesStorage.loadPreferences() || {}
  return {
    dateFormat: preferences.dateFormat || DEFAULT_DATE_FORMAT,
    timeZone: preferences.timeZone || DEFAULT_TIME_ZONE
  }
}

export const saveDatePreferences = ({ dateFormat, timeZone }) => {
  const current = preferencesStorage.loadPreferences() || {}
  const next = {
    ...current,
    dateFormat: dateFormat || current.dateFormat || DEFAULT_DATE_FORMAT,
    timeZone: timeZone || current.timeZone || DEFAULT_TIME_ZONE
  }

  preferencesStorage.savePreferences(next)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATE_PREFERENCES_EVENT, { detail: next }))
  }

  return next
}

export const formatDateWithPreferences = (value, options = {}) => {
  const date = toDate(value)
  if (!isValidDate(date)) return '-'

  const preferences = getDatePreferences()
  const dateFormat = options.dateFormat || preferences.dateFormat
  const timeZone = options.timeZone || preferences.timeZone

  return formatByPattern(date, dateFormat, timeZone)
}

export const formatDateTimeWithPreferences = (value, options = {}) => {
  const date = toDate(value)
  if (!isValidDate(date)) return '-'

  const preferences = getDatePreferences()
  const dateFormat = options.dateFormat || preferences.dateFormat
  const timeZone = safeTimeZone(options.timeZone || preferences.timeZone)

  const dateText = formatByPattern(date, dateFormat, timeZone)
  const timeText = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)

  return `${dateText} ${timeText}`
}

export const formatMonthYearWithPreferences = (value, options = {}) => {
  const date = toDate(value)
  if (!isValidDate(date)) return '-'

  const preferences = getDatePreferences()
  const timeZone = safeTimeZone(options.timeZone || preferences.timeZone)
  const month = options.month || 'long'

  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month,
    year: 'numeric'
  }).format(date)
}

export const formatLongDateWithPreferences = (value, options = {}) => {
  const date = toDate(value)
  if (!isValidDate(date)) return '-'

  const preferences = getDatePreferences()
  const timeZone = safeTimeZone(options.timeZone || preferences.timeZone)

  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export const useDateFormatter = () => {
  const [preferences, setPreferences] = useState(getDatePreferences())

  useEffect(() => {
    const handlePreferencesUpdate = (event) => {
      if (event?.detail?.dateFormat || event?.detail?.timeZone) {
        setPreferences({
          dateFormat: event.detail.dateFormat || DEFAULT_DATE_FORMAT,
          timeZone: event.detail.timeZone || DEFAULT_TIME_ZONE
        })
      } else {
        setPreferences(getDatePreferences())
      }
    }

    const handleStorageUpdate = (event) => {
      if (!event.key || event.key === 'user_preferences') {
        setPreferences(getDatePreferences())
      }
    }

    window.addEventListener(DATE_PREFERENCES_EVENT, handlePreferencesUpdate)
    window.addEventListener('storage', handleStorageUpdate)

    return () => {
      window.removeEventListener(DATE_PREFERENCES_EVENT, handlePreferencesUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
    }
  }, [])

  const formatDate = useCallback((value, options = {}) => formatDateWithPreferences(value, {
    dateFormat: options.dateFormat || preferences.dateFormat,
    timeZone: options.timeZone || preferences.timeZone
  }), [preferences.dateFormat, preferences.timeZone])

  const formatDateTime = useCallback((value, options = {}) => formatDateTimeWithPreferences(value, {
    dateFormat: options.dateFormat || preferences.dateFormat,
    timeZone: options.timeZone || preferences.timeZone
  }), [preferences.dateFormat, preferences.timeZone])

  const formatMonthYear = useCallback((value, options = {}) => formatMonthYearWithPreferences(value, {
    ...options,
    timeZone: options.timeZone || preferences.timeZone
  }), [preferences.timeZone])

  const formatLongDate = useCallback((value, options = {}) => formatLongDateWithPreferences(value, {
    ...options,
    timeZone: options.timeZone || preferences.timeZone
  }), [preferences.timeZone])

  return useMemo(() => ({
    dateFormat: preferences.dateFormat,
    timeZone: preferences.timeZone,
    formatDate,
    formatDateTime,
    formatMonthYear,
    formatLongDate
  }), [preferences.dateFormat, preferences.timeZone, formatDate, formatDateTime, formatMonthYear, formatLongDate])
}
