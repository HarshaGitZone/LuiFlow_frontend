// import React, { useState, useEffect } from 'react'
// import { User, Mail, Lock, Save, Eye, EyeOff, Camera } from 'lucide-react'
// import { useAuth } from '../contexts/AuthContext'
// import { api } from '../api'
// import API from '../api'

// interface UserProfile {
//   name: string
//   email: string
//   createdAt: string
//   lastLogin?: string
// }

// interface PasswordForm {
//   currentPassword: string
//   newPassword: string
//   confirmPassword: string
// }

// const Profile: React.FC = () => {
//   const { user, updateUser } = useAuth()
//   const [profile, setProfile] = useState<UserProfile>({
//     name: '',
//     email: '',
//     createdAt: ''
//   })
//   const [passwordForm, setPasswordForm] = useState<PasswordForm>({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   })
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false)
//   const [showNewPassword, setShowNewPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [passwordLoading, setPasswordLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

//   useEffect(() => {
//     if (user) {
//       setProfile({
//         name: user.name || '',
//         email: user.email || '',
//         createdAt: user.createdAt || ''
//       })
//     }
//   }, [user])

//   const handleProfileSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     setSuccess('')

//     try {
//       await api.put('/api/auth/profile', {
//         name: profile.name,
//         email: profile.email
//       })
      
//       if (updateUser) {
//         updateUser({ name: profile.name, email: profile.email })
//       }
      
//       setSuccess('Profile updated successfully!')
//     } catch (error: any) {
//       setError(error.response?.data?.error || 'Failed to update profile')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePasswordSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       setError('New passwords do not match')
//       return
//     }

//     if (passwordForm.newPassword.length < 6) {
//       setError('Password must be at least 6 characters long')
//       return
//     }

//     setPasswordLoading(true)
//     setError('')
//     setSuccess('')

//     try {
//       await api.put(API.UPDATE_PASSWORD, {
//         currentPassword: passwordForm.currentPassword,
//         newPassword: passwordForm.newPassword
//       })
      
//       setSuccess('Password updated successfully!')
//       setPasswordForm({
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//       })
//     } catch (error: any) {
//       setError(error.response?.data?.error || 'Failed to update password')
//     } finally {
//       setPasswordLoading(false)
//     }
//   }

//   const getPasswordStrength = (password: string): { score: number; feedback: string[] } => {
//     let strength = 0
//     const feedback: string[] = []

//     if (password.length >= 8) {
//       strength += 1
//     } else {
//       feedback.push('Password should be at least 8 characters')
//     }

//     if (/[a-z]/.test(password)) {
//       strength += 1
//     } else {
//       feedback.push('Include lowercase letters')
//     }

//     if (/[A-Z]/.test(password)) {
//       strength += 1
//     } else {
//       feedback.push('Include uppercase letters')
//     }

//     if (/[0-9]/.test(password)) {
//       strength += 1
//     } else {
//       feedback.push('Include numbers')
//     }

//     if (/[^a-zA-Z0-9]/.test(password)) {
//       strength += 1
//     } else {
//       feedback.push('Include special characters')
//     }

//     return { score: strength, feedback }
//   }

//   const passwordStrength = getPasswordStrength(passwordForm.newPassword)

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
//         <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
//       </div>

//       {/* Error/Success Messages */}
//       {error && (
//         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
//           {success}
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
//         <div className="border-b border-gray-200 dark:border-slate-700">
//           <nav className="flex -mb-px">
//             <button
//               onClick={() => setActiveTab('profile')}
//               className={`py-2 px-4 border-b-2 font-medium text-sm ${
//                 activeTab === 'profile'
//                   ? 'border-primary dark:border-primary-light text-primary dark:text-primary-light'
//                   : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//               }`}
//             >
//               <User className="h-4 w-4 mr-2 inline" />
//               Profile Information
//             </button>
//             <button
//               onClick={() => setActiveTab('password')}
//               className={`py-2 px-4 border-b-2 font-medium text-sm ${
//                 activeTab === 'password'
//                   ? 'border-primary dark:border-primary-light text-primary dark:text-primary-light'
//                   : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//               }`}
//             >
//               <Lock className="h-4 w-4 mr-2 inline" />
//               Change Password
//             </button>
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Profile Tab */}
//           {activeTab === 'profile' && (
//             <form onSubmit={handleProfileSubmit}>
//               <div className="space-y-6">
//                 {/* Profile Picture */}
//                 <div className="flex items-center space-x-6">
//                   <div className="flex-shrink-0">
//                     <div className="relative">
//                       <div className="w-20 h-20 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
//                         <User className="h-10 w-10 text-gray-500 dark:text-gray-400" />
//                       </div>
//                       <button
//                         type="button"
//                         className="absolute bottom-0 right-0 bg-primary dark:bg-primary-light text-white rounded-full p-1 hover:bg-primary-dark dark:hover:bg-primary"
//                       >
//                         <Camera className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Picture</h3>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size of 2MB</p>
//                   </div>
//                 </div>

//                 {/* Profile Fields */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Name
//                     </label>
//                     <div className="mt-1 relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <User className="h-5 w-5 text-gray-400" />
//                       </div>
//                       <input
//                         type="text"
//                         id="name"
//                         value={profile.name}
//                         onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
//                         className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Email
//                     </label>
//                     <div className="mt-1 relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Mail className="h-5 w-5 text-gray-400" />
//                       </div>
//                       <input
//                         type="email"
//                         id="email"
//                         value={profile.email}
//                         onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
//                         className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Account Information */}
//                 <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
//                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                         {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
//                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                         {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-50"
//                 >
//                   <Save className="h-4 w-4 mr-2" />
//                   {loading ? 'Saving...' : 'Save Changes'}
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* Password Tab */}
//           {activeTab === 'password' && (
//             <form onSubmit={handlePasswordSubmit}>
//               <div className="space-y-6">
//                 <div>
//                   <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Current Password
//                   </label>
//                   <div className="mt-1 relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Lock className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       type={showCurrentPassword ? 'text' : 'password'}
//                       id="currentPassword"
//                       value={passwordForm.currentPassword}
//                       onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
//                       className="pl-10 pr-10 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//                       required
//                     />
//                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                       <button
//                         type="button"
//                         onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                         className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
//                       >
//                         {showCurrentPassword ? (
//                           <EyeOff className="h-5 w-5" />
//                         ) : (
//                           <Eye className="h-5 w-5" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     New Password
//                   </label>
//                   <div className="mt-1 relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Lock className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       type={showNewPassword ? 'text' : 'password'}
//                       id="newPassword"
//                       value={passwordForm.newPassword}
//                       onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
//                       className="pl-10 pr-10 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//                       required
//                     />
//                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                       <button
//                         type="button"
//                         onClick={() => setShowNewPassword(!showNewPassword)}
//                         className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
//                       >
//                         {showNewPassword ? (
//                           <EyeOff className="h-5 w-5" />
//                         ) : (
//                           <Eye className="h-5 w-5" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
                  
//                   {/* Password Strength Indicator */}
//                   {passwordForm.newPassword && (
//                     <div className="mt-2">
//                       <div className="flex items-center justify-between mb-1">
//                         <span className="text-xs text-gray-600 dark:text-gray-400">Password strength</span>
//                         <span className="text-xs text-gray-600 dark:text-gray-400">
//                           {passwordStrength.score}/5
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
//                         <div
//                           className={`h-2 rounded-full transition-all duration-300 ${
//                             passwordStrength.score <= 2
//                               ? 'bg-red-500'
//                               : passwordStrength.score <= 3
//                               ? 'bg-yellow-500'
//                               : 'bg-green-500'
//                           }`}
//                           style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
//                         />
//                       </div>
//                       {passwordStrength.feedback.length > 0 && (
//                         <div className="mt-1">
//                           {passwordStrength.feedback.map((feedback, index) => (
//                             <div key={index} className="text-xs text-gray-500 dark:text-gray-400">
//                               • {feedback}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Confirm New Password
//                   </label>
//                   <div className="mt-1 relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Lock className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       type={showConfirmPassword ? 'text' : 'password'}
//                       id="confirmPassword"
//                       value={passwordForm.confirmPassword}
//                       onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
//                       className="pl-10 pr-10 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//                       required
//                     />
//                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                       <button
//                         type="button"
//                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
//                       >
//                         {showConfirmPassword ? (
//                           <EyeOff className="h-5 w-5" />
//                         ) : (
//                           <Eye className="h-5 w-5" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                   {passwordForm.confirmPassword && (
//                     <div className="mt-1">
//                       {passwordForm.newPassword === passwordForm.confirmPassword ? (
//                         <p className="text-xs text-green-600 dark:text-green-400">Passwords match</p>
//                       ) : (
//                         <p className="text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={passwordLoading || passwordForm.newPassword !== passwordForm.confirmPassword || passwordStrength.score < 3}
//                   className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-50"
//                 >
//                   <Save className="h-4 w-4 mr-2" />
//                   {passwordLoading ? 'Updating...' : 'Update Password'}
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Profile
import React, { useState, useEffect, ChangeEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { useDateFormatter } from '../utils/datePreferences'
import { 
  TrendingUp, 
  TrendingDown,
  Edit,
  Camera,
  Download,
  PieChart,
  BarChart3,
  Target,
  Wallet
} from 'lucide-react'

// --- Interfaces ---
interface FinancialTransaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface FinancialPeriod {
  income: number;
  expense: number;
  transactions: FinancialTransaction[];
}

interface FinancialData {
  overview: {
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
    savingsRate: number;
  };
  weekly: FinancialPeriod;
  monthly: FinancialPeriod;
  yearly: FinancialPeriod;
}

interface EditFormState {
  name: string;
  email: string;
  phone: string;
  bio: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: string;
}

interface TransactionListProps {
  transactions: FinancialTransaction[];
  title: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth()
  const { formatAmount } = useCurrency()
  const { formatDate } = useDateFormatter()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editForm, setEditForm] = useState<EditFormState>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const formatMonthYear = (value: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(value)
  }

  const [financialData, setFinancialData] = useState<FinancialData>({
    overview: {
      totalIncome: 0,
      totalExpense: 0,
      currentBalance: 0,
      savingsRate: 0
    },
    weekly: {
      income: 0,
      expense: 0,
      transactions: []
    },
    monthly: {
      income: 0,
      expense: 0,
      transactions: []
    },
    yearly: {
      income: 0,
      expense: 0,
      transactions: []
    }
  })

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const mockData: FinancialData = {
        overview: {
          totalIncome: 450000,
          totalExpense: 320000,
          currentBalance: 130000,
          savingsRate: 28.9
        },
        weekly: {
          income: 15000,
          expense: 8500,
          transactions: [
            { id: 1, description: 'Salary', amount: 15000, type: 'income', date: '2024-01-15' },
            { id: 2, description: 'Grocery Shopping', amount: 2500, type: 'expense', date: '2024-01-14' },
            { id: 3, description: 'Electric Bill', amount: 1200, type: 'expense', date: '2024-01-13' },
            { id: 4, description: 'Freelance Project', amount: 5000, type: 'income', date: '2024-01-12' },
          ]
        },
        monthly: {
          income: 45000,
          expense: 32000,
          transactions: [
            { id: 1, description: 'Monthly Salary', amount: 45000, type: 'income', date: '2024-01-01' },
            { id: 2, description: 'Rent', amount: 15000, type: 'expense', date: '2024-01-01' },
            { id: 3, description: 'Investment Returns', amount: 8000, type: 'income', date: '2024-01-15' },
          ]
        },
        yearly: {
          income: 540000,
          expense: 384000,
          transactions: [
            { id: 1, description: 'Annual Bonus', amount: 120000, type: 'income', date: '2024-03-15' },
            { id: 2, description: 'Car Purchase', amount: 800000, type: 'expense', date: '2024-06-20' },
          ]
        }
      }
      setFinancialData(mockData)
    } catch (error) {
      console.error('Failed to fetch financial data:', error)
    }
  }

  const handleEditProfile = async () => {
    setLoading(true)
    setMessage('')

    const result = await updateProfile(editForm)
    
    if (result.success) {
      setMessage('Profile updated successfully!')
      setIsEditing(false)
    } else {
      setMessage(result.error || 'An error occurred')
    }
    
    setLoading(false)
  }

  const formatCurrency = (amount: number) => formatAmount(amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  const TransactionList: React.FC<TransactionListProps> = ({ transactions, title }) => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
              <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
            </div>
            <div className={`text-sm font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since {formatMonthYear(new Date())}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          {isEditing && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleEditProfile}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
              {message && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Financial Overview Tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'weekly', 'monthly', 'yearly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Income"
                value={formatCurrency(financialData.overview.totalIncome)}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Total Expenses"
                value={formatCurrency(financialData.overview.totalExpense)}
                icon={TrendingDown}
                color="red"
              />
              <StatCard
                title="Current Balance"
                value={formatCurrency(financialData.overview.currentBalance)}
                icon={Wallet}
                color="blue"
              />
              <StatCard
                title="Savings Rate"
                value={`${financialData.overview.savingsRate}%`}
                icon={Target}
                color="purple"
              />
            </div>
          )}

          {activeTab === 'weekly' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatCard
                  title="Weekly Income"
                  value={formatCurrency(financialData.weekly.income)}
                  icon={TrendingUp}
                  color="green"
                />
                <StatCard
                  title="Weekly Expenses"
                  value={formatCurrency(financialData.weekly.expense)}
                  icon={TrendingDown}
                  color="red"
                />
              </div>
              <TransactionList 
                transactions={financialData.weekly.transactions} 
                title="Recent Transactions" 
              />
            </div>
          )}

          {activeTab === 'monthly' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatCard
                  title="Monthly Income"
                  value={formatCurrency(financialData.monthly.income)}
                  icon={TrendingUp}
                  color="green"
                />
                <StatCard
                  title="Monthly Expenses"
                  value={formatCurrency(financialData.monthly.expense)}
                  icon={TrendingDown}
                  color="red"
                />
              </div>
              <TransactionList 
                transactions={financialData.monthly.transactions} 
                title="Monthly Transactions" 
              />
            </div>
          )}

          {activeTab === 'yearly' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatCard
                  title="Yearly Income"
                  value={formatCurrency(financialData.yearly.income)}
                  icon={TrendingUp}
                  color="green"
                />
                <StatCard
                  title="Yearly Expenses"
                  value={formatCurrency(financialData.yearly.expense)}
                  icon={TrendingDown}
                  color="red"
                />
              </div>
              <TransactionList 
                transactions={financialData.yearly.transactions} 
                title="Yearly Transactions" 
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <Download className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Export Data</span>
        </button>
        <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <PieChart className="h-5 w-5 text-green-600" />
          <span className="font-medium">View Reports</span>
        </button>
        <button className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span className="font-medium">Analytics</span>
        </button>
      </div>
    </div>
  )
}

export default Profile
