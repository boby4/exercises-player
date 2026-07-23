import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Achievement, AchievementProgress } from '@/types/exercise'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import { isWeapp, cloudGet, cloudAdd, CloudCollections } from '@/utils/cloud'
import { useRecordStore } from './record'
import { usePlanStore } from './plan'
import { useFavoriteStore } from './favorite'

// 成就类型定义
export type AchievementType = 'level' | 'badge'

// 成就定义
export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  type: AchievementType
  color: string
  bgColor: string
  // 等级成就的条件检查函数
  check?: (stats: UserStats) => boolean
  // 进度计算函数
  getProgress?: (stats: UserStats) => { current: number; target: number }
}

// 用户统计数据
export interface UserStats {
  trainCount: number
  totalMinutes: number
  planCount: number
  favoriteCount: number
  streakDays: number
}

// 成就等级定义
const LEVEL_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'level_beginner',
    name: '新手入门',
    description: '开始你的健身之旅',
    icon: '🌱',
    type: 'level',
    color: '#8BC34A',
    bgColor: '#F1F8E9',
    check: (stats) => stats.trainCount < 10 || stats.totalMinutes < 60,
    getProgress: (stats) => ({
      current: Math.min(stats.trainCount, 10),
      target: 10
    })
  },
  {
    id: 'level初级',
    name: '初级健身者',
    description: '训练10-30次，时长1-5小时',
    icon: '💪',
    type: 'level',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    check: (stats) => stats.trainCount >= 10 && stats.trainCount < 30 && stats.totalMinutes >= 60 && stats.totalMinutes < 300,
    getProgress: (stats) => ({
      current: Math.min(stats.trainCount, 30),
      target: 30
    })
  },
  {
    id: 'level_intermediate',
    name: '健身达人',
    description: '训练30-80次，时长5-20小时',
    icon: '🏆',
    type: 'level',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    check: (stats) => stats.trainCount >= 30 && stats.trainCount < 80 && stats.totalMinutes >= 300 && stats.totalMinutes < 1200,
    getProgress: (stats) => ({
      current: Math.min(stats.trainCount, 80),
      target: 80
    })
  },
  {
    id: 'level_expert',
    name: '健身专家',
    description: '训练80-200次，时长20-50小时',
    icon: '⭐',
    type: 'level',
    color: '#2196F3',
    bgColor: '#E3F2FD',
    check: (stats) => stats.trainCount >= 80 && stats.trainCount < 200 && stats.totalMinutes >= 1200 && stats.totalMinutes < 3000,
    getProgress: (stats) => ({
      current: Math.min(stats.trainCount, 200),
      target: 200
    })
  },
  {
    id: 'level_master',
    name: '健身大师',
    description: '训练200+次，时长50+小时',
    icon: '👑',
    type: 'level',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    check: (stats) => stats.trainCount >= 200 && stats.totalMinutes >= 3000,
    getProgress: (stats) => ({
      current: Math.min(stats.trainCount, 200),
      target: 200
    })
  }
]

// 成就徽章定义
const BADGE_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'badge_collector',
    name: '收藏家',
    description: '收藏20+个动作',
    icon: '❤️',
    type: 'badge',
    color: '#E91E63',
    bgColor: '#FCE4EC',
    check: (stats) => stats.favoriteCount >= 20,
    getProgress: (stats) => ({
      current: Math.min(stats.favoriteCount, 20),
      target: 20
    })
  },
  {
    id: 'badge_planner',
    name: '计划达人',
    description: '创建5+个计划',
    icon: '📋',
    type: 'badge',
    color: '#00BCD4',
    bgColor: '#E0F7FA',
    check: (stats) => stats.planCount >= 5,
    getProgress: (stats) => ({
      current: Math.min(stats.planCount, 5),
      target: 5
    })
  },
  {
    id: 'badge_persistent',
    name: '持久战士',
    description: '训练100+次',
    icon: '🔥',
    type: 'badge',
    color: '#FF5722',
    bgColor: '#FBE9E7',
    check: (stats) => stats.trainCount >= 100,
    getProgress: (stats) => ({
      current: Math.min(stats.trainCount, 100),
      target: 100
    })
  }
]

// 所有成就
const ALL_ACHIEVEMENTS = [...LEVEL_ACHIEVEMENTS, ...BADGE_ACHIEVEMENTS]

interface CloudAchievement {
  _id: string
  achievementId: string
  unlockedAt: string
}

export const useAchievementStore = defineStore('achievement', () => {
  const unlockedIds = ref<Set<string>>(new Set(getStorage<string[]>(StorageKeys.ACHIEVEMENTS) || []))
  const cloudMap = ref<Map<string, string>>(new Map())
  const syncing = ref(false)
  const showAnimation = ref(false)
  const currentAchievement = ref<AchievementDef | null>(null)

  // 获取用户统计
  const userStats = computed<UserStats>(() => {
    const recordStore = useRecordStore()
    const planStore = usePlanStore()
    const favoriteStore = useFavoriteStore()
    
    return {
      trainCount: recordStore.totalRecords,
      totalMinutes: Math.round(recordStore.totalDuration / 60),
      planCount: planStore.planCount,
      favoriteCount: favoriteStore.count,
      streakDays: calculateStreak()
    }
  })

  // 获取当前等级
  const currentLevel = computed(() => {
    const stats = userStats.value
    // 从高到低检查，找到第一个符合条件的等级
    for (let i = LEVEL_ACHIEVEMENTS.length - 1; i >= 0; i--) {
      const level = LEVEL_ACHIEVEMENTS[i]
      if (level.check && level.check(stats)) {
        return level
      }
    }
    return LEVEL_ACHIEVEMENTS[0] // 默认新手入门
  })

  // 所有成就列表（带进度）
  const achievements = computed(() => {
    const stats = userStats.value
    return ALL_ACHIEVEMENTS.map(achievement => {
      const unlocked = unlockedIds.value.has(achievement.id)
      const progress = achievement.getProgress ? achievement.getProgress(stats) : { current: 0, target: 1 }
      
      // 已解锁的成就进度显示为满
      if (unlocked) {
        progress.current = progress.target
      }
      
      return {
        ...achievement,
        unlocked,
        progress
      }
    })
  })

  // 等级成就
  const levelAchievements = computed(() => achievements.value.filter(a => a.type === 'level'))

  // 徽章成就
  const badgeAchievements = computed(() => achievements.value.filter(a => a.type === 'badge'))

  // 已解锁数量
  const unlockedCount = computed(() => unlockedIds.value.size)

  // 总数
  const totalCount = computed(() => ALL_ACHIEVEMENTS.length)

  function calculateStreak(): number {
    const recordStore = useRecordStore()
    if (recordStore.records.length === 0) return 0

    const dates = [...new Set(recordStore.records.map(r => r.date))].sort().reverse()
    if (dates.length === 0) return 0

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    if (dates[0] !== today && dates[0] !== yesterday) return 0

    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diff = (prev.getTime() - curr.getTime()) / 86400000
      if (diff === 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  async function checkAchievements(): Promise<AchievementDef[]> {
    const stats = userStats.value
    const newAchievements: AchievementDef[] = []
    
    for (const achievement of ALL_ACHIEVEMENTS) {
      if (unlockedIds.value.has(achievement.id)) continue
      
      if (achievement.check && achievement.check(stats)) {
        unlockedIds.value.add(achievement.id)
        newAchievements.push(achievement)
        
        if (isWeapp()) {
          const cloudId = await cloudAdd(CloudCollections.ACHIEVEMENTS, {
            achievementId: achievement.id,
            unlockedAt: new Date().toISOString(),
          })
          if (cloudId) cloudMap.value.set(achievement.id, cloudId)
        }
      }
    }

    if (newAchievements.length > 0) {
      save()
      currentAchievement.value = newAchievements[0]
      showAnimation.value = true
    }

    return newAchievements
  }

  function hideAnimation(): void {
    showAnimation.value = false
    currentAchievement.value = null
  }

  async function syncFromCloud(): Promise<void> {
    if (!isWeapp() || syncing.value) return
    syncing.value = true
    try {
      const cloudAchievements = await cloudGet<CloudAchievement>(CloudCollections.ACHIEVEMENTS)
      if (cloudAchievements.length > 0) {
        const cloudMapTemp = new Map<string, string>()
        cloudAchievements.forEach((ca) => {
          const achievementId = ca.achievementId
          cloudMapTemp.set(achievementId, ca._id)
          unlockedIds.value.add(achievementId)
        })
        cloudMap.value = cloudMapTemp
        save()
      }
    } catch (e) {
      console.error('Sync achievements error:', e)
    } finally {
      syncing.value = false
    }
  }

  function save(): void {
    setStorage(StorageKeys.ACHIEVEMENTS, Array.from(unlockedIds.value))
  }

  function reset(): void {
    unlockedIds.value = new Set()
    cloudMap.value = new Map()
  }

  return {
    userStats,
    currentLevel,
    achievements,
    levelAchievements,
    badgeAchievements,
    unlockedCount,
    totalCount,
    showAnimation,
    currentAchievement,
    checkAchievements,
    hideAnimation,
    syncFromCloud,
    reset,
  }
})
