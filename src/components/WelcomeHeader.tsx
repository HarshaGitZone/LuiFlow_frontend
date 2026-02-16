import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'

const WelcomeHeader: React.FC = () => {
  const { user } = useAuth()
  const { formatAmount } = useCurrency()

  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {getGreeting()}, {user?.name || 'User'}! 👋
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Welcome to your financial dashboard. Today is {getCurrentDate()}.
      </p>
    </div>
  )
}

export default WelcomeHeader
