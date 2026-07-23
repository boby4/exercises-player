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
      <!-- 查看详情按钮 -->
      <view class="card-detail-btn" @tap.stop="handleTap">
        <text class="detail-btn-text">点击查看详情</text>
      </view>
    </view>
    <view class="card-body" @tap="handleTap">
      <text class="card-title">{{ getExerciseNameZh(exercise) }}</text>
      <view class="card-tags">
        <view class="tag" v-if="targetLabel">
          <text class="tag-text">{{ targetLabel }}</text>
        </view>
        <view class="tag tag-secondary" v-if="bodyPartLabel">
          <text class="tag-text">{{ bodyPartLabel }}</text>
        </view>
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
import { useAchievementStore } from '@/store/achievement'

interface Props {
  exercise: Exercise
}

const props = defineProps<Props>()
const favoriteStore = useFavoriteStore()
const achievementStore = useAchievementStore()

const gifSrc = computed(() => getGifUrl(props.exercise))

const isFavorite = computed(() => favoriteStore.isFavorite(props.exercise.id))

const bodyPartLabel = computed(() => {
  const bp = props.exercise.body_part as BodyPart
  return BODY_PART_LABELS[bp] || props.exercise.body_part
})

// target 翻译映射
const TARGET_LABELS: Record<string, string> = {
  abs: '腹肌',
  quads: '股四头肌',
  lats: '背阔肌',
  calves: '小腿',
  hamstrings: '腘绳肌',
  glutes: '臀部',
  shoulders: '肩部',
  chest: '胸部',
  biceps: '肱二头肌',
  triceps: '肱三头肌',
  forearms: '前臂',
  traps: '斜方肌',
  back: '背部',
  cardio: '有氧',
  abductors: '外展肌',
  adductors: '内收肌',
  'upper back': '上背',
  'lower back': '下背',
  'serratus anterior': '前锯肌',
}

const targetLabel = computed(() => {
  const target = props.exercise.target?.toLowerCase() || ''
  return TARGET_LABELS[target] || props.exercise.target || ''
})

function handleTap(): void {
  Taro.navigateTo({
    url: `/packageDetail/pages/detail/index?id=${props.exercise.id}`,
  })
}

async function toggleFavorite(): Promise<void> {
  await favoriteStore.toggleFavorite(props.exercise.id)
  // 检测成就
  await achievementStore.checkAchievements()
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
  width: 30px;
  height: 30px;
  border-radius: 15px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.card-tags {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: nowrap;
  align-items: center;
  overflow: hidden;
}

.tag {
  background: #e8f5e9;
  padding: 3px 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  max-width: 48%;
  flex-shrink: 0;
}

.tag-text {
  font-size: 10px;
  color: #4caf50;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-secondary {
  background: #f5f5f5;
}

.tag-secondary .tag-text {
  color: #666;
}

/* 查看详情按钮 */
.card-detail-btn {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 5px;
  z-index: 2;
}

.detail-btn-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  line-height: 1;
}
</style>
