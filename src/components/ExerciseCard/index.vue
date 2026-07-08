<template>
  <view class="exercise-card" @tap="handleTap">
    <view class="card-image-wrap">
      <image
        v-if="gifSrc"
        :src="gifSrc"
        mode="aspectFill"
        class="card-image"
        lazy-load
      />
      <view v-else class="card-placeholder">
        <text class="placeholder-icon">🏋️</text>
      </view>
      <view class="card-badge" v-if="exercise.equipment">
        <text class="badge-text">{{ equipmentLabel }}</text>
      </view>
    </view>
    <view class="card-body">
      <text class="card-title">{{ exercise.name }}</text>
      <view class="card-tags">
        <view class="tag" v-if="exercise.target">
          <text class="tag-text">{{ exercise.target }}</text>
        </view>
        <view class="tag tag-secondary" v-if="exercise.body_part">
          <text class="tag-text">{{ bodyPartLabel }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import type { Exercise } from '@/types/exercise'
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/types/exercise'
import { getGifUrl } from '@/utils/data'
import type { BodyPart } from '@/types/exercise'

interface Props {
  exercise: Exercise
}

const props = defineProps<Props>()

const gifSrc = computed(() => getGifUrl(props.exercise))

const equipmentLabel = computed(() => {
  return EQUIPMENT_LABELS[props.exercise.equipment] || props.exercise.equipment
})

const bodyPartLabel = computed(() => {
  const bp = props.exercise.body_part as BodyPart
  return BODY_PART_LABELS[bp] || props.exercise.body_part
})

function handleTap(): void {
  Taro.navigateTo({
    url: `/packageDetail/pages/detail/index?id=${props.exercise.id}`,
  })
}
</script>

<style>
.exercise-card {
  width: 100%;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-image-wrap {
  width: 100%;
  height: 200px;
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

.placeholder-icon {
  font-size: 48px;
}

.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(76, 175, 80, 0.9);
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
}

.badge-text {
  font-size: 10px;
  color: #fff;
  line-height: 1.2;
}

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
</style>
