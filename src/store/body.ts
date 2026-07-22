import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import { isWeapp, cloudGet, cloudAdd, cloudUpdate, CloudCollections } from '@/utils/cloud'
import type { Gender, ActivityLevel } from '@/utils/calculator'

interface BodyData {
  height: number     // cm
  weight: number     // kg
  gender: Gender
  age: number
  activityLevel: ActivityLevel
}

interface CloudBodyData extends BodyData {
  _id: string
  _openid: string
  updatedAt: string
}

const DEFAULT_DATA: BodyData = {
  height: 170,
  weight: 65,
  gender: 'male',
  age: 25,
  activityLevel: 1.55,
}

export const useBodyStore = defineStore('body', () => {
  const bodyData = ref<BodyData>(getStorage<BodyData>(StorageKeys.BODY_DATA) || { ...DEFAULT_DATA })
  const cloudDocId = ref<string | null>(null)
  const syncing = ref(false)

  const hasData = computed(() => bodyData.value.height > 0 && bodyData.value.weight > 0)

  function updateData(partial: Partial<BodyData>): void {
    bodyData.value = { ...bodyData.value, ...partial }
    save()
    saveToCloud()
  }

  function save(): void {
    setStorage(StorageKeys.BODY_DATA, bodyData.value)
  }

  async function saveToCloud(): Promise<void> {
    if (!isWeapp()) return
    try {
      const data = { ...bodyData.value, updatedAt: new Date().toISOString() }
      if (cloudDocId.value) {
        await cloudUpdate(CloudCollections.BODY_DATA, cloudDocId.value, data)
      } else {
        const id = await cloudAdd(CloudCollections.BODY_DATA, data)
        if (id) cloudDocId.value = id
      }
    } catch (e) {
      console.error('Save body data error:', e)
    }
  }

  async function syncFromCloud(): Promise<void> {
    if (!isWeapp() || syncing.value) return
    syncing.value = true
    try {
      const cloudData = await cloudGet<CloudBodyData>(CloudCollections.BODY_DATA)
      if (cloudData.length > 0) {
        const latest = cloudData[0]
        cloudDocId.value = latest._id
        // 合并：云端数据更新则使用云端
        bodyData.value = {
          height: latest.height || bodyData.value.height,
          weight: latest.weight || bodyData.value.weight,
          gender: latest.gender || bodyData.value.gender,
          age: latest.age || bodyData.value.age,
          activityLevel: latest.activityLevel || bodyData.value.activityLevel,
        }
        save()
      }
    } catch (e) {
      console.error('Sync body data error:', e)
    } finally {
      syncing.value = false
    }
  }

  return {
    bodyData,
    hasData,
    updateData,
    syncFromCloud,
  }
})
