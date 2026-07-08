<template>
  <view class="page">
    <SearchBar
      v-model="keyword"
      @search="doSearch"
      @clear="clearFilters"
      @update:modelValue="onKeywordChange"
    />

    <!-- 筛选标签 -->
    <view class="filter-section">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-group">
          <Tag
            v-for="bp in exerciseStore.bodyParts"
            :key="bp"
            :label="getBodyPartLabel(bp)"
            :selected="selectedBodyPart === bp"
            @tap="toggleBodyPart(bp)"
          />
        </view>
      </scroll-view>

      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-group">
          <Tag
            v-for="eq in exerciseStore.equipmentList"
            :key="eq"
            :label="getEquipmentLabel(eq)"
            :selected="selectedEquipment === eq"
            @tap="toggleEquipment(eq)"
          />
        </view>
      </scroll-view>
    </view>

    <!-- 结果统计 -->
    <view v-if="hasFilters" class="result-header">
      <text class="result-count">找到 {{ resultCount }} 个动作</text>
      <view class="clear-all" @tap="clearFilters">
        <text class="clear-icon-x">&#x2715;</text>
        <text class="clear-text">清除筛选</text>
      </view>
    </view>

    <!-- 结果列表 -->
    <scroll-view
      scroll-y
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
          <text class="empty-icon">&#x1F50D;</text>
          <text class="empty-text">未找到匹配的动作</text>
        </view>
      </view>
    </scroll-view>

    <!-- 无筛选时的提示 -->
    <view v-if="!hasFilters" class="hint-section">
      <text class="hint-icon">💡</text>
      <text class="hint-text">输入关键词或选择筛选条件来搜索动作</text>
      <text class="hint-sub">支持按动作名、肌群、器械搜索</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
import SearchBar from '@/components/SearchBar/index.vue'
import ExerciseCard from '@/components/ExerciseCard/index.vue'
import Tag from '@/components/Tag/index.vue'
import { useExerciseStore } from '@/store/exercise'
import { useSearch } from '@/hooks/useSearch'
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/types/exercise'
import type { BodyPart } from '@/types/exercise'

const exerciseStore = useExerciseStore()
const router = useRouter()
const listHeight = ref(600)

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

const displayList = computed(() => {
  return results.value.slice(0, currentPage.value * pageSize)
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

function onKeywordChange(val: string): void {
  keyword.value = val
  if (val.length >= 2) {
    currentPage.value = 1
    doSearch()
  }
}

function loadMore(): void {
  if (displayList.value.length < results.value.length) {
    currentPage.value++
  }
}

onMounted(() => {
  const sysInfo = Taro.getSystemInfoSync()
  listHeight.value = sysInfo.windowHeight - 260

  // Handle deep link filter params
  const filterType = router.params.filter
  const filterValue = router.params.value
  if (filterType && filterValue) {
    const decodedValue = decodeURIComponent(filterValue)
    if (filterType === 'bodyPart') setFilter('bodyPart', decodedValue)
    if (filterType === 'equipment') setFilter('equipment', decodedValue)
    if (filterType === 'target') setFilter('target', decodedValue)
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
}

.filter-section {
  padding: 0 16px;
  margin-bottom: 8px;
}

.filter-scroll {
  white-space: nowrap;
  margin-bottom: 8px;
}

.filter-group {
  display: inline-flex;
  gap: 8px;
  padding-right: 16px;
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
  width: calc((100% - 12px) / 2);
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
