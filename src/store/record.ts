import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TrainingRecord } from '@/types/exercise'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'

export const useRecordStore = defineStore('record', () => {
  const records = ref<TrainingRecord[]>(getStorage<TrainingRecord[]>(StorageKeys.RECORDS) || [])

  const totalRecords = computed(() => records.value.length)

  const totalDuration = computed(() => {
    return records.value.reduce((sum, r) => sum + r.duration, 0)
  })

  const recentRecords = computed(() => {
    return records.value.slice(0, 10)
  })

  function addRecord(exerciseIds: string[], duration: number, planId?: string): TrainingRecord {
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
    return record
  }

  function deleteRecord(id: string): void {
    records.value = records.value.filter((r) => r.id !== id)
    save()
  }

  function getRecordsByDate(date: string): TrainingRecord[] {
    return records.value.filter((r) => r.date === date)
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
  }
})
