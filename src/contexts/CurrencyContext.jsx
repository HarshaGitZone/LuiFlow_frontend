import React, { createContext, useContext, useEffect, useState } from 'react'

const CurrencyContext = createContext()

const CURRENCY_META = {
  INR: { locale: 'en-IN', rateFromINR: 1 },
  USD: { locale: 'en-US', rateFromINR: 0.012 },
  EUR: { locale: 'de-DE', rateFromINR: 0.011 },
  GBP: { locale: 'en-GB', rateFromINR: 0.0095 },
  JPY: { locale: 'ja-JP', rateFromINR: 1.79 },
  AUD: { locale: 'en-AU', rateFromINR: 0.0185 },
  CAD: { locale: 'en-CA', rateFromINR: 0.0163 },
  CNY: { locale: 'zh-CN', rateFromINR: 0.086 }
}

const LEGACY_SYMBOL_TO_CODE = {
  '₹': 'INR',
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  'A$': 'AUD',
  'C$': 'CAD'
}

const normalizeCurrency = (value) => {
  if (!value) return 'INR'
  if (CURRENCY_META[value]) return value
  return LEGACY_SYMBOL_TO_CODE[value] || 'INR'
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState('INR')
  const [ratesFromINR, setRatesFromINR] = useState(
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

        const nextRates = {
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

  const setCurrency = (value) => {
    const normalized = normalizeCurrency(value)
    setCurrencyState(normalized)
    localStorage.setItem('selectedCurrency', normalized)
  }

  const convertFromINR = (amount) => {
    const numericAmount = Number(amount) || 0
    const rate = ratesFromINR[currency] || CURRENCY_META[currency].rateFromINR
    return numericAmount * rate
  }

  const convertToINR = (amountInSelectedCurrency) => {
    const numericAmount = Number(amountInSelectedCurrency) || 0
    const rate = ratesFromINR[currency] || CURRENCY_META[currency].rateFromINR
    if (!rate) return 0
    return numericAmount / rate
  }

  const getCurrencySymbol = () => {
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

  const formatAmount = (amount, options = {}) => {
    const converted = convertFromINR(amount)
    return new Intl.NumberFormat(CURRENCY_META[currency].locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    }).format(converted)
  }

  const formatAmountWithSign = (amount, type) => {
    const sign = type === 'income' ? '+' : '-'
    return `${sign}${formatAmount(amount)}`
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertFromINR,
        convertToINR,
        getCurrencySymbol,
        formatAmount,
        formatAmountWithSign,
        supportedCurrencies: Object.keys(CURRENCY_META),
        currencyMeta: CURRENCY_META
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
