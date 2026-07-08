<template>
  <view class="page">
    <SearchBar v-model="searchKeyword" @search="handleSearch" @clear="handleClear" placeholder="搜索收藏..." />

    <view v-if="displayList.length > 0" class="fav-list">
      <view v-for="item in displayList" :key="item.id" class="fav-item">
        <ExerciseCard :exercise="item" />
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">💚</text>
      <text class="empty-title">暂无收藏</text>
      <text class="empty-desc">浏览动作详情时点击爱心即可收藏</text>
    </view>

    <view v-if="favoriteStore.count > 0" class="stats-bar">
      <text class="stats-text">共 {{ favoriteStore.count }} 个收藏</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SearchBar from '@/components/SearchBar/index.vue'
import ExerciseCard from '@/components/ExerciseCard/index.vue'
import { useFavoriteStore } from '@/store/favorite'

const favoriteStore = useFavoriteStore()
const searchKeyword = ref('')

const displayList = computed(() => {
  const all = favoriteStore.favoriteExercises
  if (!searchKeyword.value) return all
  const kw = searchKeyword.value.toLowerCase()
  return all.filter(
    (e) =>
      e.name.toLowerCase().includes(kw) ||
      e.target.toLowerCase().includes(kw) ||
      e.body_part.toLowerCase().includes(kw)
  )
})

function handleSearch(): void {
  // Search is reactive via computed
}

function handleClear(): void {
  searchKeyword.value = ''
}
</script>

<style scoped>
.page {
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
  width: calc(50% - 6px);
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
