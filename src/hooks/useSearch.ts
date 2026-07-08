import { ref, computed } from 'vue'
import type { Exercise, FilterOptions } from '@/types/exercise'
import { useExerciseStore } from '@/store/exercise'

export function useSearch() {
  const exerciseStore = useExerciseStore()
  const keyword = ref('')
  const selectedBodyPart = ref('')
  const selectedEquipment = ref('')
  const selectedTarget = ref('')
  const results = ref<Exercise[]>([])
  const isSearching = ref(false)

  const hasFilters = computed(() => {
    return !!(keyword.value || selectedBodyPart.value || selectedEquipment.value || selectedTarget.value)
  })

  const resultCount = computed(() => results.value.length)

  function doSearch(): void {
    isSearching.value = true
    const filters: FilterOptions = {
      keyword: keyword.value || undefined,
      bodyPart: selectedBodyPart.value || undefined,
      equipment: selectedEquipment.value || undefined,
      target: selectedTarget.value || undefined,
    }
    results.value = exerciseStore.search(filters)
    isSearching.value = false
  }

  function clearFilters(): void {
    keyword.value = ''
    selectedBodyPart.value = ''
    selectedEquipment.value = ''
    selectedTarget.value = ''
    results.value = []
  }

  function setFilter(key: keyof FilterOptions, value: string): void {
    if (key === 'keyword') keyword.value = value
    if (key === 'bodyPart') selectedBodyPart.value = value
    if (key === 'equipment') selectedEquipment.value = value
    if (key === 'target') selectedTarget.value = value
    doSearch()
  }

  return {
    keyword,
    selectedBodyPart,
    selectedEquipment,
    selectedTarget,
    results,
    isSearching,
    hasFilters,
    resultCount,
    doSearch,
    clearFilters,
    setFilter,
  }
}
