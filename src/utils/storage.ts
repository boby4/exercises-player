import Taro from '@tarojs/taro'

export const StorageKeys = {
  FAVORITES: 'ep_favorites',
  PLANS: 'ep_plans',
  RECORDS: 'ep_records',
  RECENT: 'ep_recent',
  SETTINGS: 'ep_settings',
  TIMER_DURATION: 'ep_timer_duration',
} as const

export function getStorage<T>(key: string): T | null {
  try {
    const data = Taro.getStorageSync(key)
    return data ? (data as T) : null
  } catch {
    return null
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    Taro.setStorageSync(key, value)
  } catch (e) {
    console.error('setStorage error:', e)
  }
}

export function removeStorage(key: string): void {
  try {
    Taro.removeStorageSync(key)
  } catch (e) {
    console.error('removeStorage error:', e)
  }
}

export function appendToList<T>(key: string, item: T, maxLen = 100): void {
  const list = getStorage<T[]>(key) || []
  const filtered = list.filter((i) => i !== item)
  filtered.unshift(item)
  if (filtered.length > maxLen) filtered.length = maxLen
  setStorage(key, filtered)
}
