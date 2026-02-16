// import React, { useState, useEffect } from 'react'
// import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
// import { api } from '../api'
// import API from '../api'

// interface CSVPreview {
//   headers: string[]
//   data: any[]
//   pagination: {
//     page: number
//     limit: number
//     totalRows: number
//     totalPages: number
//     hasNextPage: boolean
//     hasPrevPage: boolean
//   }
// }

// interface ColumnMapping {
//   [key: string]: string
// }

// interface ImportResult {
//   success: boolean
//   summary: {
//     totalRows: number
//     insertedRows: number
//     skippedRows: number
//     duplicateRows: number
//     errors: number
//   }
//   errors: Array<{
//     row: number
//     error: string
//     data?: any
//   }>
// }

// const Import: React.FC = () => {
//   const [step, setStep] = useState(1)
//   const [file, setFile] = useState<File | null>(null)
//   const [preview, setPreview] = useState<CSVPreview | null>(null)
//   const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
//   const [importResult, setImportResult] = useState<ImportResult | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [currentPage, setCurrentPage] = useState(1)

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const uploadedFile = e.target.files?.[0]
//     if (!uploadedFile) return

//     if (!uploadedFile.name.endsWith('.csv')) {
//       setError('Please upload a CSV file')
//       return
//     }

//     setFile(uploadedFile)
//     setError('')
//     await previewCSV(uploadedFile)
//   }

//   const previewCSV = async (csvFile: File, page: number = 1) => {
//     try {
//       setLoading(true)
//       const formData = new FormData()
//       formData.append('file', csvFile)
//       formData.append('page', page.toString())
//       formData.append('limit', '20')

//       const response = await api.post(API.CSV_PREVIEW, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })

//       setPreview(response.data)
//       setCurrentPage(page)
//       setStep(2)
//     } catch (error: any) {
//       setError(error.response?.data?.error || 'Failed to preview CSV file')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePageChange = (page: number) => {
//     if (file) {
//       previewCSV(file, page)
//     }
//   }

//   const generateMapping = () => {
//     if (!preview) return

//     const mapping: ColumnMapping = {}
//     const dateFields = ['date', 'Date', 'transaction_date', 'Transaction Date', 'created_at', 'Created At']
//     const amountFields = ['amount', 'Amount', 'price', 'Price', 'cost', 'Cost', 'total', 'Total']
//     const descriptionFields = ['description', 'Description', 'desc', 'Desc', 'notes', 'Notes', 'memo', 'Memo']
//     const categoryFields = ['category', 'Category', 'cat', 'Cat', 'type', 'Type']
//     const typeFields = ['type', 'Type', 'transaction_type', 'Transaction Type']

//     preview.headers.forEach(header => {
//       const lowerHeader = header.toLowerCase()
      
//       if (dateFields.includes(header) || dateFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
//         mapping[header] = 'date'
//       } else if (amountFields.includes(header) || amountFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
//         mapping[header] = 'amount'
//       } else if (descriptionFields.includes(header) || descriptionFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
//         mapping[header] = 'description'
//       } else if (categoryFields.includes(header) || categoryFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
//         mapping[header] = 'category'
//       } else if (typeFields.includes(header) || typeFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
//         mapping[header] = 'type'
//       }
//     })

//     setColumnMapping(mapping)
//   }

//   const handleImport = async () => {
//     if (!file || !columnMapping) return

//     try {
//       setLoading(true)
//       setError('')

//       const formData = new FormData()
//       formData.append('file', file)
//       formData.append('columnMapping', JSON.stringify(columnMapping))

//       const response = await api.post(API.CSV_IMPORT, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })

//       setImportResult(response.data)
//       setStep(4)
//     } catch (error: any) {
//       setError(error.response?.data?.error || 'Failed to import CSV file')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resetImport = () => {
//     setStep(1)
//     setFile(null)
//     setPreview(null)
//     setColumnMapping({})
//     setImportResult(null)
//     setError('')
//     setCurrentPage(1)
//   }

//   const updateMapping = (csvHeader: string, field: string) => {
//     setColumnMapping(prev => ({ ...prev, [csvHeader]: field }))
//   }

//   useEffect(() => {
//     if (step === 2 && preview) {
//       generateMapping()
//     }
//   }, [preview])

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Transactions</h1>
//         <p className="text-gray-600 dark:text-gray-400">Import your transactions from a CSV file</p>
//       </div>

//       {/* Progress Steps */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
//             step >= 1 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
//           }`}>
//             <span className="text-white text-sm font-medium">1</span>
//           </div>
//           <div className={`flex-1 h-1 ${
//             step >= 1 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
//           }`} />
//           <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
//             step >= 2 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
//           }`}>
//             <span className="text-white text-sm font-medium">2</span>
//           </div>
//           <div className={`flex-1 h-1 ${
//             step >= 2 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
//           }`} />
//           <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
//             step >= 3 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
//           }`}>
//             <span className="text-white text-sm font-medium">3</span>
//           </div>
//           <div className={`flex-1 h-1 ${
//             step >= 3 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
//           }`} />
//           <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
//             step >= 4 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
//           }`}>
//             <span className="text-white text-sm font-medium">4</span>
//           </div>
//         </div>
//         <button
//           onClick={resetImport}
//           className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//         >
//           Reset
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
//           {error}
//         </div>
//       )}

//       {/* Step 1: Upload */}
//       {step === 1 && (
//         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
//           <div className="text-center">
//             <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload CSV File</h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-4">
//               Select a CSV file containing your transaction data
//             </p>
//             <div className="flex justify-center">
//               <label className="cursor-pointer">
//                 <input
//                   type="file"
//                   accept=".csv"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                 />
//                 <div className="px-6 py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-400 dark:hover:border-slate-500 transition-colors">
//                   <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
//                   <span className="text-gray-600 dark:text-400">Choose CSV file or drag and drop</span>
//                 </div>
//               </label>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Step 2: Preview */}
//       {step === 2 && preview && (
//         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
//           <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">CSV Preview</h3>
          
//           {/* File Info */}
//           <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-900 dark:text-white">File: {file?.name}</p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Size: {file ? (file.size / 1024).toFixed(2) : 0} KB
//                 </p>
//               </div>
//               <button
//                 onClick={() => setStep(1)}
//                 className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
//               >
//                 <ArrowLeft className="h-4 w-4" />
//               </button>
//             </div>
//           </div>

//           {/* Headers */}
//           <div className="mb-4">
//             <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Detected Headers:</h4>
//             <div className="flex flex-wrap gap-2">
//               {preview.headers.map((header, index) => (
//                 <span
//                   key={index}
//                   className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-sm text-gray-700 dark:text-gray-300 rounded"
//                 >
//                   {header}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Preview Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
//               <thead className="bg-gray-50 dark:bg-slate-900">
//                 <tr>
//                   {preview.headers.map((header, index) => (
//                     <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
//                 {preview.data.map((row, rowIndex) => (
//                   <tr key={rowIndex}>
//                     {preview.headers.map((header, colIndex) => (
//                       <td key={colIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-white">
//                         {row[header] || ''}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {preview.pagination.totalPages > 1 && (
//             <div className="flex items-center justify-between mt-4">
//               <button
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={!preview.pagination.hasPrevPage}
//                 className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <span className="text-sm text-gray-600 dark:text-gray-400">
//                 Page {currentPage} of {preview.pagination.totalPages}
//               </span>
//               <button
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={!preview.pagination.hasNextPage}
//                 className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           )}

//           <div className="flex justify-end mt-6">
//             <button
//               onClick={() => setStep(3)}
//               className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary"
//             >
//               Continue
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Step 3: Map Columns */}
//       {step === 3 && (
//         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-medium text-gray-900 dark:text-white">Map Columns</h3>
//             <button
//               onClick={() => setStep(2)}
//               className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </button>
//           </div>

//           <div className="space-y-4">
//             {preview?.headers.map((header) => (
//               <div key={header} className="flex items-center space-x-4">
//                 <div className="flex-1">
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {header}
//                   </label>
//                   <select
//                     value={columnMapping[header] || ''}
//                     onChange={(e) => updateMapping(header, e.target.value)}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
//                   >
//                     <option value="">-- Select Field --</option>
//                     <option value="date">Date</option>
//                     <option value="amount">Amount</option>
//                     <option value="description">Description</option>
//                     <option value="category">Category</option>
//                     <option value="type">Type</option>
//                   </select>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-end space-x-3">
//             <button
//               onClick={() => setStep(2)}
//               className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
//             >
//               Back
//             </button>
//             <button
//               onClick={handleImport}
//               disabled={Object.keys(columnMapping).length === 0}
//               className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-50"
//             >
//               {loading ? (
//                 <>
//                   <RefreshCw className="animate-spin h-4 w-4 mr-2" />
//                   Importing...
//                 </>
//               ) : (
//                 <>
//                   Import
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Step 4: Results */}
//       {step === 4 && importResult && (
//         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
//           <div className="text-center mb-6">
//             {importResult.success ? (
//               <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
//             ) : (
//               <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
//             )}
//             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//               {importResult.success ? 'Import Completed' : 'Import Failed'}
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               {importResult.success
//                 ? 'Your transactions have been imported successfully.'
//                 : 'There were issues with your import. Please check the errors below.'}
//             </p>
//           </div>

//           {/* Summary */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-gray-900 dark:text-white">
//                 {importResult.summary.totalRows}
//               </div>
//               <div className="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
//             </div>
//             <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//                 {importResult.summary.insertedRows}
//               </div>
//               <div className="text-sm text-green-600 dark:text-green-400">Imported</div>
//             </div>
//             <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
//                 {importResult.summary.duplicateRows}
//               </div>
//               <div className="text-sm text-yellow-600 dark:text-yellow-400">Duplicates</div>
//             </div>
//             <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//                 {importResult.summary.errors}
//               </div>
//               <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
//             </div>
//           </div>

//           {/* Errors */}
//           {importResult.errors.length > 0 && (
//             <div className="mb-6">
//               <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Errors:</h4>
//               <div className="max-h-40 overflow-y-auto">
//                 <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
//                   <thead className="bg-gray-50 dark:bg-slate-900">
//                     <tr>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Row
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Error
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Data
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
//                     {importResult.errors.slice(0, 10).map((error, index) => (
//                       <tr key={index}>
//                         <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
//                           {error.row}
//                         </td>
//                         <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
//                           {error.error}
//                         </td>
//                         <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
//                           <pre className="text-xs bg-gray-100 dark:bg-slate-800 p-2 rounded overflow-x-auto">
//                             {JSON.stringify(error.data, null, 2)}
//                           </pre>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               {importResult.errors.length > 10 && (
//                 <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
//                   ... and {importResult.errors.length - 10} more errors
//                 </p>
//               )}
//             </div>
//           )}

//           <div className="flex justify-center">
//             <button
//               onClick={resetImport}
//               className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
//             >
//               Start New Import
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Import

import React, { useState, useEffect, ChangeEvent } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Eye, Database, Play, RotateCcw, X, History, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import API from '../api'
import { csvImportStorage } from '../utils/storage'
import { useCurrency } from '../contexts/CurrencyContext'
import { useDateFormatter } from '../utils/datePreferences'

interface Pagination {
  page: number;
  limit: number;
  totalRows: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface PreviewData {
  headers: string[];
  data: Record<string, any>[];
  pagination: Pagination;
}

interface ColumnMapping {
  date?: string;
  amount?: string;
  type?: string;
  category?: string;
  description?: string;
}

interface ImportSummary {
  totalRows: number;
  insertedRows: number;
  duplicateRows: number;
  skippedRows: number;
  errors: number;
}

interface ValidationError {
  row: number;
  error: string;
  isDuplicate?: boolean;
  data?: Record<string, any>;
}

interface ImportResult {
  success: boolean;
  summary: ImportSummary;
  errors: ValidationError[];
  debug?: any;
}

interface DryRunResult {
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    duplicateRows: number;
  };
  validation: {
    validTransactions: any[];
    errors: ValidationError[];
    duplicates: ValidationError[];
  };
}

interface RetryRow {
  sourceRow: number;
  originalError: string;
  values: Record<string, string>;
}

interface HistoryItem {
  _id: string;
  importDate: string;
  fileName: string;
  status: 'success' | 'partial' | 'failed';
  summary: {
    totalRows: number;
    insertedRows: number;
    errors: number;
  };
}

const Import: React.FC = () => {
  const { formatAmount } = useCurrency()
  const { formatDate } = useDateFormatter()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [importStep, setImportStep] = useState<number>(1)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [hasSavedState, setHasSavedState] = useState<boolean>(false)

  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [historyData, setHistoryData] = useState<HistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false)
  const [retryRows, setRetryRows] = useState<RetryRow[]>([])
  const [retryingRows, setRetryingRows] = useState<boolean>(false)
  const [retryFeedback, setRetryFeedback] = useState<string | null>(null)
  const [retryError, setRetryError] = useState<string | null>(null)

  const formatDateTime = (value: string | Date) => {
    const date = value instanceof Date ? value : new Date(value)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedState = csvImportStorage.loadState()
        if (savedState) {
          setHasSavedState(true)
          setPreview(savedState.preview)
          setColumnMapping(savedState.columnMapping || {})
          setImportStep(savedState.importStep || 1)
          setImportResult(savedState.importResult)
          setDryRunResult(savedState.dryRunResult)
          setRetryRows(savedState.retryRows || [])
          setRetryFeedback(savedState.retryFeedback || null)
          setRetryError(savedState.retryError || null)
          setCurrentPage(savedState.currentPage || 1)
        }
      } catch (error) {
        console.error('Error loading saved state:', error)
      } finally {
        setLoadingState(false)
      }
    }

    loadSavedState()
  }, [])

  useEffect(() => {
    if (!loadingState) {
      csvImportStorage.saveState({
        file,
        preview,
        columnMapping,
        importStep,
        importResult,
        dryRunResult,
        retryRows,
        retryFeedback,
        retryError,
        currentPage
      })
    }
  }, [file, preview, columnMapping, importStep, importResult, dryRunResult, retryRows, retryFeedback, retryError, currentPage, loadingState])

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await api.get(API.CSV_HISTORY)
      setHistoryData(response.data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (showHistory) {
      fetchHistory()
    }
  }, [showHistory])

  const clearSavedState = () => {
    csvImportStorage.clearState()
    setHasSavedState(false)
    setFile(null)
    setPreview(null)
    setColumnMapping({})
    setImportStep(1)
    setImportResult(null)
    setDryRunResult(null)
    setCurrentPage(1)
    setRetryRows([])
    setRetryFeedback(null)
    setRetryError(null)
  }

  const getRetryHeaders = (): string[] => {
    const mappedHeaders = [
      columnMapping.date,
      columnMapping.amount,
      columnMapping.type,
      columnMapping.category,
      columnMapping.description
    ]

    return Array.from(new Set(mappedHeaders.filter((header): header is string => Boolean(header))))
  }

  const createRetryRows = (result: DryRunResult): RetryRow[] => {
    const retryHeaders = getRetryHeaders()

    return result.validation.errors
      .filter((errorItem) => !errorItem.isDuplicate && errorItem.data && typeof errorItem.data === 'object')
      .map((errorItem) => {
        const sourceData = errorItem.data as Record<string, any>
        const values: Record<string, string> = {}

        retryHeaders.forEach((header) => {
          const value = sourceData[header]
          values[header] = value === undefined || value === null ? '' : String(value)
        })

        return {
          sourceRow: errorItem.row,
          originalError: errorItem.error,
          values
        }
      })
  }

  const escapeCsvValue = (value: string): string => {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const buildRetryCsv = (headers: string[], rows: RetryRow[]): string => {
    const csvHeaders = headers.map(escapeCsvValue).join(',')
    const csvRows = rows.map((row) => headers.map((header) => escapeCsvValue(row.values[header] || '')).join(','))
    return [csvHeaders, ...csvRows].join('\n')
  }

  const refreshRetryRowsFromDryRun = async (retryFile: File) => {
    const dryRunFormData = new FormData()
    dryRunFormData.append('file', retryFile)
    dryRunFormData.append('columnMapping', JSON.stringify(columnMapping))

    const validationResponse = await api.post(API.CSV_DRY_RUN, dryRunFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    const latestRetryRows = createRetryRows(validationResponse.data)
    setRetryRows(latestRetryRows)
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)

    if (selectedFile) {
      await uploadAndPreview(selectedFile)
    }
  }

  const uploadAndPreview = async (csvFile: File, page = 1) => {
    const formData = new FormData()
    formData.append('file', csvFile)
    formData.append('page', page.toString())
    formData.append('limit', '20')

    try {
      setUploading(true)
      const response = await api.post(API.CSV_PREVIEW, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (page === 1) {
        setPreview(response.data)

        const mapping: ColumnMapping = {}
        const headers: string[] = response.data.headers

        headers.forEach(header => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes('date') || lowerHeader.includes('time')) {
            mapping.date = header
          } else if (lowerHeader.includes('amount') || lowerHeader.includes('value') || lowerHeader.includes('sum')) {
            mapping.amount = header
          } else if (lowerHeader.includes('type') || lowerHeader.includes('transaction type')) {
            mapping.type = header
          } else if (lowerHeader.includes('category') || lowerHeader.includes('class')) {
            mapping.category = header
          } else if (lowerHeader.includes('description') || lowerHeader.includes('memo') || lowerHeader.includes('notes')) {
            mapping.description = header
          }
        })

        setColumnMapping(mapping)
        setImportStep(2)
      } else {
        setPreview(prev => prev ? ({
          ...prev,
          data: response.data.data,
          pagination: response.data.pagination
        }) : null)
      }
    } catch (error) {
      console.error('Preview error:', error)
      alert('Failed to preview CSV file')
    } finally {
      setUploading(false)
    }
  }

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImport = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('columnMapping', JSON.stringify(columnMapping))

    try {
      setUploading(true)
      try {
        const healthResponse = await api.get(API.HEALTH)
        console.log('Backend health check:', healthResponse.data)
      } catch (healthError) {
        console.error('Backend health check failed:', healthError)
        alert('Backend is not reachable. Please check if the server is running.')
        return
      }

      const response = await api.post(API.CSV_IMPORT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 
      })

      if (response.data && response.data.success) {
        setImportResult(response.data)
        setImportStep(4)
        window.dispatchEvent(new CustomEvent('transaction-updated'))
        setTimeout(() => {
          const { insertedRows, duplicateRows } = response.data.summary;
          alert(`Import completed! ${insertedRows} imported, ${duplicateRows} duplicates skipped.`)
          navigate('/transactions')
        }, 2000)
      } else {
        let errorDetails = '';
        if (response.data.errors && response.data.errors.length > 0) {
          errorDetails = `\nFirst error: ${response.data.errors[0].error} (Row ${response.data.errors[0].row})`;
        } else if (response.data.debug) {
          errorDetails = `\nDebug: Valid Rows: ${response.data.debug.resultsLength}, Processed: ${response.data.debug.processedRows}, Inserted: ${response.data.debug.insertedCount}`;
        }
        alert(`Import failed: ${response.data?.error || 'Unknown error'}${errorDetails}`)
      }
    } catch (error: any) {
      console.error('Import error:', error)
      let errorMessage = 'Failed to import CSV file'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on port 10000.'
      } else if (error.code === 'ECONNRESET') {
        errorMessage = 'Connection was reset. The server may have timed out.'
      }
      alert(`Import error: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDryRun = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('columnMapping', JSON.stringify(columnMapping))

    try {
      setUploading(true)
      const response = await api.post(API.CSV_DRY_RUN, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setDryRunResult(response.data)
      setRetryRows(createRetryRows(response.data))
      setRetryFeedback(null)
      setRetryError(null)
      setImportStep(3)
    } catch (error: any) {
      console.error('Dry run error:', error)
      alert(`Failed to validate CSV file: ${error.response?.data?.error || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setPreview(null)
    setColumnMapping({})
    setImportResult(null)
    setDryRunResult(null)
    setCurrentPage(1)
    setImportStep(1)
    setRetryRows([])
    setRetryFeedback(null)
    setRetryError(null)
  }

  const updateRetryCell = (rowIndex: number, header: string, value: string) => {
    setRetryRows((prev) => prev.map((row, index) => {
      if (index !== rowIndex) return row
      return {
        ...row,
        values: {
          ...row.values,
          [header]: value
        }
      }
    }))
  }

  const handleRetryFailedRows = async () => {
    const retryHeaders = getRetryHeaders()

    if (retryRows.length === 0 || retryHeaders.length === 0) {
      return
    }

    try {
      setRetryingRows(true)
      setRetryFeedback(null)
      setRetryError(null)

      const retryCsv = buildRetryCsv(retryHeaders, retryRows)
      const originalBaseName = file?.name ? file.name.replace(/\.csv$/i, '') : 'transactions'
      const retryFile = new File([retryCsv], `${originalBaseName}-failed-rows-retry.csv`, { type: 'text/csv' })

      const importFormData = new FormData()
      importFormData.append('file', retryFile)
      importFormData.append('columnMapping', JSON.stringify(columnMapping))

      const importResponse = await api.post(API.CSV_IMPORT, importFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const insertedRows = importResponse.data?.summary?.insertedRows || 0
      const remainingErrorRows = importResponse.data?.summary?.errors || 0

      await refreshRetryRowsFromDryRun(retryFile)

      if (insertedRows > 0) {
        window.dispatchEvent(new CustomEvent('transaction-updated'))
      }

      setRetryFeedback(`Retry processed ${retryRows.length} row(s): ${insertedRows} imported, ${remainingErrorRows} still failing.`)
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to retry failed rows'
      setRetryError(message)
    } finally {
      setRetryingRows(false)
    }
  }

  if (loadingState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading import state...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Import Transactions</h1>
              <p className="text-gray-600 dark:text-gray-300">Import your transaction data from CSV files</p>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${showHistory
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </button>

              {hasSavedState && (
                <button
                  onClick={clearSavedState}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Saved State
                </button>
              )}
            </div>
          </div>

          {hasSavedState && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    You have a previous import session saved. Upload the same CSV file to continue where you left off.
                  </p>
                </div>
                <button
                  onClick={clearSavedState}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {showHistory && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-start sm:items-center gap-3 bg-gray-50 dark:bg-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Import History</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track your past CSV imports</p>
              </div>
              <button
                onClick={fetchHistory}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Refresh"
              >
                <RotateCcw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingHistory ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading history...
              </div>
            ) : historyData.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No import history found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rows</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Imported</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                    {historyData.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            {formatDateTime(item.importDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.fileName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'success' ? 'bg-green-100 text-green-800' :
                            item.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                          {item.summary?.totalRows || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                          {item.summary?.insertedRows || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                          {item.summary?.errors || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowHistory(false)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!showHistory && (
          <>
            <div className="overflow-x-auto pb-2">
              <div className="w-max min-w-full flex items-center space-x-2 pr-2">
              <div className={`flex items-center ${importStep >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>1</div>
                <span className="ml-2 font-medium whitespace-nowrap">Upload</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center ${importStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>2</div>
                <span className="ml-2 font-medium whitespace-nowrap">Map Columns</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center ${importStep >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>3</div>
                <span className="ml-2 font-medium whitespace-nowrap">Validate</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center ${importStep >= 4 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>4</div>
                <span className="ml-2 font-medium whitespace-nowrap">Import</span>
              </div>
              </div>
            </div>
          </>
        )}
      </div>

      {!showHistory && importStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload CSV File</h2>
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label className="cursor-pointer">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Choose a file or drag it here</span>
                <input type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} className="hidden" />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">CSV files only (MAX. 10MB)</p>
            </div>
            {file && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">{file.name}</span>
                </div>
                <div className="text-xs text-blue-700 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            )}
            {uploading && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  <span className="text-sm font-medium text-yellow-900">Processing CSV...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!showHistory && importStep === 2 && preview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Map Your Columns</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Match your CSV columns to the transaction fields below.</p>
            <div className="space-y-4">
              {(['date', 'amount', 'type', 'category', 'description'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">{field} Column {field === 'date' || field === 'amount' ? '*' : ''}</label>
                  <select
                    value={columnMapping[field] || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select {field} column...</option>
                    {preview.headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={resetImport} className="w-full sm:flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 border border-transparent dark:border-slate-500">Start Over</button>
              <button
                onClick={handleDryRun}
                disabled={!columnMapping.date || !columnMapping.amount || uploading}
                className="w-full sm:flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-500"
              >
                {uploading ? 'Validating...' : <><Eye className="h-4 w-4 mr-2 inline" /> Validate Only</>}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Preview</h2>
              {preview?.pagination && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {((preview.pagination.page - 1) * preview.pagination.limit) + 1} to {Math.min(preview.pagination.page * preview.pagination.limit, preview.pagination.totalRows)} of {preview.pagination.totalRows} rows
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    {preview.headers.map((header, index) => (
                      <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {preview.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                      {preview.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100">{row[header] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!showHistory && importStep === 3 && dryRunResult && (
        <div className="space-y-6 mt-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Validation Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-primary-bg dark:bg-slate-800 border border-primary rounded-lg">
                <FileText className="h-8 w-8 text-primary dark:text-primary-light mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-dark dark:text-primary-light">{dryRunResult.summary.totalRows}</p>
                <p className="text-sm text-primary dark:text-primary-light">Total Rows</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">{dryRunResult.summary.validRows}</p>
                <p className="text-sm text-green-700 dark:text-green-400">Will Succeed</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">{dryRunResult.summary.errorRows}</p>
                <p className="text-sm text-red-700 dark:text-red-400">Will Fail</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <Database className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">{dryRunResult.summary.duplicateRows}</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Duplicates</p>
              </div>
            </div>

            {dryRunResult.validation.validTransactions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Preview valid rows:</h3>
                <div className="bg-green-50 dark:bg-slate-800 border border-green-200 dark:border-green-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-green-200 dark:divide-slate-700">
                    <thead className="bg-green-100 dark:bg-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase">Description</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-green-200 dark:divide-slate-700">
                      {dryRunResult.validation.validTransactions.map((t, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{formatDate(t.date)}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{t.description}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{formatAmount(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {retryRows.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Retry Failed Rows</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Correct the failed rows below and retry only these rows.
                    </p>
                  </div>
                  <button
                    onClick={handleRetryFailedRows}
                    disabled={retryingRows}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400"
                  >
                    {retryingRows ? 'Retrying...' : `Retry ${retryRows.length} Failed Row(s)`}
                  </button>
                </div>

                {retryFeedback && (
                  <div className="mb-3 p-3 rounded-lg border border-green-200 bg-green-50 text-sm text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                    {retryFeedback}
                  </div>
                )}

                {retryError && (
                  <div className="mb-3 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                    {retryError}
                  </div>
                )}

                <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                  <table className="min-w-[760px] w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-amber-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Row</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Error</th>
                        {getRetryHeaders().map((header) => (
                          <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                      {retryRows.map((retryRow, rowIndex) => (
                        <tr key={`${retryRow.sourceRow}-${rowIndex}`} className="align-top">
                          <td className="px-3 py-3 text-xs font-medium text-gray-900 dark:text-gray-100">{retryRow.sourceRow}</td>
                          <td className="px-3 py-3 text-xs text-red-700 dark:text-red-300 whitespace-normal min-w-[180px]">{retryRow.originalError}</td>
                          {getRetryHeaders().map((header) => (
                            <td key={header} className="px-3 py-3">
                              <input
                                value={retryRow.values[header] || ''}
                                onChange={(e) => updateRetryCell(rowIndex, header, e.target.value)}
                                className="w-full min-w-[140px] px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={() => setImportStep(2)} className="w-full sm:flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg"><ArrowLeft className="h-4 w-4 inline mr-2" /> Back</button>
              <button
                onClick={handleImport}
                disabled={dryRunResult.summary.validRows === 0 || uploading}
                className="w-full sm:flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {uploading ? 'Importing...' : <><Play className="h-4 w-4 mr-2 inline" /> Commit Import ({dryRunResult.summary.validRows} rows)</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showHistory && importStep === 4 && importResult && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Import Complete!</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-primary-bg dark:bg-slate-800 border border-primary rounded-lg">
              <FileText className="h-8 w-8 text-primary dark:text-primary-light mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-dark dark:text-primary-light">{importResult.summary.totalRows}</p>
              <p className="text-sm text-primary dark:text-primary-light">Total Rows</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">{importResult.summary.insertedRows}</p>
              <p className="text-sm text-green-700 dark:text-green-400">Imported</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-2xl font-bold text-red-900 dark:text-red-300">{importResult.summary.skippedRows}</p>
              <p className="text-sm text-red-700 dark:text-red-400">Skipped</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">{importResult.summary.errors}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Errors</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button onClick={() => navigate('/transactions')} className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"><ArrowRight className="h-4 w-4 mr-2 inline" /> View Transactions</button>
            <button onClick={resetImport} className="w-full sm:flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg">Import Another File</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Import
