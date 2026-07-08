import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Exercise, FilterOptions } from '@/types/exercise'
import {
  getAllExercises,
  getBodyParts,
  getEquipmentList,
  getTargets,
  filterExercises,
  getRandomExercises,
  getBodyPartCount,
  getEquipmentCount,
} from '@/utils/data'

export const useExerciseStore = defineStore('exercise', () => {
  const allExercises = ref<Exercise[]>(getAllExercises())
  const bodyParts = ref<string[]>(getBodyParts())
  const equipmentList = ref<string[]>(getEquipmentList())
  const targets = ref<string[]>(getTargets())
  const bodyPartCounts = ref<Record<string, number>>(getBodyPartCount())
  const equipmentCounts = ref<Record<string, number>>(getEquipmentCount())
  const todayRecommendations = ref<Exercise[]>(getRandomExercises(8))
  const recentViewed = ref<string[]>([])

  const totalCount = computed(() => allExercises.value.length)

  function search(filters: FilterOptions): Exercise[] {
    return filterExercises(filters)
  }

  function refreshRecommendations(): void {
    todayRecommendations.value = getRandomExercises(8)
  }

  function addRecentViewed(id: string): void {
    recentViewed.value = [id, ...recentViewed.value.filter((i) => i !== id)].slice(0, 20)
  }

  return {
    allExercises,
    bodyParts,
    equipmentList,
    targets,
    bodyPartCounts,
    equipmentCounts,
    todayRecommendations,
    recentViewed,
    totalCount,
    search,
    refreshRecommendations,
    addRecentViewed,
  }
})
