import type { Exercise, PlanType } from '@/types/exercise'
import { getAllExercises } from '@/utils/data'

// ==================== 类型定义 ====================

export type TrainingGoal = 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'flexibility' | 'custom'
export type BodyFocus = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs' | 'fullbody'
export type Duration = '15min' | '30min' | '45min' | '60min'
export type Location = 'gym' | 'home' | 'outdoor' | 'office'

export interface GenerateOptions {
  goal: TrainingGoal
  bodyFocus: BodyFocus[]
  duration: Duration
  location: Location
  preferredEquipment?: string[]
  excludeIds?: string[]
}

export interface GeneratedPlan {
  name: string
  type: PlanType
  exercises: Exercise[]
  goal: TrainingGoal
  duration: Duration
}

// ==================== 常量映射 ====================

export const GOAL_LABELS: Record<TrainingGoal, string> = {
  muscle_gain: '增肌',
  fat_loss: '减脂',
  strength: '力量',
  endurance: '耐力',
  flexibility: '柔韧',
  custom: '自定义',
}

export const GOAL_ICONS: Record<TrainingGoal, string> = {
  muscle_gain: '💪',
  fat_loss: '🔥',
  strength: '⚡',
  endurance: '🏃',
  flexibility: '🧘',
  custom: '🎯',
}

export const FOCUS_LABELS: Record<BodyFocus, string> = {
  chest: '胸部',
  back: '背部',
  shoulders: '肩部',
  arms: '手臂',
  core: '核心',
  legs: '腿部',
  fullbody: '全身',
}

export const FOCUS_ICONS: Record<BodyFocus, string> = {
  chest: '🫁',
  back: '🔙',
  shoulders: '🤷',
  arms: '💪',
  core: '🎯',
  legs: '🦵',
  fullbody: '🏋️',
}

export const DURATION_LABELS: Record<Duration, string> = {
  '15min': '15 分钟',
  '30min': '30 分钟',
  '45min': '45 分钟',
  '60min': '60 分钟',
}

export const LOCATION_LABELS: Record<Location, string> = {
  gym: '健身房',
  home: '家里',
  outdoor: '户外',
  office: '办公室',
}

export const LOCATION_ICONS: Record<Location, string> = {
  gym: '🏋️',
  home: '🏠',
  outdoor: '🌳',
  office: '🏢',
}

// 地点 → 可用器械
const LOCATION_EQUIPMENT: Record<Location, string[]> = {
  gym: [
    'body weight', 'dumbbell', 'cable', 'barbell', 'leverage machine', 'band',
    'smith machine', 'kettlebell', 'weighted', 'stability ball', 'ez barbell',
    'sled machine', 'medicine ball', 'rope', 'roller', 'resistance band',
  ],
  home: ['body weight', 'dumbbell', 'band', 'kettlebell', 'stability ball', 'resistance band'],
  outdoor: ['body weight', 'band', 'resistance band'],
  office: ['body weight'],
}

// 部位 → 目标肌群
const FOCUS_TARGETS: Record<BodyFocus, string[]> = {
  chest: ['pectorals'],
  back: ['lats', 'upper back', 'traps'],
  shoulders: ['delts'],
  arms: ['biceps', 'triceps', 'forearms'],
  core: ['abs', 'spine'],
  legs: ['glutes', 'quads', 'hamstrings', 'calves', 'adductors', 'abductors'],
  fullbody: ['pectorals', 'lats', 'glutes', 'quads', 'delts', 'biceps', 'triceps', 'abs', 'upper back', 'hamstrings'],
}

// 快捷预设 → PlanType
const FOCUS_TO_PLAN_TYPE: Record<string, PlanType> = {
  chest: 'push',
  back: 'pull',
  shoulders: 'push',
  arms: 'upper',
  core: 'fullbody',
  legs: 'leg',
  fullbody: 'fullbody',
}

// 训练目标+时长 → 动作数量
const COUNT_MAP: Record<TrainingGoal, Record<Duration, number>> = {
  muscle_gain: { '15min': 4, '30min': 6, '45min': 9, '60min': 12 },
  fat_loss:    { '15min': 5, '30min': 7, '45min': 10, '60min': 14 },
  strength:    { '15min': 3, '30min': 5, '45min': 7, '60min': 9 },
  endurance:   { '15min': 5, '30min': 8, '45min': 11, '60min': 15 },
  flexibility: { '15min': 4, '30min': 6, '45min': 8, '60min': 10 },
  custom:      { '15min': 4, '30min': 6, '45min': 8, '60min': 10 },
}

// 力量训练优先器械
const STRENGTH_EQUIPMENT_PRIORITY = ['barbell', 'body weight', 'dumbbell', 'smith machine', 'ez barbell']
const FLEXIBILITY_EQUIPMENT_PRIORITY = ['body weight', 'stability ball', 'band', 'resistance band']

// ==================== 工具函数 ====================

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function sortByEquipmentPriority(pool: Exercise[], priority: string[]): Exercise[] {
  return [...pool].sort((a, b) => {
    const aIdx = priority.indexOf(a.equipment)
    const bIdx = priority.indexOf(b.equipment)
    const aRank = aIdx === -1 ? 999 : aIdx
    const bRank = bIdx === -1 ? 999 : bIdx
    return aRank - bRank
  })
}

function getTargetsByFocus(focusList: BodyFocus[]): string[] {
  const targets = new Set<string>()
  for (const focus of focusList) {
    for (const t of FOCUS_TARGETS[focus] || []) {
      targets.add(t)
    }
  }
  return [...targets]
}

function inferPlanType(focusList: BodyFocus[]): PlanType {
  if (focusList.length === 1) return FOCUS_TO_PLAN_TYPE[focusList[0]] || 'custom'
  if (focusList.includes('fullbody')) return 'fullbody'
  const hasUpper = focusList.some((f) => ['chest', 'back', 'shoulders', 'arms'].includes(f))
  const hasLower = focusList.includes('legs')
  if (hasUpper && hasLower) return 'fullbody'
  if (hasUpper) return 'upper'
  if (hasLower) return 'lower'
  return 'custom'
}

function generatePlanName(goal: TrainingGoal, focusList: BodyFocus[]): string {
  const goalLabel = GOAL_LABELS[goal]
  const focusLabels = focusList.map((f) => FOCUS_LABELS[f]).join('+')
  return `${goalLabel}-${focusLabels}`
}

function allocateByWeight(targets: string[], totalCount: number): Record<string, number> {
  const allocation: Record<string, number> = {}
  const len = targets.length
  if (len === 0) return allocation

  const base = Math.floor(totalCount / len)
  let remainder = totalCount - base * len

  for (const target of targets) {
    allocation[target] = base + (remainder > 0 ? 1 : 0)
    if (remainder > 0) remainder--
  }

  return allocation
}

// ==================== 核心生成函数 ====================

export function getAvailableEquipment(location: Location): string[] {
  return LOCATION_EQUIPMENT[location] || LOCATION_EQUIPMENT.gym
}

export function getCountByDuration(goal: TrainingGoal, duration: Duration): number {
  return COUNT_MAP[goal]?.[duration] || 6
}

export function generatePlan(options: GenerateOptions): GeneratedPlan {
  const { goal, bodyFocus, duration, location, preferredEquipment, excludeIds } = options

  // 1. 可用器械池
  const availableEquipment = getAvailableEquipment(location)

  // 2. 目标肌群
  const targets = getTargetsByFocus(bodyFocus)

  // 3. 总动作数
  const totalCount = getCountByDuration(goal, duration)

  // 4. 按肌群分组筛选
  const poolByTarget: Record<string, Exercise[]> = {}
  for (const target of targets) {
    let pool = getAllExercises()
      .filter((ex) => ex.target === target)
      .filter((ex) => availableEquipment.includes(ex.equipment))
      .filter((ex) => !excludeIds?.includes(ex.id))

    // 按训练目标特殊排序
    if (goal === 'strength') {
      pool = sortByEquipmentPriority(pool, STRENGTH_EQUIPMENT_PRIORITY)
    } else if (goal === 'endurance') {
      pool = pool.filter((ex) => !['barbell', 'smith machine'].includes(ex.equipment))
    } else if (goal === 'flexibility') {
      pool = sortByEquipmentPriority(pool, FLEXIBILITY_EQUIPMENT_PRIORITY)
    }

    // 器械偏好优先
    if (preferredEquipment?.length) {
      pool = sortByEquipmentPriority(pool, preferredEquipment)
    }

    poolByTarget[target] = shuffleArray(pool)
  }

  // 5. 按肌群权重分配
  const allocation = allocateByWeight(targets, totalCount)

  // 6. 从每个池中采样
  const selected: Exercise[] = []
  for (const [target, count] of Object.entries(allocation)) {
    const pool = poolByTarget[target] || []
    selected.push(...pool.slice(0, count))
  }

  // 7. 去重（同 id 不重复）
  const seen = new Set<string>()
  const deduped = selected.filter((ex) => {
    if (seen.has(ex.id)) return false
    seen.add(ex.id)
    return true
  })

  // 8. 打乱顺序
  const shuffled = shuffleArray(deduped)

  // 9. 推断 PlanType 和生成名称
  const planType = inferPlanType(bodyFocus)
  const name = generatePlanName(goal, bodyFocus)

  return { name, type: planType, exercises: shuffled, goal, duration }
}
