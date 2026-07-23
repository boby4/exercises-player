<template>
  <view class="favorites-page">
    <SearchBar v-model="searchKeyword" @search="handleSearch" @clear="handleClear" placeholder="搜索收藏..." />

    <view v-if="displayList.length > 0" class="fav-list">
      <view v-for="item in displayList" :key="item.id" class="fav-item">
        <ExerciseCard :exercise="item" />
      </view>
    </view>

    <view v-else class="empty-state">
      <IconFont name="icon-shoushen" :size="64" class="empty-icon" />
      <text class="empty-title">暂无收藏</text>
      <text class="empty-desc">浏览动作详情时点击爱心即可收藏</text>
    </view>

    <view v-if="favoriteStore.count > 0" class="stats-bar">
      <text class="stats-text">共 {{ favoriteStore.count }} 个收藏</text>
    </view>
    
    <!-- 成就弹窗 -->
    <AchievementPopup />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SearchBar from '@/components/SearchBar/index.vue'
import ExerciseCard from '@/components/ExerciseCard/index.vue'
import IconFont from '@/components/IconFont/index.vue'
import AchievementPopup from '@/components/AchievementPopup/index.vue'
import { useFavoriteStore } from '@/store/favorite'
import { useAchievementStore } from '@/store/achievement'
import { useShare } from '@/hooks/useShare'
import { getExerciseNameZh } from '@/utils/data'
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/types/exercise'

const favoriteStore = useFavoriteStore()
const achievementStore = useAchievementStore()
const searchKeyword = ref('')

useShare({
  title: '我的健身收藏 - ExercisesPlayer',
  path: '/pages/favorites/index',
})

// 中文 → 英文反向映射
const zhToEnMap: Record<string, string> = {}
for (const [en, zh] of Object.entries(BODY_PART_LABELS)) {
  zhToEnMap[zh.toLowerCase()] = en.toLowerCase()
}
for (const [en, zh] of Object.entries(EQUIPMENT_LABELS)) {
  zhToEnMap[zh.toLowerCase()] = en.toLowerCase()
}

const displayList = computed(() => {
  const all = favoriteStore.favoriteExercises
  if (!searchKeyword.value) return all
  const kw = searchKeyword.value.toLowerCase()
  const mapped = zhToEnMap[kw]
  const keywords = mapped ? [kw, mapped] : [kw]
  
  return all.filter((e) => {
    const zhName = getExerciseNameZh(e).toLowerCase()
    return keywords.some(
      (k) =>
        e.name.toLowerCase().includes(k) ||
        zhName.includes(k) ||
        e.target.toLowerCase().includes(k) ||
        e.body_part.toLowerCase().includes(k) ||
        e.equipment.toLowerCase().includes(k)
    )
  })
})

function handleSearch(): void {
  // Search is reactive via computed
}

function handleClear(): void {
  searchKeyword.value = ''
}
</script>

<style>
.favorites-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 20px;
}

.fav-list {
  padding: 0 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.fav-item {
  width: 48%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 32px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 13px;
  color: #999;
}

.stats-bar {
  padding: 16px;
  text-align: center;
}

.stats-text {
  font-size: 12px;
  color: #999;
}
</style>
