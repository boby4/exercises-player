<template>
  <view class="page">
    <!-- 顶部搜索 -->
    <SearchBar v-model="searchKeyword" @search="goSearch" placeholder="搜索 1,324 个健身动作..." />

    <!-- 今日推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">今日推荐</text>
        <view class="refresh-btn" @tap="refreshRecommend">
          <text class="refresh-icon">🔄</text>
          <text class="refresh-text">换一批</text>
        </view>
      </view>
      <scroll-view scroll-x class="recommend-scroll">
        <view class="recommend-list">
          <view v-for="item in recommendations" :key="item.id" class="recommend-item">
            <ExerciseCard :exercise="item" />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 肌群分类 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门肌群</text>
      </view>
      <view class="muscle-grid">
        <view v-for="bp in topBodyParts" :key="bp.key" class="muscle-item">
          <MuscleCard
            :label="bp.label"
            :value="bp.key"
            :count="bp.count"
            type="bodyPart"
          />
        </view>
      </view>
    </view>

    <!-- 器械分类 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门器械</text>
      </view>
      <scroll-view scroll-x class="equip-scroll">
        <view class="equip-list">
          <view
            v-for="eq in topEquipment"
            :key="eq.key"
            class="equip-chip"
            @tap="filterByEquipment(eq.key)"
          >
            <text class="equip-icon">{{ eq.icon }}</text>
            <text class="equip-name">{{ eq.label }}</text>
            <text class="equip-count">{{ eq.count }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 统计信息 -->
    <view class="section">
      <view class="stats-card">
        <view class="stat-item" @tap="goSearch('')">
          <text class="stat-num">{{ exerciseStore.totalCount }}</text>
          <text class="stat-label">总动作数</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item" @tap="goFavorites">
          <text class="stat-num">{{ favoriteStore.count }}</text>
          <text class="stat-label">已收藏</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item" @tap="goPlan">
          <text class="stat-num">{{ planStore.planCount }}</text>
          <text class="stat-label">训练计划</text>
        </view>
      </view>
    </view>

    <!-- 猜你喜欢 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">猜你喜欢</text>
      </view>
      <view class="exercise-grid">
        <view v-for="item in randomPicks" :key="item.id" class="exercise-grid-item">
          <ExerciseCard :exercise="item" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import SearchBar from '@/components/SearchBar/index.vue'
import ExerciseCard from '@/components/ExerciseCard/index.vue'
import MuscleCard from '@/components/MuscleCard/index.vue'
import { useExerciseStore } from '@/store/exercise'
import { useFavoriteStore } from '@/store/favorite'
import { usePlanStore } from '@/store/plan'
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/types/exercise'
import { getRandomExercises } from '@/utils/data'

const exerciseStore = useExerciseStore()
const favoriteStore = useFavoriteStore()
const planStore = usePlanStore()

const searchKeyword = ref('')
const randomPicks = ref(getRandomExercises(6))

const recommendations = computed(() => exerciseStore.todayRecommendations)

const EQUIP_ICONS: Record<string, string> = {
  'body weight': '🧘',
  dumbbell: '🏋️',
  cable: '🔗',
  barbell: '🏋️‍♂️',
  'leverage machine': '⚙️',
  band: '🔴',
  'smith machine': '🔩',
  kettlebell: '🔔',
  weighted: '⚖️',
  'stability ball': '⚽',
  'ez barbell': '🔧',
  other: '📦',
}

const topBodyParts = computed(() => {
  return Object.entries(exerciseStore.bodyPartCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, count]) => ({
      key,
      label: BODY_PART_LABELS[key as keyof typeof BODY_PART_LABELS] || key,
      count,
    }))
})

const topEquipment = computed(() => {
  return Object.entries(exerciseStore.equipmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, count]) => ({
      key,
      label: EQUIPMENT_LABELS[key] || key,
      icon: EQUIP_ICONS[key] || '📦',
      count,
    }))
})

function goSearch(val: string): void {
  Taro.switchTab({ url: '/pages/search/index' })
}

function goFavorites(): void {
  Taro.switchTab({ url: '/pages/favorites/index' })
}

function goPlan(): void {
  Taro.switchTab({ url: '/pages/plan/index' })
}

function refreshRecommend(): void {
  exerciseStore.refreshRecommendations()
}

function filterByEquipment(equipment: string): void {
  Taro.navigateTo({
    url: `/pages/search/index?filter=equipment&value=${encodeURIComponent(equipment)}`,
  })
}

usePullDownRefresh(() => {
  randomPicks.value = getRandomExercises(6)
  exerciseStore.refreshRecommendations()
  Taro.stopPullDownRefresh()
})

onMounted(() => {
  randomPicks.value = getRandomExercises(6)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 20px;
}

.section {
  margin-top: 16px;
  padding: 0 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 16px;
}

.refresh-icon {
  font-size: 14px;
}

.refresh-text {
  font-size: 12px;
  color: #666;
}

.recommend-scroll {
  white-space: nowrap;
}

.recommend-list {
  display: inline-flex;
  gap: 12px;
  padding-right: 16px;
  margin-bottom: 8px;
}

.recommend-item {
  width: 200px;
  flex-shrink: 0;
}

.muscle-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.muscle-item {
  width: 100%;
}

.equip-scroll {
  white-space: nowrap;
}

.equip-list {
  display: inline-flex;
  gap: 10px;
  padding-right: 16px;
}

.equip-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-width: 80px;
  flex-shrink: 0;
}

.equip-icon {
  font-size: 28px;
  margin-bottom: 6px;
  line-height: 1;
}

.equip-name {
  font-size: 11px;
  color: #333;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}

.equip-count {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
  line-height: 1.2;
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px;
  background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
  border-radius: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 8px 4px;
  border-radius: 12px;
  transition: background 0.2s;
}

.stat-item:active {
  background: rgba(255, 255, 255, 0.15);
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

.exercise-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.exercise-grid-item {
  width: calc(50% - 6px);
}
</style>
