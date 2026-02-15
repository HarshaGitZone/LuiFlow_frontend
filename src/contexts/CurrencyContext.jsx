import React, { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('₹') 
  
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency')
    if (savedCurrency) {
      setCurrency(savedCurrency)
    } else {
      localStorage.setItem('selectedCurrency', '₹')
    }
  }, [])
  
  const formatAmount = (amount) => {
    return `${currency}${Math.abs(amount).toFixed(2)}`
  }
  
  const formatAmountWithSign = (amount, type) => {
    const sign = type === 'income' ? '+' : '-'
    return `${sign}${currency}${Math.abs(amount).toFixed(2)}`
  }

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatAmount,
      formatAmountWithSign
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}
