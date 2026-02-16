import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const WelcomeHeader: React.FC = () => {
  const { user } = useAuth()
  const [currentMessage, setCurrentMessage] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  
  const rotatingMessages = [
    "Let's track your spending today.",
    "Ready to review this month's budget?",
    "Import your CSV in seconds.",
    "Your money, clearly explained."
  ]

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedDashboard')
    
    if (!hasVisited && user?.name) {
      setShowWelcome(true)
      sessionStorage.setItem('hasVisitedDashboard', 'true')
      
      setTimeout(() => {
        setShowWelcome(false)
      }, 5000)
    }

    const interval = setInterval(() => {
      if (!showWelcome) {
        setCurrentMessage((prev) => (prev + 1) % rotatingMessages.length)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user?.name, showWelcome])

  const displayMessage = showWelcome 
    ? `Welcome back, ${user?.name || 'User'} 👋` 
    : rotatingMessages[currentMessage]

  return (
    <div className="mb-8 flex justify-center">
      <h1 className="text-4xl font-light text-gray-900 mb-2 animate-fade-in text-center tracking-wide">
        {displayMessage}
      </h1>
    </div>
  )
}

export default WelcomeHeader
