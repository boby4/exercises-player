<template>
  <view class="exercise-card">
    <view class="card-image-wrap" @tap="handleTap">
      <image
        v-if="gifSrc"
        :src="gifSrc"
        mode="aspectFill"
        class="card-image"
        lazy-load
      />
      <view v-else class="card-placeholder">
        <IconFont name="icon-yaling" :size="32" style="color: rgba(255,255,255,0.8)" />
      </view>
      <!-- 收藏按钮 -->
      <view class="card-fav-btn" @tap.stop="toggleFavorite">
        <text class="fav-heart" :class="{ active: isFavorite }">♥</text>
      </view>
    </view>
    <view class="card-body" @tap="handleTap">
      <text class="card-title">{{ getExerciseNameZh(exercise) }}</text>
      <view class="card-tags">
        <view class="tag" v-if="exercise.target">
          <text class="tag-text">{{ exercise.target }}</text>
        </view>
        <view class="tag tag-secondary" v-if="exercise.body_part">
          <text class="tag-text">{{ bodyPartLabel }}</text>
        </view>
      </view>
      <!-- 查看详情按钮 -->
      <view class="card-detail-btn">
        <text class="detail-btn-text">查看详情</text>
        <text class="detail-btn-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import IconFont from '@/components/IconFont/index.vue'
import type { Exercise } from '@/types/exercise'
import { BODY_PART_LABELS } from '@/types/exercise'
import { getGifUrl, getExerciseNameZh } from '@/utils/data'
import type { BodyPart } from '@/types/exercise'
import { useFavoriteStore } from '@/store/favorite'

interface Props {
  exercise: Exercise
}

const props = defineProps<Props>()
const favoriteStore = useFavoriteStore()

const gifSrc = computed(() => getGifUrl(props.exercise))

const isFavorite = computed(() => favoriteStore.isFavorite(props.exercise.id))

const bodyPartLabel = computed(() => {
  const bp = props.exercise.body_part as BodyPart
  return BODY_PART_LABELS[bp] || props.exercise.body_part
})

function handleTap(): void {
  Taro.navigateTo({
    url: `/packageDetail/pages/detail/index?id=${props.exercise.id}`,
  })
}

function toggleFavorite(): void {
  favoriteStore.toggleFavorite(props.exercise.id)
}
</script>

<style>
.exercise-card {
  width: 100%;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-image-wrap {
  width: 100%;
  height: 180px;
  position: relative;
  background: #f5f5f5;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 收藏按钮 */
.card-fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.fav-heart {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1;
}

.fav-heart.active {
  color: #f44336;
}

/* 卡片内容 */
.card-body {
  padding: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.card-tags {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.tag {
  background: #e8f5e9;
  padding: 3px 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
}

.tag-text {
  font-size: 10px;
  color: #4caf50;
  line-height: 1.2;
  white-space: nowrap;
}

.tag-secondary {
  background: #f5f5f5;
}

.tag-secondary .tag-text {
  color: #666;
}

/* 查看详情按钮 */
.card-detail-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.detail-btn-text {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.detail-btn-arrow {
  font-size: 16px;
  color: #999;
  font-weight: 300;
}
</style>
