import { useState, useEffect } from 'react'

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
