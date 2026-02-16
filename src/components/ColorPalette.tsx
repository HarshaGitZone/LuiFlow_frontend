import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const ColorPalette: React.FC = () => {
  const { availableColors, colorPalette, setColorPalette } = useTheme()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Color Theme</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(availableColors).map(([key, palette]) => (
          <button
            key={key}
            onClick={() => setColorPalette(key)}
            className={`p-3 rounded-lg border-2 transition-all ${
              colorPalette === key
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
            }`}
            title={palette.name}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800"
                style={{ backgroundColor: palette.primary }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {palette.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ColorPalette
