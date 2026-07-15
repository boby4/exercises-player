<template>
  <view class="fav-btn" :class="{ active: isFav }" @tap="handleTap">
    <text class="fav-heart">{{ isFav ? '❤️' : '🤍' }}</text>
    <text class="fav-label">{{ isFav ? '已收藏' : '收藏' }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFavoriteStore } from '@/store/favorite'

interface Props {
  exerciseId: string
}

const props = defineProps<Props>()

const favStore = useFavoriteStore()
const isFav = computed(() => favStore.isFavorite(props.exerciseId))
const popping = ref(false)

function handleTap(): void {
  favStore.toggleFavorite(props.exerciseId)
  popping.value = true
  setTimeout(() => (popping.value = false), 300)
}
</script>

<style>
.fav-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.06);
  transition: background 0.2s;
}

.fav-btn.active {
  background: rgba(239, 83, 80, 0.1);
}

.fav-heart {
  font-size: 20px;
  line-height: 1;
  transition: transform 0.2s;
}

.fav-btn.active .fav-heart {
  transform: scale(1.15);
}

.fav-label {
  font-size: 12px;
  color: #999;
  line-height: 1;
}

.fav-btn.active .fav-label {
  color: #ef5350;
  font-weight: 600;
}
</style>
