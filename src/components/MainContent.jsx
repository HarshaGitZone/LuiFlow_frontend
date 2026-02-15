import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const MainContent = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarChange = (event) => {
      setIsCollapsed(event.detail)
    }
    
    window.addEventListener('sidebar-collapse', handleSidebarChange)
    
    return () => {
      window.removeEventListener('sidebar-collapse', handleSidebarChange)
    }
  }, [])

  // Calculate left padding based on sidebar state
  const leftPadding = isCollapsed ? 'pl-5' : 'pl-72'

  return (
    <main className={`flex-1 pt-4 p-8 bg-gray-50 overflow-y-auto transition-all duration-300 ${leftPadding}`}>
      {children}
    </main>
  )
}

export default MainContent
