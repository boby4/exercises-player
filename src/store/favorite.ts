import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Exercise } from '@/types/exercise'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import { getExercisesByIds } from '@/utils/data'

export const useFavoriteStore = defineStore('favorite', () => {
  const favoriteIds = ref<string[]>(getStorage<string[]>(StorageKeys.FAVORITES) || [])

  const count = computed(() => favoriteIds.value.length)

  const favoriteExercises = computed<Exercise[]>(() => {
    return getExercisesByIds(favoriteIds.value)
  })

  function isFavorite(id: string): boolean {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id: string): void {
    if (isFavorite(id)) {
      favoriteIds.value = favoriteIds.value.filter((fid) => fid !== id)
    } else {
      favoriteIds.value = [...favoriteIds.value, id]
    }
    save()
  }

  function removeFavorite(id: string): void {
    favoriteIds.value = favoriteIds.value.filter((fid) => fid !== id)
    save()
  }

  function save(): void {
    setStorage(StorageKeys.FAVORITES, favoriteIds.value)
  }

  return {
    favoriteIds,
    count,
    favoriteExercises,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  }
})
