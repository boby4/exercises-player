/**
 * 健康计算器 - BMI / BMR+TDEE / 体脂率
 */

export type Gender = 'male' | 'female'
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9

export interface BMIResult {
  value: number
  category: string
  color: string
  percent: number // 0-100，用于仪表盘
}

export interface MetabolismResult {
  bmr: number
  tdee: number
  lose: number   // 减脂建议（TDEE - 500）
  gain: number   // 增肌建议（TDEE + 300）
}

export interface BodyFatResult {
  value: number
  category: string
  color: string
}

// ==================== BMI ====================

export function calcBMI(height: number, weight: number): BMIResult {
  const h = height / 100 // cm → m
  const value = weight / (h * h)
  const rounded = Math.round(value * 10) / 10

  let category: string
  let color: string
  if (value < 18.5) {
    category = '偏瘦'
    color = '#2196f3'
  } else if (value < 24) {
    category = '正常'
    color = '#4caf50'
  } else if (value < 28) {
    category = '偏胖'
    color = '#ff9800'
  } else {
    category = '肥胖'
    color = '#f44336'
  }

  // percent: 映射到 0-100（BMI 15-35 → 0-100）
  const percent = Math.min(100, Math.max(0, ((value - 15) / 20) * 100))

  return { value: rounded, category, color, percent }
}

// ==================== BMR + TDEE ====================

/**
 * Mifflin-St Jeor 公式（最准确的 BMR 公式）
 * 男: 10×体重 + 6.25×身高 - 5×年龄 + 5
 * 女: 10×体重 + 6.25×身高 - 5×年龄 - 161
 */
export function calcMetabolism(
  gender: Gender,
  age: number,
  height: number,
  weight: number,
  level: ActivityLevel
): MetabolismResult {
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161

  const tdee = bmr * level
  const lose = tdee - 500
  const gain = tdee + 300

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    lose: Math.round(lose),
    gain: Math.round(gain),
  }
}

// ==================== 体脂率 ====================

/**
 * 基于 BMI 的体脂率估算（美国军方公式改良版）
 * 体脂% = 1.20 × BMI + 0.23 × 年龄 - 10.8 × 性别系数 - 5.4
 * 性别系数: 男=1, 女=0
 */
export function calcBodyFat(
  gender: Gender,
  age: number,
  height: number,
  weight: number
): BodyFatResult {
  const h = height / 100
  const bmi = weight / (h * h)
  const genderFactor = gender === 'male' ? 1 : 0
  const value = 1.2 * bmi + 0.23 * age - 10.8 * genderFactor - 5.4
  const rounded = Math.round(value * 10) / 10

  let category: string
  let color: string
  if (gender === 'male') {
    if (value < 10) {
      category = '偏低'
      color = '#2196f3'
    } else if (value < 20) {
      category = '正常'
      color = '#4caf50'
    } else if (value < 25) {
      category = '偏高'
      color = '#ff9800'
    } else {
      category = '肥胖'
      color = '#f44336'
    }
  } else {
    if (value < 18) {
      category = '偏低'
      color = '#2196f3'
    } else if (value < 28) {
      category = '正常'
      color = '#4caf50'
    } else if (value < 33) {
      category = '偏高'
      color = '#ff9800'
    } else {
      category = '肥胖'
      color = '#f44336'
    }
  }

  return { value: Math.max(0, rounded), category, color }
}

// ==================== 活动水平 ====================

export const ACTIVITY_LEVELS: Array<{ value: ActivityLevel; label: string; desc: string }> = [
  { value: 1.2, label: '久坐不动', desc: '办公室工作，几乎不运动' },
  { value: 1.375, label: '轻度活动', desc: '每周运动 1-3 次' },
  { value: 1.55, label: '中度活动', desc: '每周运动 3-5 次' },
  { value: 1.725, label: '高度活动', desc: '每周运动 6-7 次' },
  { value: 1.9, label: '极高活动', desc: '体力劳动 / 专业运动员' },
]
