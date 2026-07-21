import type { Exercise, FilterOptions } from '@/types/exercise'
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/types/exercise'
import exercisesRaw from '@/assets/data/exercises-index.json'

// 轻量索引：仅包含列表/筛选所需字段（~253KB）
// 完整数据（instruction_steps等）由分包 data-full.ts 提供
const exercises = exercisesRaw as Exercise[]

// 中文 → 英文反向映射，用于中文关键词搜索
const zhToEnMap: Record<string, string> = {}
for (const [en, zh] of Object.entries(BODY_PART_LABELS)) {
  zhToEnMap[zh.toLowerCase()] = en.toLowerCase()
}
for (const [en, zh] of Object.entries(EQUIPMENT_LABELS)) {
  zhToEnMap[zh.toLowerCase()] = en.toLowerCase()
}

function resolveKeyword(kw: string): string[] {
  const lower = kw.toLowerCase()
  // 如果中文命中映射，同时搜索中文本身和对应英文
  const mapped = zhToEnMap[lower]
  return mapped ? [lower, mapped] : [lower]
}

let cachedBodyParts: string[] = []
let cachedEquipment: string[] = []
let cachedTargets: string[] = []

export function getAllExercises(): Exercise[] {
  return exercises
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id)
}

export function getExercisesByIds(ids: string[]): Exercise[] {
  return ids.map((id) => getExerciseById(id)).filter(Boolean) as Exercise[]
}

export function getBodyParts(): string[] {
  if (cachedBodyParts.length === 0) {
    cachedBodyParts = [...new Set(exercises.map((e) => e.body_part))].sort()
  }
  return cachedBodyParts
}

export function getEquipmentList(): string[] {
  if (cachedEquipment.length === 0) {
    cachedEquipment = [...new Set(exercises.map((e) => e.equipment))].sort()
  }
  return cachedEquipment
}

export function getTargets(): string[] {
  if (cachedTargets.length === 0) {
    cachedTargets = [...new Set(exercises.map((e) => e.target))].sort()
  }
  return cachedTargets
}

export function filterExercises(filters: FilterOptions): Exercise[] {
  let result = exercises

  if (filters.bodyPart) {
    result = result.filter((e) => e.body_part === filters.bodyPart)
  }
  if (filters.equipment) {
    result = result.filter((e) => e.equipment === filters.equipment)
  }
  if (filters.target) {
    result = result.filter((e) => e.target === filters.target)
  }
  if (filters.keyword) {
    const keywords = resolveKeyword(filters.keyword)
    result = result.filter((e) =>
      keywords.some(
        (kw) =>
          e.name.toLowerCase().includes(kw) ||
          e.target.toLowerCase().includes(kw) ||
          e.body_part.toLowerCase().includes(kw) ||
          e.equipment.toLowerCase().includes(kw)
      )
    )
  }

  return result
}

export function getExercisesByBodyPart(bodyPart: string): Exercise[] {
  return exercises.filter((e) => e.body_part === bodyPart)
}

export function getExercisesByEquipment(equipment: string): Exercise[] {
  return exercises.filter((e) => e.equipment === equipment)
}

export function getExercisesByTarget(target: string): Exercise[] {
  return exercises.filter((e) => e.target === target)
}

export function getRandomExercises(count: number): Exercise[] {
  const shuffled = [...exercises].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function getRelatedExercises(exercise: Exercise, limit = 6): Exercise[] {
  return exercises
    .filter(
      (e) =>
        e.id !== exercise.id &&
        (e.body_part === exercise.body_part || e.target === exercise.target)
    )
    .slice(0, limit)
}

export function getBodyPartCount(): Record<string, number> {
  const counts: Record<string, number> = {}
  exercises.forEach((e) => {
    counts[e.body_part] = (counts[e.body_part] || 0) + 1
  })
  return counts
}

export function getEquipmentCount(): Record<string, number> {
  const counts: Record<string, number> = {}
  exercises.forEach((e) => {
    counts[e.equipment] = (counts[e.equipment] || 0) + 1
  })
  return counts
}

export function getGifUrl(exercise: Exercise): string {
  if (exercise.gif_url) return exercise.gif_url
  if (exercise.media_id) {
    return `https://static.exercisedb.dev/media/${exercise.media_id}.gif`
  }
  return ''
}
