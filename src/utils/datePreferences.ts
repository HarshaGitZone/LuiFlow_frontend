import { useState } from 'react'

export type DatePreferences = {
  dateFormat: string
  timeZone: string
}

export const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' }
]

export const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY'
export const DEFAULT_TIME_ZONE = 'UTC'

const DATE_PREFERENCES_KEY = 'date_preferences'

const buildNumericParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone
  })
  const parts = formatter.formatToParts(date)
  const map: Record<string, string> = {}
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value
    }
  }
  return map
}

const formatWithPattern = (date: Date, timeZone: string, pattern: string) => {
  if (pattern === 'MMM DD, YYYY') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      timeZone
    }).format(date)
  }

  const parts = buildNumericParts(date, timeZone)
  const year = parts.year || ''
  const month = parts.month || ''
  const day = parts.day || ''

  switch (pattern) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`
  }
}

export const getDatePreferences = (): DatePreferences => {
  try {
    const raw = localStorage.getItem(DATE_PREFERENCES_KEY)
    if (!raw) {
      return { dateFormat: DEFAULT_DATE_FORMAT, timeZone: DEFAULT_TIME_ZONE }
    }
    const parsed = JSON.parse(raw) as Partial<DatePreferences>
    return {
      dateFormat: parsed.dateFormat || DEFAULT_DATE_FORMAT,
      timeZone: parsed.timeZone || DEFAULT_TIME_ZONE
    }
  } catch {
    return { dateFormat: DEFAULT_DATE_FORMAT, timeZone: DEFAULT_TIME_ZONE }
  }
}

export const saveDatePreferences = (prefs: DatePreferences) => {
  try {
    localStorage.setItem(DATE_PREFERENCES_KEY, JSON.stringify(prefs))
  } catch {
    // ignore storage failures
  }
}

export const formatDateWithPreferences = (date: Date, prefs: DatePreferences) => {
  return formatWithPattern(date, prefs.timeZone || DEFAULT_TIME_ZONE, prefs.dateFormat || DEFAULT_DATE_FORMAT)
}

export const useDateFormatter = () => {
  const [dateFormat, setDateFormat] = useState('MMM DD, YYYY')

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj)
  }

  return { formatDate, dateFormat, setDateFormat }
}
