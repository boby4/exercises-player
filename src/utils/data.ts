import type { Exercise, FilterOptions } from '@/types/exercise'
import exercisesRaw from '@/assets/data/exercises.json'

const exercises = exercisesRaw as Exercise[]

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
    const kw = filters.keyword.toLowerCase()
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(kw) ||
        e.target.toLowerCase().includes(kw) ||
        e.body_part.toLowerCase().includes(kw) ||
        e.equipment.toLowerCase().includes(kw) ||
        e.muscle_group.toLowerCase().includes(kw)
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
  // Use ExerciseDB CDN URL for deployment (avoid bundling 120MB+ GIFs)
  if (exercise.gif_url) return exercise.gif_url
  if (exercise.media_id) {
    return `https://static.exercisedb.dev/media/${exercise.media_id}.gif`
  }
  return ''
}
