import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface CurrencyMeta {
  locale: string
  rateFromINR: number
}

interface CurrencyContextType {
  currency: string
  setCurrency: (value: string) => void
  convertFromINR: (amount: number | string) => number
  convertToINR: (amountInSelectedCurrency: number | string) => number
  getCurrencySymbol: () => string
  formatAmount: (amount: number | string, options?: Intl.NumberFormatOptions) => string
  formatAmountWithSign: (amount: number | string, type: 'income' | 'expense') => string
  supportedCurrencies: string[]
  currencyMeta: Record<string, CurrencyMeta>
}

interface CurrencyProviderProps {
  children: ReactNode
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const CURRENCY_META: Record<string, CurrencyMeta> = {
  INR: { locale: 'en-IN', rateFromINR: 1 },
  USD: { locale: 'en-US', rateFromINR: 0.012 },
  EUR: { locale: 'de-DE', rateFromINR: 0.011 },
  GBP: { locale: 'en-GB', rateFromINR: 0.0095 },
  JPY: { locale: 'ja-JP', rateFromINR: 1.79 },
  AUD: { locale: 'en-AU', rateFromINR: 0.0185 },
  CAD: { locale: 'en-CA', rateFromINR: 0.0163 },
  CNY: { locale: 'zh-CN', rateFromINR: 0.086 }
}

const LEGACY_SYMBOL_TO_CODE: Record<string, string> = {
  '₹': 'INR',
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  'A$': 'AUD',
  'C$': 'CAD'
}

const normalizeCurrency = (value: string | null | undefined): string => {
  if (!value) return 'INR'
  if (CURRENCY_META[value]) return value
  return LEGACY_SYMBOL_TO_CODE[value] || 'INR'
}

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>('INR')
  const [ratesFromINR, setRatesFromINR] = useState<Record<string, number>>(
    Object.fromEntries(
      Object.entries(CURRENCY_META).map(([code, meta]) => [code, meta.rateFromINR])
    )
  )

  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency')
    const normalized = normalizeCurrency(savedCurrency)
    setCurrencyState(normalized)
    localStorage.setItem('selectedCurrency', normalized)

    const cachedRatesRaw = localStorage.getItem('currency_rates_from_inr')
    const cachedAtRaw = localStorage.getItem('currency_rates_updated_at')
    const cachedAt = Number(cachedAtRaw) || 0
    const isFresh = Date.now() - cachedAt < 24 * 60 * 60 * 1000

    if (cachedRatesRaw && isFresh) {
      try {
        const cachedRates = JSON.parse(cachedRatesRaw)
        if (cachedRates && typeof cachedRates === 'object') {
          setRatesFromINR((prev) => ({ ...prev, ...cachedRates }))
          return
        }
      } catch (error) {
        // Ignore cache parse errors and fetch fresh rates.
      }
    }

    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/INR')
        const payload = await response.json()
        if (payload?.result !== 'success' || !payload?.rates) return

        const nextRates: Record<string, number> = {
          INR: 1,
          USD: Number(payload.rates.USD) || CURRENCY_META.USD.rateFromINR,
          EUR: Number(payload.rates.EUR) || CURRENCY_META.EUR.rateFromINR,
          GBP: Number(payload.rates.GBP) || CURRENCY_META.GBP.rateFromINR,
          JPY: Number(payload.rates.JPY) || CURRENCY_META.JPY.rateFromINR,
          AUD: Number(payload.rates.AUD) || CURRENCY_META.AUD.rateFromINR,
          CAD: Number(payload.rates.CAD) || CURRENCY_META.CAD.rateFromINR,
          CNY: Number(payload.rates.CNY) || CURRENCY_META.CNY.rateFromINR
        }

        setRatesFromINR(nextRates)
        localStorage.setItem('currency_rates_from_inr', JSON.stringify(nextRates))
        localStorage.setItem('currency_rates_updated_at', String(Date.now()))
      } catch (error) {
        // Keep fallback static rates if network fetch fails.
      }
    }

    fetchRates()
  }, [])

  const setCurrency = (value: string): void => {
    const normalized = normalizeCurrency(value)
    setCurrencyState(normalized)
    localStorage.setItem('selectedCurrency', normalized)
  }

  const convertFromINR = (amount: number | string): number => {
    const numericAmount = Number(amount) || 0
    const rate = ratesFromINR[currency] || CURRENCY_META[currency].rateFromINR
    return numericAmount * rate
  }

  const convertToINR = (amountInSelectedCurrency: number | string): number => {
    const numericAmount = Number(amountInSelectedCurrency) || 0
    const rate = ratesFromINR[currency] || CURRENCY_META[currency].rateFromINR
    if (!rate) return 0
    return numericAmount / rate
  }

  const getCurrencySymbol = (): string => {
    try {
      const parts = new Intl.NumberFormat(CURRENCY_META[currency].locale, {
        style: 'currency',
        currency
      }).formatToParts(0)
      return parts.find((part) => part.type === 'currency')?.value || currency
    } catch (error) {
      return currency
    }
  }

  const formatAmount = (amount: number | string, options: Intl.NumberFormatOptions = {}): string => {
    const converted = convertFromINR(amount)
    return new Intl.NumberFormat(CURRENCY_META[currency].locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    }).format(converted)
  }

  const formatAmountWithSign = (amount: number | string, type: 'income' | 'expense'): string => {
    const sign = type === 'income' ? '+' : '-'
    return `${sign}${formatAmount(amount)}`
  }

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    convertFromINR,
    convertToINR,
    getCurrencySymbol,
    formatAmount,
    formatAmountWithSign,
    supportedCurrencies: Object.keys(CURRENCY_META),
    currencyMeta: CURRENCY_META
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}
