import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const colorPalettes = {
  blue: {
    name: 'Ocean Blue',
    primary: '#3b82f6',
    primaryDark: '#1d4ed8',
    primaryLight: '#60a5fa',
    primaryBg: '#eff6ff',
    primaryBgDark: '#1e3a8a'
  },
  emerald: {
    name: 'Emerald Green',
    primary: '#10b981',
    primaryDark: '#047857',
    primaryLight: '#34d399',
    primaryBg: '#ecfdf5',
    primaryBgDark: '#064e3b'
  },
  rose: {
    name: 'Rose Pink',
    primary: '#f43f5e',
    primaryDark: '#be123c',
    primaryLight: '#fb7185',
    primaryBg: '#fff1f2',
    primaryBgDark: '#881337'
  },
  amber: {
    name: 'Golden Amber',
    primary: '#f59e0b',
    primaryDark: '#d97706',
    primaryLight: '#fbbf24',
    primaryBg: '#fffbeb',
    primaryBgDark: '#78350f'
  },
  purple: {
    name: 'Royal Purple',
    primary: '#8b5cf6',
    primaryDark: '#6d28d9',
    primaryLight: '#a78bfa',
    primaryBg: '#f5f3ff',
    primaryBgDark: '#4c1d95'
  },
  teal: {
    name: 'Teal Cyan',
    primary: '#14b8a6',
    primaryDark: '#0f766e',
    primaryLight: '#2dd4bf',
    primaryBg: '#f0fdfa',
    primaryBgDark: '#134e4a'
  },
  orange: {
    name: 'Sunset Orange',
    primary: '#f97316',
    primaryDark: '#ea580c',
    primaryLight: '#fb923c',
    primaryBg: '#fff7ed',
    primaryBgDark: '#7c2d12'
  },
  slate: {
    name: 'Slate Gray',
    primary: '#64748b',
    primaryDark: '#475569',
    primaryLight: '#94a3b8',
    primaryBg: '#f8fafc',
    primaryBgDark: '#1e293b'
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme')
    return storedTheme === 'dark' ? 'dark' : 'light'
  })

  const [colorPalette, setColorPalette] = useState(() => {
    const storedColor = localStorage.getItem('colorPalette')
    return storedColor || 'blue'
  })

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const colors = colorPalettes[colorPalette]
    const root = document.documentElement
    
    // Set CSS custom properties for dynamic theming
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-dark', colors.primaryDark)
    root.style.setProperty('--color-primary-light', colors.primaryLight)
    root.style.setProperty('--color-primary-bg', colors.primaryBg)
    root.style.setProperty('--color-primary-bg-dark', colors.primaryBgDark)
    
    localStorage.setItem('colorPalette', colorPalette)
  }, [colorPalette])

  const value = useMemo(() => {
    return {
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      colorPalette,
      setColorPalette,
      availableColors: colorPalettes
    }
  }, [theme, colorPalette])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
