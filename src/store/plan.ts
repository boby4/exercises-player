import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TrainingPlan, PlanType } from '@/types/exercise'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import { isWeapp, cloudGet, cloudAdd, cloudUpdate, cloudDelete, CloudCollections } from '@/utils/cloud'

interface CloudPlan {
  _id: string
  planId: string
  name: string
  type: PlanType
  exerciseIds: string[]
}

export const usePlanStore = defineStore('plan', () => {
  const plans = ref<TrainingPlan[]>(getStorage<TrainingPlan[]>(StorageKeys.PLANS) || [])
  const cloudMap = ref<Map<string, string>>(new Map())
  const syncing = ref(false)

  const planCount = computed(() => plans.value.length)

  async function createPlan(name: string, type: PlanType, exerciseIds: string[] = []): Promise<TrainingPlan> {
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
    if (isWeapp()) {
      const cloudId = await cloudAdd(CloudCollections.PLANS, {
        planId: plan.id,
        name: plan.name,
        type: plan.type,
        exerciseIds: plan.exerciseIds,
      })
      if (cloudId) cloudMap.value.set(plan.id, cloudId)
    }
    return plan
  }

  async function updatePlan(id: string, updates: Partial<TrainingPlan>): Promise<void> {
    const index = plans.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      plans.value[index] = {
        ...plans.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      save()
      if (isWeapp()) {
        const cloudId = cloudMap.value.get(id)
        if (cloudId) {
          cloudUpdate(CloudCollections.PLANS, cloudId, {
            name: plans.value[index].name,
            type: plans.value[index].type,
            exerciseIds: plans.value[index].exerciseIds,
          })
        }
      }
    }
  }

  async function addExerciseToPlan(planId: string, exerciseId: string): Promise<void> {
    const plan = plans.value.find((p) => p.id === planId)
    if (plan && !plan.exerciseIds.includes(exerciseId)) {
      plan.exerciseIds.push(exerciseId)
      plan.updatedAt = new Date().toISOString()
      save()
      if (isWeapp()) {
        const cloudId = cloudMap.value.get(planId)
        if (cloudId) {
          cloudUpdate(CloudCollections.PLANS, cloudId, { exerciseIds: plan.exerciseIds })
        }
      }
    }
  }

  async function removeExerciseFromPlan(planId: string, exerciseId: string): Promise<void> {
    const plan = plans.value.find((p) => p.id === planId)
    if (plan) {
      plan.exerciseIds = plan.exerciseIds.filter((eid) => eid !== exerciseId)
      plan.updatedAt = new Date().toISOString()
      save()
      if (isWeapp()) {
        const cloudId = cloudMap.value.get(planId)
        if (cloudId) {
          cloudUpdate(CloudCollections.PLANS, cloudId, { exerciseIds: plan.exerciseIds })
        }
      }
    }
  }

  async function deletePlan(id: string): Promise<void> {
    plans.value = plans.value.filter((p) => p.id !== id)
    save()
    if (isWeapp()) {
      const cloudId = cloudMap.value.get(id)
      if (cloudId) {
        cloudDelete(CloudCollections.PLANS, cloudId)
        cloudMap.value.delete(id)
      }
    }
  }

  function getPlanById(id: string): TrainingPlan | undefined {
    return plans.value.find((p) => p.id === id)
  }

  async function syncFromCloud(): Promise<void> {
    if (!isWeapp() || syncing.value) return
    syncing.value = true
    try {
      const cloudPlans = await cloudGet<CloudPlan>(CloudCollections.PLANS)
      if (cloudPlans.length > 0) {
        const cloudMapTemp = new Map<string, string>()
        cloudPlans.forEach((cp) => {
          cloudMapTemp.set(cp.planId, cp._id)
          const existing = plans.value.find((p) => p.id === cp.planId)
          if (!existing) {
            plans.value.push({
              id: cp.planId,
              name: cp.name,
              type: cp.type,
              exerciseIds: cp.exerciseIds,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }
        })
        cloudMap.value = cloudMapTemp
        save()
      }
    } catch (e) {
      console.error('Sync plans error:', e)
    } finally {
      syncing.value = false
    }
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
    syncFromCloud,
  }
})
