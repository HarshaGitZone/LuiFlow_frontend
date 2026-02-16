// // import React, { useState } from 'react'
// // import { Link, useNavigate } from 'react-router-dom'
// // import { useAuth } from '../contexts/AuthContext'
// // import { Eye, EyeOff, Mail, Lock, TrendingUp } from 'lucide-react'

// // interface FormData {
// //   email: string;
// //   password: string;
// // }

// // const Login: React.FC = () => {
// //   const [formData, setFormData] = useState<FormData>({
// //     email: '',
// //     password: ''
// //   })
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState('')
  
// //   const { login } = useAuth()
// //   const navigate = useNavigate()

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
// //     setFormData({
// //       ...formData,
// //       [e.target.name]: e.target.value
// //     })
// //   }

// //   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
// //     e.preventDefault()
// //     setLoading(true)
// //     setError('')

// //     const result = await login(formData.email, formData.password)
    
// //     if (result.success) {
// //       navigate('/')
// //     } else {
// //       setError(result.error || 'Login failed')
// //     }
    
// //     setLoading(false)
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
// //       <div className="max-w-md w-full space-y-8">
// //         <div>
// //           <div className="flex justify-center">
// //             <TrendingUp className="h-12 w-12 text-primary dark:text-primary-light" />
// //           </div>
// //           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
// //             Sign in to your account
// //           </h2>
// //           <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
// //             Or{' '}
// //             <Link
// //               to="/register"
// //               className="font-medium text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-light"
// //             >
// //               create a new account
// //             </Link>
// //           </p>
// //         </div>

// //         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
// //           {error && (
// //             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
// //               {error}
// //             </div>
// //           )}

// //           <div className="space-y-4">
// //             <div>
// //               <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                 Email address
// //               </label>
// //               <div className="mt-1 relative">
// //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                   <Mail className="h-5 w-5 text-gray-400" />
// //                 </div>
// //                 <input
// //                   id="email"
// //                   name="email"
// //                   type="email"
// //                   autoComplete="email"
// //                   required
// //                   value={formData.email}
// //                   onChange={handleChange}
// //                   className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent"
// //                   placeholder="Enter your email"
// //                 />
// //               </div>
// //             </div>

// //             <div>
// //               <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                 Password
// //               </label>
// //               <div className="mt-1 relative">
// //                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                   <Lock className="h-5 w-5 text-gray-400" />
// //                 </div>
// //                 <input
// //                   id="password"
// //                   name="password"
// //                   type={showPassword ? 'text' : 'password'}
// //                   autoComplete="current-password"
// //                   required
// //                   value={formData.password}
// //                   onChange={handleChange}
// //                   className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent"
// //                   placeholder="Enter your password"
// //                 />
// //                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowPassword(!showPassword)}
// //                     className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
// //                   >
// //                     {showPassword ? (
// //                       <EyeOff className="h-5 w-5" />
// //                     ) : (
// //                       <Eye className="h-5 w-5" />
// //                     )}
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           <div>
// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
// //             >
// //               {loading ? 'Signing in...' : 'Sign in'}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   )
// // }

// // export default Login

// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../contexts/AuthContext'
// import { Eye, EyeOff, Mail, Lock, TrendingUp } from 'lucide-react'

// interface LoginFormData {
//   email: string
//   password: string
// }

// interface LoginResult {
//   success: boolean
//   error?: string
// }

// const Login: React.FC = () => {
//   const [formData, setFormData] = useState<LoginFormData>({
//     email: '',
//     password: ''
//   })

//   const [showPassword, setShowPassword] = useState<boolean>(false)
//   const [loading, setLoading] = useState<boolean>(false)
//   const [error, setError] = useState<string>('')

//   const { login } = useAuth()
//   const navigate = useNavigate()

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const { name, value } = e.target

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     const result = (await login(formData.email, formData.password)) as LoginResult

//     if (result.success) {
//       navigate('/')
//     } else {
//       setError(result.error || 'Login failed')
//     }

//     setLoading(false)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
//             <TrendingUp className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
//             Sign in to LuiFlow
//           </h2>
//           <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
//             Manage your finances with intelligence
//           </p>
//         </div>

//         <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8 border border-transparent dark:border-slate-700">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
//                 {error}
//               </div>
//             )}

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                 Email address
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
//                 </div>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter your email"
//                   value={formData.email}
//                   onChange={handleChange}
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
//                 Password
//               </label>
//               <div className="mt-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
//                 </div>
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   required
//                   className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter your password"
//                   value={formData.password}
//                   onChange={handleChange}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
//                   Remember me
//                 </label>
//               </div>

//               <div className="text-sm">
//                 <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
//                   Forgot your password?
//                 </a>
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Signing in...' : 'Sign in'}
//               </button>
//             </div>

//             <div className="text-center">
//               <span className="text-sm text-gray-600 dark:text-gray-300">
//                 Don't have an account?{' '}
//                 <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
//                   Sign up
//                 </Link>
//               </span>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Login

import React, { useState, ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, TrendingUp } from 'lucide-react'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)
    
    // if (result.success) {
    //   navigate('/')
    // } else {
    //   setError(result.error)
    // }
    if (result?.success) {
      navigate('/')
    } else {
      // Ensuring error is treated as a string even if result is undefined
      setError(result?.error || 'Invalid email or password');
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Sign in to LuiFlow
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage your finances with intelligence
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8 border border-transparent dark:border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login