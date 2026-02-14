import React from 'react'
import { Plus, PiggyBank, TrendingUp, AlertCircle } from 'lucide-react'

const Budgets = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Monthly Food Budget',
            category: 'Food',
            amount: 1500,
            spent: 1250,
            remaining: 250,
            period: 'Monthly',
            status: 'on-track'
          },
          {
            name: 'Transport Budget',
            category: 'Transport',
            amount: 500,
            spent: 450,
            remaining: 50,
            period: 'Monthly',
            status: 'on-track'
          },
          {
            name: 'Entertainment Budget',
            category: 'Entertainment',
            amount: 300,
            spent: 320,
            remaining: -20,
            period: 'Monthly',
            status: 'over'
          },
          {
            name: 'Utilities Budget',
            category: 'Utilities',
            amount: 400,
            spent: 280,
            remaining: 120,
            period: 'Monthly',
            status: 'under'
          },
          {
            name: 'Savings Goal',
            category: 'Savings',
            amount: 2000,
            spent: 1800,
            remaining: 200,
            period: 'Monthly',
            status: 'on-track'
          },
          {
            name: 'Emergency Fund',
            category: 'Emergency',
            amount: 1000,
            spent: 0,
            remaining: 1000,
            period: 'Monthly',
            status: 'under'
          }
        ].map((budget, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                budget.status === 'under' ? 'bg-green-100 text-green-800' :
                budget.status === 'on-track' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {budget.status === 'under' ? 'Under Budget' :
                 budget.status === 'on-track' ? 'On Track' : 'Over Budget'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Budget Amount</span>
                <span className="text-lg font-semibold text-gray-900">${budget.amount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Spent</span>
                <span className="text-lg font-semibold text-gray-900">${budget.spent}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className={`text-lg font-semibold ${
                  budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${Math.abs(budget.remaining)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm text-gray-900">
                    {Math.round((budget.spent / budget.amount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      budget.status === 'under' ? 'bg-green-600' :
                      budget.status === 'on-track' ? 'bg-yellow-600' : 'bg-red-600'
                    }`} 
                    style={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
              <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                Edit Budget
              </button>
              <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <PiggyBank className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">$6,000</p>
            <p className="text-sm text-blue-700">Total Budget</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">$4,100</p>
            <p className="text-sm text-green-700">Total Spent</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">$1,900</p>
            <p className="text-sm text-yellow-700">Total Remaining</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <PiggyBank className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">68%</p>
            <p className="text-sm text-purple-700">Budget Used</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Budgets
