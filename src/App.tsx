import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Calendar from './pages/Calendar'
import DebtManager from './pages/DebtManager'
import Import from './pages/Import'
import Budgets from './pages/Budgets'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import SalaryPlanner from './pages/SalaryPlanner'
import Stocks from './pages/Stocks'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function App(): React.ReactElement {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
        <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
        <Route path="/debt-manager" element={<Layout><DebtManager /></Layout>} />
        <Route path="/import" element={<Layout><Import /></Layout>} />
        <Route path="/budgets" element={<Layout><Budgets /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
        <Route path="/salary-planner" element={<Layout><SalaryPlanner /></Layout>} />
        <Route path="/stocks" element={<Layout><Stocks /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
