export interface NotificationPreferences {
  budgetAlerts: boolean
  weeklyReports: boolean
  unusualSpending: boolean
  budgetUsageThreshold: number
  weeklyExpenseMultiplier: number
  unusualSpendingAmount: number
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  budgetAlerts: true,
  weeklyReports: false,
  unusualSpending: true,
  budgetUsageThreshold: 80,
  weeklyExpenseMultiplier: 1.25,
  unusualSpendingAmount: 10000
}

const STORAGE_KEY = 'notification_preferences'

export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES
    const parsed = JSON.parse(raw)

    return {
      budgetAlerts: parsed.budgetAlerts ?? DEFAULT_NOTIFICATION_PREFERENCES.budgetAlerts,
      weeklyReports: parsed.weeklyReports ?? DEFAULT_NOTIFICATION_PREFERENCES.weeklyReports,
      unusualSpending: parsed.unusualSpending ?? DEFAULT_NOTIFICATION_PREFERENCES.unusualSpending,
      budgetUsageThreshold: Number(parsed.budgetUsageThreshold) || DEFAULT_NOTIFICATION_PREFERENCES.budgetUsageThreshold,
      weeklyExpenseMultiplier: Number(parsed.weeklyExpenseMultiplier) || DEFAULT_NOTIFICATION_PREFERENCES.weeklyExpenseMultiplier,
      unusualSpendingAmount: Number(parsed.unusualSpendingAmount) || DEFAULT_NOTIFICATION_PREFERENCES.unusualSpendingAmount
    }
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES
  }
}

export const saveNotificationPreferences = (preferences: NotificationPreferences): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}
