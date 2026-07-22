import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Exercise } from '@/types/exercise'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import { getExercisesByIds } from '@/utils/data'
import { isWeapp, cloudGet, cloudAdd, cloudDelete, CloudCollections } from '@/utils/cloud'

interface CloudFavorite {
  _id: string
  exerciseId: string
}

export const useFavoriteStore = defineStore('favorite', () => {
  const favoriteIds = ref<string[]>(getStorage<string[]>(StorageKeys.FAVORITES) || [])
  const cloudMap = ref<Map<string, string>>(new Map())
  const syncing = ref(false)

  const count = computed(() => favoriteIds.value.length)

  const favoriteExercises = computed<Exercise[]>(() => {
    return getExercisesByIds(favoriteIds.value)
  })

  function isFavorite(id: string): boolean {
    return favoriteIds.value.includes(id)
  }

  async function toggleFavorite(id: string): Promise<void> {
    if (isFavorite(id)) {
      favoriteIds.value = favoriteIds.value.filter((fid) => fid !== id)
      if (isWeapp()) {
        const cloudId = cloudMap.value.get(id)
        if (cloudId) {
          cloudDelete(CloudCollections.FAVORITES, cloudId)
          cloudMap.value.delete(id)
        }
      }
    } else {
      favoriteIds.value = [...favoriteIds.value, id]
      if (isWeapp()) {
        const cloudId = await cloudAdd(CloudCollections.FAVORITES, { exerciseId: id })
        if (cloudId) cloudMap.value.set(id, cloudId)
      }
    }
    save()
  }

  async function removeFavorite(id: string): Promise<void> {
    favoriteIds.value = favoriteIds.value.filter((fid) => fid !== id)
    if (isWeapp()) {
      const cloudId = cloudMap.value.get(id)
      if (cloudId) {
        cloudDelete(CloudCollections.FAVORITES, cloudId)
        cloudMap.value.delete(id)
      }
    }
    save()
  }

  async function syncFromCloud(): Promise<void> {
    if (!isWeapp() || syncing.value) return
    syncing.value = true
    try {
      const cloudFavs = await cloudGet<CloudFavorite>(CloudCollections.FAVORITES)
      if (cloudFavs.length > 0) {
        const cloudIds = cloudFavs.map((f) => f.exerciseId)
        const merged = [...new Set([...favoriteIds.value, ...cloudIds])]
        favoriteIds.value = merged
        cloudMap.value = new Map(cloudFavs.map((f) => [f.exerciseId, f._id]))
        save()
      }
    } catch (e) {
      console.error('Sync favorites error:', e)
    } finally {
      syncing.value = false
    }
  }

  function save(): void {
    setStorage(StorageKeys.FAVORITES, favoriteIds.value)
  }

  function reset(): void {
    favoriteIds.value = []
    cloudMap.value = new Map()
  }

  return {
    favoriteIds,
    count,
    favoriteExercises,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    syncFromCloud,
    reset,
  }
})
