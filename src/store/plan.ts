import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TrainingPlan, PlanType } from '@/types/exercise'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'

export const usePlanStore = defineStore('plan', () => {
  const plans = ref<TrainingPlan[]>(getStorage<TrainingPlan[]>(StorageKeys.PLANS) || [])

  const planCount = computed(() => plans.value.length)

  function createPlan(name: string, type: PlanType, exerciseIds: string[] = []): TrainingPlan {
    const plan: TrainingPlan = {
      id: `plan_${Date.now()}`,
      name,
      type,
      exerciseIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    plans.value.push(plan)
    save()
    return plan
  }

  function updatePlan(id: string, updates: Partial<TrainingPlan>): void {
    const index = plans.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      plans.value[index] = {
        ...plans.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      save()
    }
  }

  function addExerciseToPlan(planId: string, exerciseId: string): void {
    const plan = plans.value.find((p) => p.id === planId)
    if (plan && !plan.exerciseIds.includes(exerciseId)) {
      plan.exerciseIds.push(exerciseId)
      plan.updatedAt = new Date().toISOString()
      save()
    }
  }

  function removeExerciseFromPlan(planId: string, exerciseId: string): void {
    const plan = plans.value.find((p) => p.id === planId)
    if (plan) {
      plan.exerciseIds = plan.exerciseIds.filter((eid) => eid !== exerciseId)
      plan.updatedAt = new Date().toISOString()
      save()
    }
  }

  function deletePlan(id: string): void {
    plans.value = plans.value.filter((p) => p.id !== id)
    save()
  }

  function getPlanById(id: string): TrainingPlan | undefined {
    return plans.value.find((p) => p.id === id)
  }

  function save(): void {
    setStorage(StorageKeys.PLANS, plans.value)
  }

  return {
    plans,
    planCount,
    createPlan,
    updatePlan,
    addExerciseToPlan,
    removeExerciseFromPlan,
    deletePlan,
    getPlanById,
  }
})
