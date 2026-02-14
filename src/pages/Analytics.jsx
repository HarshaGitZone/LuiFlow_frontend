import React from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react'

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-semibold text-gray-900">$12,450</p>
              <p className="text-xs text-green-600">+15.3% vs last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">$8,320</p>
              <p className="text-xs text-red-600">+8.7% vs last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Flow</p>
              <p className="text-2xl font-semibold text-gray-900">$4,130</p>
              <p className="text-xs text-blue-600">+42.1% vs last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Daily</p>
              <p className="text-2xl font-semibold text-gray-900">$137.67</p>
              <p className="text-xs text-purple-600">Spending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
          <div className="space-y-3">
            {[
              { category: 'Food', amount: 1250, percentage: 35, color: 'bg-blue-600' },
              { category: 'Transport', amount: 450, percentage: 13, color: 'bg-green-600' },
              { category: 'Entertainment', amount: 320, percentage: 9, color: 'bg-yellow-600' },
              { category: 'Utilities', amount: 280, percentage: 8, color: 'bg-purple-600' },
              { category: 'Other', amount: 1240, percentage: 35, color: 'bg-red-600' },
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-semibold text-gray-900">${item.amount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full`} 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h2>
          <div className="space-y-3">
            {[
              { month: 'Jan', income: 12000, expenses: 8320, net: 3680 },
              { month: 'Feb', income: 11500, expenses: 7800, net: 3700 },
              { month: 'Mar', income: 13000, expenses: 9200, net: 3800 },
              { month: 'Apr', income: 12500, expenses: 8500, net: 4000 },
              { month: 'May', income: 14000, expenses: 9800, net: 4200 },
              { month: 'Jun', income: 13500, expenses: 8900, net: 4600 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 w-12">{item.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-xs text-green-600 w-8">+</span>
                    <span className="text-sm font-semibold text-green-900">${item.income.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-red-600 w-8">-</span>
                    <span className="text-sm font-semibold text-red-900">${item.expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-blue-600 w-8">=</span>
                    <span className={`text-sm font-bold ${
                      item.net > 0 ? 'text-blue-900' : 'text-red-900'
                    }`}>
                      ${item.net.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { category: 'Food', amount: 1250, percentage: 35, trend: 'up' },
                { category: 'Other', amount: 1240, percentage: 35, trend: 'down' },
                { category: 'Transport', amount: 450, percentage: 13, trend: 'stable' },
                { category: 'Entertainment', amount: 320, percentage: 9, trend: 'up' },
                { category: 'Utilities', amount: 280, percentage: 8, trend: 'down' },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`flex items-center ${
                      item.trend === 'up' ? 'text-green-600' :
                      item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {item.trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                      {item.trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                      {item.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics
