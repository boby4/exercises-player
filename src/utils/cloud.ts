import Taro from '@tarojs/taro'

const ENV_ID = 'cloudbase-d4gcmht1z6dda3d54'

export const CloudCollections = {
  FAVORITES: 'favorites',
  PLANS: 'plans',
  RECORDS: 'records',
  BODY_DATA: 'bodyData',
} as const

let initialized = false

export function isWeapp(): boolean {
  return process.env.TARO_ENV === 'weapp'
}

export function initCloud(): void {
  if (!isWeapp() || initialized) return
  try {
    const cloud = (Taro as any).cloud || (globalThis as any).wx?.cloud
    if (!cloud) {
      console.error('Cloud SDK not found')
      return
    }
    cloud.init({
      env: ENV_ID,
      traceUser: true,
    })
    initialized = true
    console.log('Cloud initialized, env:', ENV_ID)
  } catch (e) {
    console.error('Cloud init error:', e)
  }
}

interface CloudResult<T = any> {
  code: number
  data?: T
  id?: string
  msg?: string
}

async function callCloud<T>(params: Record<string, any>): Promise<CloudResult<T>> {
  if (!isWeapp()) {
    console.log('callCloud skipped: not weapp')
    return { code: -1, msg: 'Cloud only available on mini program' }
  }
  const cloud = (Taro as any).cloud || (globalThis as any).wx?.cloud
  if (!cloud) {
    console.error('callCloud failed: cloud SDK not found')
    return { code: -1, msg: 'Cloud SDK not found' }
  }
  try {
    console.log('callCloud:', params.action, params.collection)
    const res = await cloud.callFunction({
      name: 'syncData',
      data: params,
    })
    const result = res.result as any
    console.log('callCloud result:', JSON.stringify(result))
    return result as CloudResult<T>
  } catch (e: any) {
    console.error('Cloud call error:', e)
    return { code: -1, msg: e.message || 'Network error' }
  }
}

export async function cloudGet<T>(collection: string): Promise<T[]> {
  const res = await callCloud<T[]>({ action: 'get', collection })
  return res.code === 0 ? (res.data || []) : []
}

export async function cloudAdd(collection: string, data: Record<string, any>): Promise<string | null> {
  const res = await callCloud({ action: 'add', collection, data })
  return res.code === 0 ? (res.id || null) : null
}

export async function cloudUpdate(collection: string, id: string, data: Record<string, any>): Promise<boolean> {
  const res = await callCloud({ action: 'update', collection, id, data })
  return res.code === 0
}

export async function cloudDelete(collection: string, id: string): Promise<boolean> {
  const res = await callCloud({ action: 'delete', collection, id })
  return res.code === 0
}

// Test function - call from console: testCloudWrite()
export async function testCloudWrite(): Promise<void> {
  console.log('=== Cloud Write Test ===')
  const res = await cloudAdd('favorites', { exerciseId: 'test_exercise_001', test: true })
  console.log('testCloudWrite result:', res)
  const list = await cloudGet('favorites')
  console.log('testCloudWrite list:', list)
}
