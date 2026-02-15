import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const MainContent = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  useEffect(() => {
    const handleSidebarChange = (event) => {
      setIsCollapsed(event.detail)
    }
    
    window.addEventListener('sidebar-collapse', handleSidebarChange)
    
    return () => {
      window.removeEventListener('sidebar-collapse', handleSidebarChange)
    }
  }, [])

  const leftPadding = isCollapsed ? 'pl-24' : 'pl-72'

  return (
    <main className={`flex-1 pt-4 pr-8 pb-8 ${leftPadding} bg-gray-50 overflow-y-auto transition-all duration-300`}>
      {children}
    </main>
  )
}

export default MainContent
