import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import axios from 'axios'

const Import = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [columnMapping, setColumnMapping] = useState({})
  const [importStep, setImportStep] = useState(1) // 1: upload, 2: mapping, 3: confirmation
  const [importResult, setImportResult] = useState(null)

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    
    if (selectedFile) {
      await uploadAndPreview(selectedFile)
    }
  }

  const uploadAndPreview = async (csvFile) => {
    const formData = new FormData()
    formData.append('file', csvFile)
    
    try {
      setUploading(true)
      const response = await axios.post('http://localhost:10000/api/csv/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
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
      const response = await axios.post('http://localhost:10000/api/csv/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setImportResult(response.data)
      setImportStep(3)
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import CSV file')
    } finally {
      setUploading(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setPreview(null)
    setColumnMapping({})
    setImportResult(null)
    setImportStep(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Import Transactions</h1>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-4">
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
                onClick={handleImport}
                disabled={!columnMapping.date || !columnMapping.amount || uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Import Transactions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview (First 20 rows)</h2>
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
                  {preview.data.slice(0, 10).map((row, rowIndex) => (
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
            
            {preview.data.length > 10 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Showing 10 of {preview.totalRows} rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Import Results */}
      {importStep === 3 && importResult && (
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
