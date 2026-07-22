<template>
  <view class="home-page">
    <!-- 顶部搜索 -->
    <SearchBar v-model="searchKeyword" @search="goSearch" placeholder="搜索 1,324 个健身动作..." />

    <!-- 统计信息 -->
    <view class="home-section">
      <view class="home-stats-card">
        <view class="home-stat-item" @tap="goSearch('')">
          <text class="home-stat-num">{{ exerciseStore.totalCount }}</text>
          <text class="home-stat-label">总动作数</text>
        </view>
        <view class="home-stat-divider" />
        <view class="home-stat-item" @tap="goFavorites">
          <text class="home-stat-num">{{ favoriteStore.count }}</text>
          <text class="home-stat-label">已收藏</text>
        </view>
        <view class="home-stat-divider" />
        <view class="home-stat-item" @tap="goPlan">
          <text class="home-stat-num">{{ planStore.planCount }}</text>
          <text class="home-stat-label">训练计划</text>
        </view>
      </view>
    </view>

    <!-- 快速开始 -->
    <view class="home-section">
      <view class="home-section-header">
        <text class="home-section-title">快速开始</text>
      </view>
      <view class="home-quick-grid">
        <view class="home-quick-item" @tap="goGenerator">
          <view class="home-quick-icon-wrap">
            <IconFont name="icon-jianshenbao" :size="22" style="color: #333" />
          </view>
          <text class="home-quick-label">智能生成</text>
        </view>
        <view class="home-quick-item" @tap="goSearch('')">
          <view class="home-quick-icon-wrap">
            <IconFont name="icon-jianshenqixie" :size="22" style="color: #333" />
          </view>
          <text class="home-quick-label">全部动作</text>
        </view>
        <view class="home-quick-item" @tap="goFavorites">
          <view class="home-quick-icon-wrap">
            <IconFont name="icon-shoushen" :size="22" style="color: #333" />
          </view>
          <text class="home-quick-label">我的收藏</text>
        </view>
        <view class="home-quick-item" @tap="goPlan">
          <view class="home-quick-icon-wrap">
            <IconFont name="icon-jishiqi" :size="22" style="color: #333" />
          </view>
          <text class="home-quick-label">训练计划</text>
        </view>
      </view>
    </view>

    <!-- 今日推荐 -->
    <view class="home-section">
      <view class="home-section-header">
        <text class="home-section-title">今日推荐</text>
        <view class="home-refresh-btn" @tap="refreshRecommend">
          <IconFont name="icon-jishiqi" :size="14" class="home-refresh-icon" />
          <text class="home-refresh-text">换一批</text>
        </view>
      </view>
    </view>
    <scroll-view :scroll-x="true" :show-scrollbar="true" :enhanced="true" class="home-recommend-scroll">
      <view class="home-recommend-list">
        <view v-for="item in recommendations" :key="item.id" class="home-recommend-item">
          <ExerciseCard :exercise="item" />
        </view>
      </view>
    </scroll-view>

    <!-- 热门肌群 -->
    <view class="home-section">
      <view class="home-section-header">
        <text class="home-section-title">热门肌群</text>
      </view>
    </view>
    <scroll-view :scroll-x="true" :show-scrollbar="true" :enhanced="true" class="home-muscle-scroll">
      <view class="home-muscle-list">
        <view v-for="bp in topBodyParts" :key="bp.key" class="home-muscle-item">
          <MuscleCard
            :label="bp.label"
            :value="bp.key"
            :count="bp.count"
            type="bodyPart"
          />
        </view>
      </view>
    </scroll-view>

    <!-- 热门器械 -->
    <view class="home-section">
      <view class="home-section-header">
        <text class="home-section-title">热门器械</text>
      </view>
    </view>
    <scroll-view :scroll-x="true" :show-scrollbar="true" :enhanced="true" class="home-equip-scroll">
      <view class="home-equip-list">
        <view
          v-for="eq in topEquipment"
          :key="eq.key"
          class="home-equip-chip"
          @tap="filterByEquipment(eq.key)"
        >
          <IconFont :name="eq.icon" :size="20" class="home-equip-icon" />
          <text class="home-equip-name">{{ eq.label }}</text>
          <text class="home-equip-count">{{ eq.count }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import SearchBar from '@/components/SearchBar/index.vue'
import ExerciseCard from '@/components/ExerciseCard/index.vue'
import MuscleCard from '@/components/MuscleCard/index.vue'
import IconFont from '@/components/IconFont/index.vue'
import { useExerciseStore } from '@/store/exercise'
import { useFavoriteStore } from '@/store/favorite'
import { usePlanStore } from '@/store/plan'
import { useShare } from '@/hooks/useShare'
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/types/exercise'

const exerciseStore = useExerciseStore()
const favoriteStore = useFavoriteStore()
const planStore = usePlanStore()

useShare({
  title: 'ExercisesPlayer - 专业健身动作库',
  path: '/pages/index/index',
})

const searchKeyword = ref('')

const recommendations = computed(() => exerciseStore.todayRecommendations)

const EQUIP_ICONS: Record<string, string> = {
  'body weight': 'icon-fuwocheng',
  dumbbell: 'icon-yaling',
  cable: 'icon-jianshenqixie',
  barbell: 'icon-jirounan',
  'leverage machine': 'icon-jianshenqixie',
  band: 'icon-tiaosheng',
  'smith machine': 'icon-jianshenqixie',
  kettlebell: 'icon-yaling',
  weighted: 'icon-chengzhong',
  'stability ball': 'icon-yuqie',
  'ez barbell': 'icon-yaling',
  other: 'icon-jianshenbao',
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
  exerciseStore.setPendingKeyword(val)
  Taro.switchTab({ url: '/pages/search/index' })
}

function goFavorites(): void {
  Taro.switchTab({ url: '/pages/favorites/index' })
}

function goPlan(): void {
  Taro.switchTab({ url: '/pages/plan/index' })
}

function goGenerator(): void {
  Taro.navigateTo({ url: '/packageDetail/pages/generator/index' })
}

function refreshRecommend(): void {
  exerciseStore.refreshRecommendations()
}

function filterByEquipment(equipment: string): void {
  exerciseStore.setPendingFilter('equipment', equipment)
  Taro.switchTab({ url: '/pages/search/index' })
}

usePullDownRefresh(() => {
  exerciseStore.refreshRecommendations()
  Taro.stopPullDownRefresh()
})

onMounted(() => {
  // Sync data from cloud on mini program
  favoriteStore.syncFromCloud()
  planStore.syncFromCloud()
})
</script>

<style>
.home-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 20px;
}

.home-section {
  margin-top: 16px;
  padding: 0 16px;
}

.home-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.home-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.home-refresh-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 16px;
}

.home-refresh-icon {
  font-size: 14px;
}

.home-refresh-text {
  font-size: 12px;
  color: #666;
}

/* 统计卡片 */
.home-stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px;
  background: #1a1a1a;
  border-radius: 16px;
}

.home-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 8px 4px;
  border-radius: 12px;
  transition: background 0.2s;
}

.home-stat-item:active {
  background: rgba(255, 255, 255, 0.1);
}

.home-stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.home-stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.home-stat-divider {
  width: 1px;
  height: 40px;
  background: #333;
}

/* 快速开始 */
.home-quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.home-quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.home-quick-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #eee;
}

.home-quick-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

/* 今日推荐 */
.home-recommend-scroll {
  width: 100%;
  height: 280px;
  white-space: nowrap;
}

.home-recommend-list {
  display: inline-flex;
  flex-wrap: nowrap;
  padding: 0 16px 8px 16px;
}

.home-recommend-item {
  width: 200px;
  min-width: 200px;
  flex-shrink: 0;
  margin-right: 12px;
}

/* 热门肌群 */
.home-muscle-scroll {
  width: 100%;
  height: 80px;
}

.home-muscle-list {
  display: flex;
  flex-wrap: nowrap;
  padding: 0 16px;
}

.home-muscle-item {
  width: 160px;
  min-width: 160px;
  flex-shrink: 0;
  margin-right: 10px;
}

/* 热门器械 */
.home-equip-scroll {
  width: 100%;
  height: 90px;
}

.home-equip-list {
  display: flex;
  flex-wrap: nowrap;
  padding: 0 16px;
}

.home-equip-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-width: 80px;
  flex-shrink: 0;
  margin-right: 10px;
}

.home-equip-icon {
  font-size: 28px;
  margin-bottom: 6px;
  line-height: 1;
}

.home-equip-name {
  font-size: 11px;
  color: #333;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}

.home-equip-count {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
  line-height: 1.2;
}
</style>
