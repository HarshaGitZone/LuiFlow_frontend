import React from 'react'

const MainContent = ({ children }) => {
  return (
    <main className="flex-1 p-8 bg-gray-50">
      {children}
    </main>
  )
}

export default MainContent
