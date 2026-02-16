import React, { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, TrendingDown, DollarSign, RefreshCw, Edit2, Trash2, X, BarChart3, PieChart, Info } from 'lucide-react';
import { api } from '../api';
import PortfolioChart from '../components/PortfolioChart';

const Stocks = () => {
  const [holdings, setHoldings] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvested: 0,
    currentValue: 0,
    totalPnL: 0,
    totalPnLPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [historicalData, setHistoricalData] = useState({});
  const [showCharts, setShowCharts] = useState(false);

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    buyPrice: '',
    buyDate: '',
    currency: 'USD',
    exchange: 'NASDAQ',
    notes: ''
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    const handlePortfolioUpdate = () => {
      fetchPortfolio();
    };

    window.addEventListener('portfolio-updated', handlePortfolioUpdate);
    return () => window.removeEventListener('portfolio-updated', handlePortfolioUpdate);
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/api/portfolio');
      setHoldings(response.data.holdings);
      setPortfolioStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/portfolio/analytics');
      setAnalytics(response.data);
      setShowAnalytics(true);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const searchStocks = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await api.get(`/api/stocks/search?keywords=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching stocks:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectStock = (stock) => {
    setFormData({
      ...formData,
      symbol: stock.symbol,
      name: stock.name,
      currency: stock.currency || 'USD'
    });
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHolding) {
        await api.put(`/api/portfolio/${editingHolding._id}`, formData);
      } else {
        await api.post('/api/portfolio', formData);
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingHolding(null);
      resetForm();
      fetchPortfolio();
    } catch (error) {
      console.error('Error saving holding:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      quantity: '',
      buyPrice: '',
      buyDate: '',
      currency: 'USD',
      exchange: 'NASDAQ',
      notes: ''
    });
  };

  const editHolding = (holding) => {
    setEditingHolding(holding);
    setFormData({
      symbol: holding.symbol,
      name: holding.name,
      quantity: holding.quantity,
      buyPrice: holding.buyPrice,
      buyDate: holding.buyDate.split('T')[0],
      currency: holding.currency,
      exchange: holding.exchange,
      notes: holding.notes || ''
    });
    setShowEditModal(true);
  };

  const deleteHolding = async (id) => {
    if (window.confirm('Are you sure you want to delete this holding?')) {
      try {
        await api.delete(`/api/portfolio/${id}`);
        fetchPortfolio();
      } catch (error) {
        console.error('Error deleting holding:', error);
      }
    }
  };

  const updatePrices = async () => {
    setUpdatingPrices(true);
    try {
      await api.post('/api/portfolio/update-prices');
      fetchPortfolio();
    } catch (error) {
      console.error('Error updating prices:', error);
    } finally {
      setUpdatingPrices(false);
    }
  };

  const getStockDetails = async (symbol) => {
    try {
      const [quote, overview] = await Promise.all([
        api.get(`/api/stocks/quote/${symbol}`),
        api.get(`/api/stocks/overview/${symbol}`)
      ]);
      
      setSelectedStock({ ...quote.data, ...overview.data });
      setShowStockDetails(true);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your investment portfolio</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCharts(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <BarChart3 size={18} />
            Charts
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 size={18} />
            Analytics
          </button>
          <button
            onClick={updatePrices}
            disabled={updatingPrices || holdings.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={updatingPrices ? 'animate-spin' : ''} size={18} />
            {updatingPrices ? 'Updating...' : 'Update Prices'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Add Holding
          </button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(portfolioStats.totalInvested)}
              </p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(portfolioStats.currentValue)}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
              <p className={`text-2xl font-bold ${portfolioStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolioStats.totalPnL)}
              </p>
            </div>
            {portfolioStats.totalPnL >= 0 ? (
              <TrendingUp className="text-green-500" size={24} />
            ) : (
              <TrendingDown className="text-red-500" size={24} />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Return %</p>
              <p className={`text-2xl font-bold ${portfolioStats.totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(portfolioStats.totalPnLPercentage)}
              </p>
            </div>
            <PieChart className={portfolioStats.totalPnLPercentage >= 0 ? 'text-green-500' : 'text-red-500'} size={24} />
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Holdings</h2>
        </div>
        
        {holdings.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No holdings yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start building your portfolio by adding your first stock</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Holding
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Buy Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {holdings.map((holding) => (
                  <tr key={holding._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {holding.symbol}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {holding.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {holding.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(holding.buyPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(holding.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${holding.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(holding.unrealizedPnL)}
                      </div>
                      <div className={`text-xs ${holding.unrealizedPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(holding.unrealizedPnLPercentage)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => getStockDetails(holding.symbol)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Info size={16} />
                        </button>
                        <button
                          onClick={() => editHolding(holding)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteHolding(holding._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Holding</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Stock Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Stock
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by symbol or company name..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    onChange={(e) => searchStocks(e.target.value)}
                  />
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => selectStock(stock)}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.000001"
                    min="0.000001"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buy Price *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Buy Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.buyDate}
                  onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exchange
                  </label>
                  <select
                    value={formData.exchange}
                    onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="NASDAQ">NASDAQ</option>
                    <option value="NYSE">NYSE</option>
                    <option value="LSE">LSE</option>
                    <option value="NSE">NSE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holding Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Holding</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingHolding(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.000001"
                    min="0.000001"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buy Price *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Buy Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.buyDate}
                  onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingHolding(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Details Modal */}
      {showStockDetails && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedStock.symbol} - {selectedStock.name}
              </h2>
              <button
                onClick={() => {
                  setShowStockDetails(false);
                  setSelectedStock(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(selectedStock.price)}
                </div>
                <div className={`text-sm ${selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedStock.change >= 0 ? '+' : ''}{formatCurrency(selectedStock.change)} ({formatPercentage(selectedStock.changePercent)})
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Range</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(selectedStock.low)} - {formatCurrency(selectedStock.high)}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedStock.volume ? selectedStock.volume.toLocaleString() : 'N/A'}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Previous Close</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(selectedStock.previousClose)}
                </div>
              </div>

              {selectedStock.marketCap && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {(selectedStock.marketCap / 1000000000).toFixed(2)}B
                  </div>
                </div>
              )}

              {selectedStock.sector && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sector</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedStock.sector}
                  </div>
                </div>
              )}
            </div>

            {selectedStock.description && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Company Description</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedStock.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Modal */}
      {showCharts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio Charts & Analytics</h2>
              <button
                onClick={() => setShowCharts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Distribution Pie Chart */}
              <PortfolioChart
                type="pie"
                title="Portfolio Distribution"
                data={analytics?.portfolioDistribution?.map(stock => ({
                  name: stock.symbol,
                  value: stock.value,
                  percentage: stock.percentage
                })) || []}
              />

              {/* Performance Bar Chart */}
              <PortfolioChart
                type="performance"
                title="Performance by Stock"
                data={analytics?.topPerformers?.concat(analytics?.worstPerformers || [])?.map(stock => ({
                  symbol: stock.symbol,
                  pnlPercentage: stock.pnlPercentage
                })) || []}
              />

              {/* Portfolio Value Bar Chart */}
              <PortfolioChart
                type="bar"
                title="Holdings by Value"
                data={holdings.map(holding => ({
                  name: holding.symbol,
                  value: holding.currentValue
                }))}
              />

              {/* Top Holdings Chart */}
              <PortfolioChart
                type="bar"
                title="Top 10 Holdings"
                data={holdings
                  .sort((a, b) => b.currentValue - a.currentValue)
                  .slice(0, 10)
                  .map(holding => ({
                    name: holding.symbol,
                    value: holding.currentValue
                  }))}
              />
            </div>

            {/* Portfolio Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Total Invested</h4>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {formatCurrency(portfolioStats.totalInvested)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">Current Value</h4>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {formatCurrency(portfolioStats.currentValue)}
                </p>
              </div>
              <div className={`${portfolioStats.totalPnL >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} p-4 rounded-lg`}>
                <h4 className={`text-sm font-medium ${portfolioStats.totalPnL >= 0 ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'} mb-1`}>
                  Total P&L
                </h4>
                <p className={`text-2xl font-bold ${portfolioStats.totalPnL >= 0 ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'}`}>
                  {formatCurrency(portfolioStats.totalPnL)} ({formatPercentage(portfolioStats.totalPnLPercentage)})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Performers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Performers</h3>
                <div className="space-y-2">
                  {analytics.topPerformers.map((stock, index) => (
                    <div key={stock._id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {formatPercentage(stock.pnlPercentage)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(stock.pnlAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worst Performers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Worst Performers</h3>
                <div className="space-y-2">
                  {analytics.worstPerformers.map((stock, index) => (
                    <div key={stock._id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          {formatPercentage(stock.pnlPercentage)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(stock.pnlAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Distribution */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Portfolio Distribution</h3>
                <div className="space-y-2">
                  {analytics.portfolioDistribution.map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(stock.value)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stock.percentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stock.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;
