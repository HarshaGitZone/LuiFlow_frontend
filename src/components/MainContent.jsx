import React from 'react'

const MainContent = ({ children }) => {
  return (
    <main className="flex-1 pt-4 p-8 bg-gray-50 overflow-y-auto">
      {children}
    </main>
  )
}

export default MainContent
