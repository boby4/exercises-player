export interface ExerciseInstructions {
  en: string
  es: string
  it: string
  tr: string
  ru: string
  zh: string
}

export interface ExerciseInstructionSteps {
  en: string[]
  es: string[]
  it: string[]
  tr: string[]
  ru: string[]
  zh: string[]
}

export interface Exercise {
  id: string
  name: string
  category: string
  body_part: string
  equipment: string
  instructions: ExerciseInstructions
  instruction_steps: ExerciseInstructionSteps
  muscle_group: string
  secondary_muscles: string[]
  target: string
  media_id: string | null
  image: string | null
  gif_url: string | null
  created_at: string
}

export type BodyPart =
  | 'upper arms'
  | 'upper legs'
  | 'back'
  | 'waist'
  | 'chest'
  | 'shoulders'
  | 'lower legs'
  | 'lower arms'
  | 'cardio'
  | 'neck'

export type Equipment =
  | 'body weight'
  | 'dumbbell'
  | 'cable'
  | 'barbell'
  | 'leverage machine'
  | 'band'
  | 'smith machine'
  | 'kettlebell'
  | 'weighted'
  | 'stability ball'
  | 'ez barbell'
  | 'other'

export type LanguageCode = 'en' | 'es' | 'it' | 'tr' | 'ru' | 'zh'

export interface TrainingPlan {
  id: string
  name: string
  type: PlanType
  exerciseIds: string[]
  createdAt: string
  updatedAt: string
}

export type PlanType = 'push' | 'pull' | 'leg' | 'upper' | 'lower' | 'fullbody' | 'custom'

export interface TrainingRecord {
  id: string
  date: string
  exerciseIds: string[]
  duration: number
  planId?: string
  completedAt: string
}

export interface FilterOptions {
  bodyPart?: string
  equipment?: string
  target?: string
  keyword?: string
}

// ==================== 成就系统 ====================

export type AchievementCategory = 'training' | 'duration' | 'plan' | 'favorite' | 'streak'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  requirement: number
  unit: string
  unlockedAt?: string
}

export interface AchievementProgress {
  achievementId: string
  current: number
  unlocked: boolean
  unlockedAt?: string
}

export interface TimerPreset {
  label: string
  seconds: number
}

export const TIMER_PRESETS: TimerPreset[] = [
  { label: '20s', seconds: 20 },
  { label: '30s', seconds: 30 },
  { label: '40s', seconds: 40 },
  { label: '45s', seconds: 45 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '120s', seconds: 120 },
]

export const BODY_PARTS: BodyPart[] = [
  'upper arms',
  'upper legs',
  'back',
  'waist',
  'chest',
  'shoulders',
  'lower legs',
  'lower arms',
  'cardio',
  'neck',
]

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  'upper arms': '上臂',
  'upper legs': '大腿',
  back: '背部',
  waist: '腰部/核心',
  chest: '胸部',
  shoulders: '肩部',
  'lower legs': '小腿',
  'lower arms': '前臂',
  cardio: '有氧',
  neck: '颈部',
}

export const EQUIPMENT_LABELS: Record<string, string> = {
  'body weight': '自重',
  dumbbell: '哑铃',
  cable: '绳索',
  barbell: '杠铃',
  'leverage machine': '器械',
  band: '弹力带',
  'smith machine': '史密斯机',
  kettlebell: '壶铃',
  weighted: '负重',
  'stability ball': '健身球',
  'ez barbell': '曲杠',
  other: '其他',
}

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  push: '推（Push）',
  pull: '拉（Pull）',
  leg: '腿（Leg）',
  upper: '上肢（Upper）',
  lower: '下肢（Lower）',
  fullbody: '全身（Full Body）',
  custom: '自定义',
}
