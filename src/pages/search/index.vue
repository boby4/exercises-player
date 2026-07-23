<template>
  <view class="search-page">
    <SearchBar
      v-model="keyword"
      @search="doSearch"
      @clear="clearFilters"
      @update:modelValue="onKeywordChange"
    />

    <!-- 筛选标签 -->
    <view class="search-filter-section">
      <view class="search-filter-header">
        <text class="search-filter-title">肌群筛选</text>
      </view>
    </view>
    <scroll-view :scroll-x="true" :show-scrollbar="true" :enhanced="true" class="search-filter-scroll">
      <view class="search-filter-group">
        <Tag
          label="全部"
          :selected="!selectedBodyPart"
          @tap="clearBodyPartFilter"
        />
        <Tag
          v-for="bp in exerciseStore.bodyParts"
          :key="bp"
          :label="getBodyPartLabel(bp)"
          :selected="selectedBodyPart === bp"
          @tap="toggleBodyPart(bp)"
        />
      </view>
    </scroll-view>

    <view class="search-filter-section">
      <view class="search-filter-header">
        <text class="search-filter-title">器械筛选</text>
      </view>
    </view>
    <scroll-view :scroll-x="true" :show-scrollbar="true" :enhanced="true" class="search-filter-scroll">
      <view class="search-filter-group">
        <Tag
          label="全部"
          :selected="!selectedEquipment"
          @tap="clearEquipmentFilter"
        />
        <Tag
          v-for="eq in exerciseStore.equipmentList"
          :key="eq"
          :label="getEquipmentLabel(eq)"
          :selected="selectedEquipment === eq"
          @tap="toggleEquipment(eq)"
        />
      </view>
    </scroll-view>

    <!-- 结果统计 -->
    <view class="result-header">
      <text class="result-count">{{ hasFilters ? '找到' : '共' }} {{ totalCount }} 个动作</text>
      <view v-if="hasFilters" class="clear-all" @tap="clearFilters">
        <text class="clear-icon-x">&#x2715;</text>
        <text class="clear-text">清除筛选</text>
      </view>
    </view>

    <!-- 结果列表 -->
    <scroll-view
      :scroll-y="true"
      class="result-list"
      :style="{ height: listHeight + 'px' }"
      @scrolltolower="loadMore"
    >
      <view class="result-inner">
        <view class="result-grid">
          <view v-for="item in displayList" :key="item.id" class="result-item">
            <ExerciseCard :exercise="item" />
          </view>
        </view>
        <view v-if="displayList.length === 0 && hasFilters" class="empty-state">
          <IconFont name="icon-jianshenqixie" :size="48" class="empty-icon" />
          <text class="empty-text">未找到匹配的动作</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 成就弹窗 -->
    <AchievementPopup />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import SearchBar from '@/components/SearchBar/index.vue'
import ExerciseCard from '@/components/ExerciseCard/index.vue'
import Tag from '@/components/Tag/index.vue'
import IconFont from '@/components/IconFont/index.vue'
import AchievementPopup from '@/components/AchievementPopup/index.vue'
import { useExerciseStore } from '@/store/exercise'
import { useAchievementStore } from '@/store/achievement'
import { useSearch } from '@/hooks/useSearch'
import { useShare } from '@/hooks/useShare'
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/types/exercise'
import type { BodyPart } from '@/types/exercise'
import { getAllExercises } from '@/utils/data'

const exerciseStore = useExerciseStore()
const router = useRouter()
const achievementStore = useAchievementStore()

useShare({
  title: '海量健身动作，一键搜索 - ExercisesPlayer',
  path: '/pages/search/index',
})
const listHeight = ref(500)

const {
  keyword,
  selectedBodyPart,
  selectedEquipment,
  selectedTarget,
  results,
  hasFilters,
  resultCount,
  doSearch,
  clearFilters,
  setFilter,
} = useSearch()

const pageSize = 20
const currentPage = ref(1)

// 默认展示全部动作
const allExercises = getAllExercises()

const displayList = computed(() => {
  const list = hasFilters.value ? results.value : allExercises
  return list.slice(0, currentPage.value * pageSize)
})

const totalCount = computed(() => {
  return hasFilters.value ? resultCount.value : allExercises.length
})

function getBodyPartLabel(bp: string): string {
  return BODY_PART_LABELS[bp as BodyPart] || bp
}

function getEquipmentLabel(eq: string): string {
  return EQUIPMENT_LABELS[eq] || eq
}

function toggleBodyPart(bp: string): void {
  if (selectedBodyPart.value === bp) {
    setFilter('bodyPart', '')
  } else {
    setFilter('bodyPart', bp)
  }
  currentPage.value = 1
}

function toggleEquipment(eq: string): void {
  if (selectedEquipment.value === eq) {
    setFilter('equipment', '')
  } else {
    setFilter('equipment', eq)
  }
  currentPage.value = 1
}

function clearBodyPartFilter(): void {
  setFilter('bodyPart', '')
  currentPage.value = 1
}

function clearEquipmentFilter(): void {
  setFilter('equipment', '')
  currentPage.value = 1
}

function onKeywordChange(val: string): void {
  keyword.value = val
  currentPage.value = 1
  if (val.trim()) {
    doSearch()
  } else {
    results.value = []
  }
}

function loadMore(): void {
  if (displayList.value.length < totalCount.value) {
    currentPage.value++
  }
}

useDidShow(() => {
  // 检查来自首页的关键词搜索
  const kw = exerciseStore.pendingKeyword
  if (kw) {
    setFilter('keyword', kw)
    exerciseStore.pendingKeyword = null
    return
  }
  // 检查来自 MuscleCard 的筛选参数
  const pending = exerciseStore.pendingFilter
  if (pending) {
    const { type, value } = pending
    if (type === 'bodyPart') setFilter('bodyPart', value)
    else if (type === 'equipment') setFilter('equipment', value)
    else if (type === 'target') setFilter('target', value)
    exerciseStore.pendingFilter = null
  }
})
</script>

<style>
.search-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.search-filter-section {
  padding: 0 16px;
  margin-bottom: 4px;
}

.search-filter-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.search-filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.search-filter-scroll {
  width: 100%;
  margin-bottom: 8px;
}

.search-filter-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 0 16px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 4px;
}

.result-count {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.clear-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fff5f5;
  border-radius: 16px;
  border: 1PX solid #ffcccc;
}

.clear-icon-x {
  font-size: 10px;
  color: #e53935;
  line-height: 1;
}

.clear-text {
  font-size: 12px;
  color: #e53935;
  line-height: 1.2;
}

.result-list {
  padding: 0;
}

.result-inner {
  padding: 0 16px;
}

.result-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.result-item {
  width: 48%;
  min-width: 0;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.hint-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
}

.hint-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.hint-text {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
}

.hint-sub {
  font-size: 12px;
  color: #999;
}
</style>
