import React, { useState, useEffect, ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true')
  
  useEffect(() => {
    const handleSidebarChange = (event: CustomEvent<boolean>) => {
      setIsCollapsed(event.detail)
    }
    
    window.addEventListener('sidebar-collapse', handleSidebarChange as EventListener)
    
    return () => {
      window.removeEventListener('sidebar-collapse', handleSidebarChange as EventListener)
    }
  }, [])

  const leftPadding = isCollapsed ? 'pl-24' : 'pl-72'

  return (
    <main className={`flex-1 pt-4 pr-8 pb-8 ${leftPadding} bg-gray-50 dark:bg-slate-950 overflow-y-auto transition-all duration-300`}>
      {children}
    </main>
  )
}

export default MainContent
