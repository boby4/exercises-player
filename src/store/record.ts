import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TrainingRecord } from '@/types/exercise'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import { isWeapp, cloudGet, cloudAdd, cloudDelete, CloudCollections } from '@/utils/cloud'

interface CloudRecord {
  _id: string
  recordId: string
  date: string
  exerciseIds: string[]
  duration: number
  planId?: string
}

export const useRecordStore = defineStore('record', () => {
  const records = ref<TrainingRecord[]>(getStorage<TrainingRecord[]>(StorageKeys.RECORDS) || [])
  const cloudMap = ref<Map<string, string>>(new Map())
  const syncing = ref(false)

  const totalRecords = computed(() => records.value.length)

  const totalDuration = computed(() => {
    return records.value.reduce((sum, r) => sum + r.duration, 0)
  })

  const recentRecords = computed(() => {
    return records.value.slice(0, 10)
  })

  async function addRecord(exerciseIds: string[], duration: number, planId?: string): Promise<TrainingRecord> {
    const record: TrainingRecord = {
      id: `record_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      exerciseIds,
      duration,
      planId,
      completedAt: new Date().toISOString(),
    }
    records.value.unshift(record)
    save()
    if (isWeapp()) {
      const cloudId = await cloudAdd(CloudCollections.RECORDS, {
        recordId: record.id,
        date: record.date,
        exerciseIds: record.exerciseIds,
        duration: record.duration,
        planId: record.planId || '',
      })
      if (cloudId) cloudMap.value.set(record.id, cloudId)
    }
    return record
  }

  async function deleteRecord(id: string): Promise<void> {
    records.value = records.value.filter((r) => r.id !== id)
    save()
    if (isWeapp()) {
      const cloudId = cloudMap.value.get(id)
      if (cloudId) {
        cloudDelete(CloudCollections.RECORDS, cloudId)
        cloudMap.value.delete(id)
      }
    }
  }

  function getRecordsByDate(date: string): TrainingRecord[] {
    return records.value.filter((r) => r.date === date)
  }

  async function syncFromCloud(): Promise<void> {
    if (!isWeapp() || syncing.value) return
    syncing.value = true
    try {
      const cloudRecords = await cloudGet<CloudRecord>(CloudCollections.RECORDS)
      if (cloudRecords.length > 0) {
        const cloudMapTemp = new Map<string, string>()
        cloudRecords.forEach((cr) => {
          cloudMapTemp.set(cr.recordId, cr._id)
          const existing = records.value.find((r) => r.id === cr.recordId)
          if (!existing) {
            records.value.push({
              id: cr.recordId,
              date: cr.date,
              exerciseIds: cr.exerciseIds,
              duration: cr.duration,
              planId: cr.planId || undefined,
              completedAt: new Date().toISOString(),
            })
          }
        })
        cloudMap.value = cloudMapTemp
        records.value.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        save()
      }
    } catch (e) {
      console.error('Sync records error:', e)
    } finally {
      syncing.value = false
    }
  }

  function save(): void {
    setStorage(StorageKeys.RECORDS, records.value)
  }

  return {
    records,
    totalRecords,
    totalDuration,
    recentRecords,
    addRecord,
    deleteRecord,
    getRecordsByDate,
    syncFromCloud,
  }
})
