<template>
  <view class="fav-btn" @tap="handleTap">
    <text class="fav-icon" :class="{ active: isFav }">{{ isFav ? '❤️' : '🤍' }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFavoriteStore } from '@/store/favorite'

interface Props {
  exerciseId: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
})

const favStore = useFavoriteStore()
const isFav = computed(() => favStore.isFavorite(props.exerciseId))

function handleTap(): void {
  favStore.toggleFavorite(props.exerciseId)
}
</script>

<style>
.fav-btn {
  padding: 6px;
}

.fav-icon {
  font-size: 22px;
  transition: transform 0.2s;
}

.fav-icon.active {
  transform: scale(1.2);
}
</style>
