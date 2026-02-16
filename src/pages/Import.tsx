import React, { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
import { api } from '../api'
import API from '../api'

interface CSVPreview {
  headers: string[]
  data: any[]
  pagination: {
    page: number
    limit: number
    totalRows: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface ColumnMapping {
  [key: string]: string
}

interface ImportResult {
  success: boolean
  summary: {
    totalRows: number
    insertedRows: number
    skippedRows: number
    duplicateRows: number
    errors: number
  }
  errors: Array<{
    row: number
    error: string
    data?: any
  }>
}

const Import: React.FC = () => {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CSVPreview | null>(null)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    if (!uploadedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setFile(uploadedFile)
    setError('')
    await previewCSV(uploadedFile)
  }

  const previewCSV = async (csvFile: File, page: number = 1) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', csvFile)
      formData.append('page', page.toString())
      formData.append('limit', '20')

      const response = await api.post(API.CSV_PREVIEW, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setPreview(response.data)
      setCurrentPage(page)
      setStep(2)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to preview CSV file')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (file) {
      previewCSV(file, page)
    }
  }

  const generateMapping = () => {
    if (!preview) return

    const mapping: ColumnMapping = {}
    const dateFields = ['date', 'Date', 'transaction_date', 'Transaction Date', 'created_at', 'Created At']
    const amountFields = ['amount', 'Amount', 'price', 'Price', 'cost', 'Cost', 'total', 'Total']
    const descriptionFields = ['description', 'Description', 'desc', 'Desc', 'notes', 'Notes', 'memo', 'Memo']
    const categoryFields = ['category', 'Category', 'cat', 'Cat', 'type', 'Type']
    const typeFields = ['type', 'Type', 'transaction_type', 'Transaction Type']

    preview.headers.forEach(header => {
      const lowerHeader = header.toLowerCase()
      
      if (dateFields.includes(header) || dateFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
        mapping[header] = 'date'
      } else if (amountFields.includes(header) || amountFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
        mapping[header] = 'amount'
      } else if (descriptionFields.includes(header) || descriptionFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
        mapping[header] = 'description'
      } else if (categoryFields.includes(header) || categoryFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
        mapping[header] = 'category'
      } else if (typeFields.includes(header) || typeFields.some(field => lowerHeader.includes(field.toLowerCase()))) {
        mapping[header] = 'type'
      }
    })

    setColumnMapping(mapping)
  }

  const handleImport = async () => {
    if (!file || !columnMapping) return

    try {
      setLoading(true)
      setError('')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('columnMapping', JSON.stringify(columnMapping))

      const response = await api.post(API.CSV_IMPORT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setImportResult(response.data)
      setStep(4)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to import CSV file')
    } finally {
      setLoading(false)
    }
  }

  const resetImport = () => {
    setStep(1)
    setFile(null)
    setPreview(null)
    setColumnMapping({})
    setImportResult(null)
    setError('')
    setCurrentPage(1)
  }

  const updateMapping = (csvHeader: string, field: string) => {
    setColumnMapping(prev => ({ ...prev, [csvHeader]: field }))
  }

  useEffect(() => {
    if (step === 2 && preview) {
      generateMapping()
    }
  }, [preview])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Transactions</h1>
        <p className="text-gray-600 dark:text-gray-400">Import your transactions from a CSV file</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
          }`}>
            <span className="text-white text-sm font-medium">1</span>
          </div>
          <div className={`flex-1 h-1 ${
            step >= 1 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
          }`}>
            <span className="text-white text-sm font-medium">2</span>
          </div>
          <div className={`flex-1 h-1 ${
            step >= 2 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 3 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
          }`}>
            <span className="text-white text-sm font-medium">3</span>
          </div>
          <div className={`flex-1 h-1 ${
            step >= 3 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 4 ? 'bg-primary dark:bg-primary-light' : 'bg-gray-200 dark:bg-slate-700'
          }`}>
            <span className="text-white text-sm font-medium">4</span>
          </div>
        </div>
        <button
          onClick={resetImport}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Reset
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload CSV File</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Select a CSV file containing your transaction data
            </p>
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="px-6 py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-400 dark:hover:border-slate-500 transition-colors">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-gray-600 dark:text-400">Choose CSV file or drag and drop</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && preview && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">CSV Preview</h3>
          
          {/* File Info */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">File: {file?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Size: {file ? (file.size / 1024).toFixed(2) : 0} KB
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Headers */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Detected Headers:</h4>
            <div className="flex flex-wrap gap-2">
              {preview.headers.map((header, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-sm text-gray-700 dark:text-gray-300 rounded"
                >
                  {header}
                </span>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  {preview.headers.map((header, index) => (
                    <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {preview.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {preview.headers.map((header, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {row[header] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {preview.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!preview.pagination.hasPrevPage}
                className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {preview.pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!preview.pagination.hasNextPage}
                className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Map Columns */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Map Columns</h3>
            <button
              onClick={() => setStep(2)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {preview?.headers.map((header) => (
              <div key={header} className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {header}
                  </label>
                  <select
                    value={columnMapping[header] || ''}
                    onChange={(e) => updateMapping(header, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select Field --</option>
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="description">Description</option>
                    <option value="category">Category</option>
                    <option value="type">Type</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={Object.keys(columnMapping).length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  Import
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && importResult && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-center mb-6">
            {importResult.success ? (
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            ) : (
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            )}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {importResult.success ? 'Import Completed' : 'Import Failed'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {importResult.success
                ? 'Your transactions have been imported successfully.'
                : 'There were issues with your import. Please check the errors below.'}
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {importResult.summary.totalRows}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {importResult.summary.insertedRows}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Imported</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {importResult.summary.duplicateRows}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Duplicates</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {importResult.summary.errors}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
            </div>
          </div>

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Errors:</h4>
              <div className="max-h-40 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Row
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Error
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {error.row}
                        </td>
                        <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
                          {error.error}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                          <pre className="text-xs bg-gray-100 dark:bg-slate-800 p-2 rounded overflow-x-auto">
                            {JSON.stringify(error.data, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importResult.errors.length > 10 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                  ... and {importResult.errors.length - 10} more errors
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={resetImport}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Start New Import
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Import
