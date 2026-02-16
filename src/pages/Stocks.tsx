import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react'
import { api } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

interface Stock {
  _id: string
  symbol: string
  name: string
  quantity: number
  averageCost: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercentage: number
  createdAt: string
  updatedAt: string
}

interface StockFormData {
  symbol: string
  name: string
  quantity: number
  averageCost: number
}

interface StockPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  timestamp: string
}

const Stocks: React.FC = () => {
  const { formatAmount, formatAmountWithSign } = useCurrency()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [deletingStock, setDeletingStock] = useState<Stock | null>(null)
  const [formData, setFormData] = useState<StockFormData>({
    symbol: '',
    name: '',
    quantity: 0,
    averageCost: 0
  })
  const [priceData, setPriceData] = useState<Record<string, StockPrice[]>>({})
  const [refreshingPrices, setRefreshingPrices] = useState(false)

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/stocks')
      setStocks(Array.isArray(response.data) ? response.data : response.data?.stocks || [])
      await fetchStockPrices()
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
      // If API doesn't exist, set empty array to prevent errors
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStockPrices = async () => {
    try {
      const symbols = stocks.map(stock => stock.symbol).join(',')
      if (symbols) {
        const response = await api.get(`/api/stocks/prices?symbols=${symbols}`)
        const prices: Record<string, StockPrice[]> = {}
        response.data.forEach((price: StockPrice) => {
          if (!prices[price.symbol]) {
            prices[price.symbol] = []
          }
          prices[price.symbol].push(price)
        })
        setPriceData(prices)
      }
    } catch (error) {
      console.error('Failed to fetch stock prices:', error)
      // If API doesn't exist, set empty object to prevent errors
      setPriceData({})
    }
  }

  const refreshPrices = async () => {
    setRefreshingPrices(true)
    await fetchStockPrices()
    setRefreshingPrices(false)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/stocks', formData)
      setShowAddModal(false)
      setFormData({
        symbol: '',
        name: '',
        quantity: 0,
        averageCost: 0
      })
      fetchStocks()
    } catch (error) {
      console.error('Failed to add stock:', error)
    }
  }

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock)
    setFormData({
      symbol: stock.symbol,
      name: stock.name,
      quantity: stock.quantity,
      averageCost: stock.averageCost
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStock) return

    try {
      await api.put(`/api/stocks/${editingStock._id}`, formData)
      setShowEditModal(false)
      setEditingStock(null)
      setFormData({
        symbol: '',
        name: '',
        quantity: 0,
        averageCost: 0
      })
      fetchStocks()
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const handleDelete = (stock: Stock) => {
    setDeletingStock(stock)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingStock) return

    try {
      await api.delete(`/api/stocks/${deletingStock._id}`)
      setShowDeleteModal(false)
      setDeletingStock(null)
      fetchStocks()
    } catch (error) {
      console.error('Failed to delete stock:', error)
    }
  }

  const calculateTotalValue = (): number => {
    return Array.isArray(stocks) ? stocks.reduce((sum, stock) => sum + (stock?.totalValue || 0), 0) : 0
  }

  const calculateTotalGainLoss = (): number => {
    return Array.isArray(stocks) ? stocks.reduce((sum, stock) => sum + (stock?.gainLoss || 0), 0) : 0
  }

  const calculateTotalGainLossPercentage = (): number => {
    const totalCost = Array.isArray(stocks) ? stocks.reduce((sum, stock) => sum + ((stock?.quantity || 0) * (stock?.averageCost || 0)), 0) : 0
    return totalCost > 0 ? (calculateTotalGainLoss() / totalCost) * 100 : 0
  }

  const getLatestPrice = (symbol: string): number => {
    const prices = priceData[symbol]
    return prices && prices.length > 0 ? prices[prices.length - 1].price : 0
  }

  const getLatestChange = (symbol: string): number => {
    const prices = priceData[symbol]
    return prices && prices.length > 0 ? prices[prices.length - 1].change : 0
  }

  const getLatestChangePercent = (symbol: string): number => {
    const prices = priceData[symbol]
    return prices && prices.length > 0 ? prices[prices.length - 1].changePercent : 0
  }

  const getChartData = (symbol: string) => {
    const prices = priceData[symbol] || []
    return prices.slice(-20).map(price => ({
      time: new Date(price.timestamp).toLocaleTimeString(),
      price: price.price
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your stock investments</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={refreshPrices}
            disabled={refreshingPrices}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshingPrices ? 'animate-spin' : ''}`} />
            {refreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Value</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatAmount(calculateTotalValue())}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Gain/Loss</dt>
                <dd className="flex items-baseline">
                  <span className={`text-2xl font-semibold ${
                    calculateTotalGainLoss() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatAmountWithSign(calculateTotalGainLoss(), calculateTotalGainLoss() >= 0 ? 'income' : 'expense')}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-md p-3">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Return %</dt>
                <dd className="flex items-baseline">
                  <span className={`text-2xl font-semibold ${
                    calculateTotalGainLossPercentage() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {calculateTotalGainLossPercentage().toFixed(2)}%
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-900/20 rounded-md p-3">
              <TrendingDown className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Stocks</dt>
                <dd className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stocks.length}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stocks.slice(0, 4).map((stock) => (
          <div key={stock._id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{stock.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stock.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatAmount(getLatestPrice(stock.symbol))}
                </p>
                <p className={`text-sm ${
                  getLatestChange(stock.symbol) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {getLatestChange(stock.symbol) >= 0 ? '+' : ''}{getLatestChange(stock.symbol).toFixed(2)} ({getLatestChangePercent(stock.symbol).toFixed(2)}%)
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={getChartData(stock.symbol)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => [formatAmount(value), 'Price']} />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Stocks Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gain/Loss
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No stocks found
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {stock.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatAmount(stock.averageCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatAmount(stock.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatAmount(stock.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className={`font-medium ${
                          stock.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatAmountWithSign(stock.gainLoss, stock.gainLoss >= 0 ? 'income' : 'expense')}
                        </span>
                        <span className={`ml-2 text-xs ${
                          stock.gainLossPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          ({stock.gainLossPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(stock)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stock)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowAddModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddSubmit}>
                <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Add Stock</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
                          <input
                            type="text"
                            value={formData.symbol}
                            onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            placeholder="e.g., AAPL, GOOGL, MSFT"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            placeholder="e.g., Apple Inc., Google Inc."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Average Cost</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.averageCost}
                            onChange={(e) => setFormData(prev => ({ ...prev, averageCost: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary dark:bg-primary-light text-base font-medium text-white hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {showEditModal && editingStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowEditModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditSubmit}>
                <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Edit Stock</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
                          <input
                            type="text"
                            value={formData.symbol}
                            onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Average Cost</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.averageCost}
                            onChange={(e) => setFormData(prev => ({ ...prev, averageCost: parseFloat(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary dark:bg-primary-light text-base font-medium text-white hover:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Stock Modal */}
      {showDeleteModal && deletingStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Stock</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this stock? This action cannot be undone.
                      </p>
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-md">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{deletingStock.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{deletingStock.symbol}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Quantity: {deletingStock.quantity}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Value: {formatAmount(deletingStock.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 dark:bg-red-600 text-base font-medium text-white hover:bg-red-700 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stocks
