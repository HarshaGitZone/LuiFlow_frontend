import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Palette, Check } from 'lucide-react'

const ColorPalette: React.FC = () => {
  const { colorPalette, setColorPalette, availableColors, isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleColorSelect = (colorKey: string) => {
    setColorPalette(colorKey)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
        aria-label="Color palette"
      >
        <Palette className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed sm:absolute top-16 sm:top-auto right-2 sm:right-0 left-2 sm:left-auto mt-0 sm:mt-2 w-auto sm:w-[22rem] max-w-none sm:max-w-[calc(100vw-1rem)] max-h-[calc(100vh-5rem)] overflow-y-auto bg-white dark:bg-slate-900 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-[70]">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Color Theme
            </h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Object.entries(availableColors).map(([key, colors]) => (
                <button
                  key={key}
                  onClick={() => handleColorSelect(key)}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden min-w-0 ${
                    colorPalette === key
                      ? 'border-gray-900 dark:border-slate-100 shadow-md'
                      : 'border-gray-200 dark:border-slate-500 hover:border-gray-300 dark:hover:border-slate-300'
                  }`}
                  style={{
                    backgroundColor: isDark ? colors.primaryBgDark : colors.primaryBg,
                    color: isDark ? '#e2e8f0' : '#334155'
                  }}
                  title={colors.name}
                >
                  <div
                    className="w-full h-6 rounded-md mb-1"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})` 
                    }}
                  />
                  <div className="text-[11px] leading-tight text-center font-semibold tracking-wide truncate">
                    {colors.name.split(' ')[0]}
                  </div>
                  {colorPalette === key && (
                    <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 border-2 border-gray-900 dark:border-slate-100">
                      <Check className="h-3 w-3 text-gray-900 dark:text-slate-100" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Choose a color theme to personalize your experience
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorPalette
