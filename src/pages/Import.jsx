import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Eye, Database, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../api'
import API from '../api'

const Import = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [columnMapping, setColumnMapping] = useState({})
  const [importStep, setImportStep] = useState(1) // 1: upload, 2: mapping, 3: dryrun, 4: confirmation
  const [importResult, setImportResult] = useState(null)
  const [dryRunResult, setDryRunResult] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    
    if (selectedFile) {
      await uploadAndPreview(selectedFile)
    }
  }

  const uploadAndPreview = async (csvFile, page = 1) => {
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
        // Initialize preview on first page load
        setPreview(response.data)
        
        // Initialize column mapping with smart defaults
        const mapping = {}
        const headers = response.data.headers
        
        // Smart mapping based on common column names
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
        // Update preview data for pagination
        setPreview(prev => ({
          ...prev,
          data: response.data.data,
          pagination: response.data.pagination
        }))
      }
    } catch (error) {
      console.error('Preview error:', error)
      alert('Failed to preview CSV file')
    } finally {
      setUploading(false)
    }
  }

  const handleMappingChange = (field, value) => {
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
      console.log('Starting import with file:', file.name)
      console.log('File size:', file.size, 'bytes')
      console.log('Column mapping:', columnMapping)
      console.log('API URL:', API.CSV_IMPORT)
      
      // Test if backend is reachable first
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
        timeout: 60000 // 60 second timeout for large files
      })
      
      console.log('Import response received:', response.data)
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (response.data && response.data.success) {
        console.log('Import successful, setting result and moving to step 4')
        setImportResult(response.data)
        setImportStep(4)
        console.log('Import step set to 4, importResult:', response.data)
      } else {
        console.error('Import response indicates failure:', response.data)
        alert(`Import failed: ${response.data?.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Import error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      console.error('Full error object:', error)
      
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
    
    console.log('API BASE URL:', import.meta.env.VITE_API_URL);
    console.log('API CSV_DRY_RUN:', API.CSV_DRY_RUN);
    
    console.log('Starting dry run with file:', file.name)
    console.log('Column mapping:', columnMapping)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('columnMapping', JSON.stringify(columnMapping))
    
    try {
      setUploading(true)
      console.log('Sending dry run request...')
      const response = await api.post(API.CSV_DRY_RUN, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Dry run response:', response.data)
      setDryRunResult(response.data)
      setImportStep(3)
    } catch (error) {
      console.error('Dry run error:', error)
      console.error('Error response:', error.response?.data)
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
  }

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || !preview?.pagination || newPage > preview.pagination.totalPages) return
    
    setCurrentPage(newPage)
    await uploadAndPreview(file, newPage)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Import Transactions</h1>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center ${importStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Upload</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className={`flex items-center ${importStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Map Columns</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className={`flex items-center ${importStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Validate</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className={`flex items-center ${importStep >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              4
            </div>
            <span className="ml-2 font-medium">Import</span>
          </div>
        </div>
      </div>

      {/* Step 1: Upload */}
      {importStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label className="cursor-pointer">
                <span className="text-lg font-medium text-gray-900">Choose a file or drag it here</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">CSV files only (MAX. 10MB)</p>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">{file.name}</span>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
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

      {/* Step 2: Column Mapping */}
      {importStep === 2 && preview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column Mapping */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Map Your Columns</h2>
            <p className="text-sm text-gray-600 mb-6">
              Match your CSV columns to the transaction fields below.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Column *
                </label>
                <select
                  value={columnMapping.date || ''}
                  onChange={(e) => handleMappingChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select date column...</option>
                  {preview.headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Column *
                </label>
                <select
                  value={columnMapping.amount || ''}
                  onChange={(e) => handleMappingChange('amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select amount column...</option>
                  {preview.headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type Column (Income/Expense)
                </label>
                <select
                  value={columnMapping.type || ''}
                  onChange={(e) => handleMappingChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select type column...</option>
                  {preview.headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Column
                </label>
                <select
                  value={columnMapping.category || ''}
                  onChange={(e) => handleMappingChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category column...</option>
                  {preview.headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description Column
                </label>
                <select
                  value={columnMapping.description || ''}
                  onChange={(e) => handleMappingChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select description column...</option>
                  {preview.headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={resetImport}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Start Over
              </button>
              <button
                onClick={handleDryRun}
                disabled={!columnMapping.date || !columnMapping.amount || uploading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Validate Only
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
              {preview?.pagination && (
                <div className="text-sm text-gray-600">
                  Showing {((preview.pagination.page - 1) * preview.pagination.limit) + 1} to {Math.min(preview.pagination.page * preview.pagination.limit, preview.pagination.totalRows)} of {preview.pagination.totalRows} rows
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {preview.headers.map((header, index) => (
                      <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {preview.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {preview?.pagination && preview.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!preview.pagination.hasPrevPage || uploading}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, preview.pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (preview.pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= preview.pagination.totalPages - 2) {
                        pageNum = preview.pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={uploading}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!preview.pagination.hasNextPage || uploading}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  Page {currentPage} of {preview.pagination.totalPages}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Dry Run Results */}
      {importStep === 3 && dryRunResult && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h2>
            <p className="text-sm text-gray-600 mb-6">
              This is a dry run validation. No data has been imported yet. Review the results below and decide whether to proceed with the import.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{dryRunResult.summary.totalRows}</p>
                <p className="text-sm text-blue-700">Total Rows</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{dryRunResult.summary.validRows}</p>
                <p className="text-sm text-green-700">Will Succeed</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-900">{dryRunResult.summary.errorRows}</p>
                <p className="text-sm text-red-700">Will Fail</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Database className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-900">{dryRunResult.summary.duplicateRows}</p>
                <p className="text-sm text-yellow-700">Duplicates</p>
              </div>
            </div>

            {/* Preview of Valid Transactions */}
            {dryRunResult.validation.validTransactions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Preview of transactions that will be imported:</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-green-200">
                      <thead className="bg-green-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Date</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Description</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Amount</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Category</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-green-200">
                        {dryRunResult.validation.validTransactions.map((transaction, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-xs text-gray-900">{new Date(transaction.date).toLocaleDateString()}</td>
                            <td className="px-3 py-2 text-xs text-gray-900">{transaction.description}</td>
                            <td className="px-3 py-2 text-xs text-gray-900">₹{transaction.amount.toFixed(2)}</td>
                            <td className="px-3 py-2 text-xs text-gray-900">{transaction.type}</td>
                            <td className="px-3 py-2 text-xs text-gray-900">{transaction.category}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Errors that will prevent import:</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {dryRunResult.validation.errors.filter(e => !e.isDuplicate).length > 0 ? (
                  <ul className="text-sm text-red-700 space-y-1">
                    {dryRunResult.validation.errors.filter(e => !e.isDuplicate).map((error, index) => (
                      <li key={index}>Row {error.row}: {error.error}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-red-700">No errors to prevent import.</p>
                )}
              </div>
            </div>

            {/* Duplicates */}
            {dryRunResult.validation.duplicates.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Duplicate transactions that will be skipped:</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {dryRunResult.validation.duplicates.map((duplicate, index) => (
                      <li key={index}>Row {duplicate.row}: Duplicate transaction</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setImportStep(2)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                Back to Mapping
              </button>
              <button
                onClick={handleImport}
                disabled={dryRunResult.summary.validRows === 0 || uploading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Commit Import ({dryRunResult.summary.validRows} rows)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Import Results */}
      {importStep === 4 && importResult && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Complete!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{importResult.summary.totalRows}</p>
              <p className="text-sm text-blue-700">Total Rows</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{importResult.summary.insertedRows}</p>
              <p className="text-sm text-green-700">Successfully Imported</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{importResult.summary.skippedRows}</p>
              <p className="text-sm text-red-700">Skipped</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-900">{importResult.summary.errors}</p>
              <p className="text-sm text-yellow-700">Errors</p>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">First few errors:</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="text-sm text-red-700 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>Row {error.row}: {error.error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={resetImport}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Import
