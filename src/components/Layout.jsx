import React from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <MainContent>
          {children}
        </MainContent>
      </div>
    </div>
  )
}

export default Layout
