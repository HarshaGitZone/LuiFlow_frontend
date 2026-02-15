import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  Upload, 
  PiggyBank, 
  TrendingUp, 
  Settings,
  User,
  Menu,
  X
} from 'lucide-react'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Import', href: '/import', icon: Upload },
    { name: 'Budgets', href: '/budgets', icon: PiggyBank },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    // { name: 'Profile', href: '/profile', icon: User },
    // { name: 'Settings', href: '/settings', icon: Settings },
  ]

  // Emit custom event when sidebar state changes
  const handleCollapseToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    window.dispatchEvent(new CustomEvent('sidebar-collapse', { detail: newState }))
  }

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out fixed left-0 top-16 z-30 h-screen`}>
      <button
        onClick={handleCollapseToggle}
        className="absolute -right-3 top-8 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200 z-10"
      >
        {isCollapsed ? (
          <Menu className="h-4 w-4 text-gray-600 hover:text-gray-900" />
        ) : (
          <X className="h-4 w-4 text-gray-600 hover:text-gray-900" />
        )}
      </button>
      
      {/* Logo */}
      <div className={`p-6 ${isCollapsed ? 'text-center' : ''}`}>
        <h1 className={`${isCollapsed ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 transition-all duration-300`}>
          {isCollapsed ? 'LF' : 'LuiFlow'}
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className={`mt-6 ${isCollapsed ? 'px-2' : ''}`}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'px-6 py-3'} text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon className={`${isCollapsed ? 'mx-0' : 'mr-3'} h-5 w-5 transition-all duration-300`} />
              {!isCollapsed && <span className="transition-all duration-300">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar
