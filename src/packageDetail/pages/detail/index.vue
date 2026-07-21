<template>
  <view class="detail-page" v-if="exercise">
    <!-- GIF 展示 -->
    <view class="gif-section">
      <image
        v-if="gifSrc"
        :src="gifSrc"
        mode="widthFix"
        class="gif-image"
      />
      <view v-else class="gif-placeholder">
        <IconFont name="icon-yaling" :size="64" class="placeholder-text" />
      </view>
    </view>

    <!-- 动作信息 -->
    <view class="info-section">
      <view class="title-row">
        <text class="exercise-name">{{ exercise.name }}</text>
        <FavoriteButton :exercise-id="exercise.id" />
      </view>

      <!-- 标签 -->
      <view class="info-tags">
        <view class="info-tag primary">
          <text class="info-tag-text">{{ bodyPartLabel }}</text>
        </view>
        <view class="info-tag">
          <text class="info-tag-text">{{ exercise.target }}</text>
        </view>
        <view class="info-tag">
          <text class="info-tag-text">{{ equipmentLabel }}</text>
        </view>
      </view>

      <!-- 详细信息 -->
      <view class="detail-card">
        <view class="detail-row">
          <text class="detail-label">目标肌肉</text>
          <text class="detail-value">{{ exercise.target }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">辅助肌肉</text>
          <text class="detail-value">{{ secondaryMuscles }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">身体部位</text>
          <text class="detail-value">{{ bodyPartLabel }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">器械</text>
          <text class="detail-value">{{ equipmentLabel }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">肌群</text>
          <text class="detail-value">{{ exercise.muscle_group }}</text>
        </view>
      </view>

      <!-- 动作步骤 -->
      <view class="steps-section" v-if="steps.length > 0">
        <text class="section-title">动作步骤</text>
        <view class="step-list">
          <view v-for="(step, idx) in steps" :key="idx" class="step-item">
            <view class="step-num">
              <text class="step-num-text">{{ idx + 1 }}</text>
            </view>
            <text class="step-text">{{ step }}</text>
          </view>
        </view>
      </view>

      <!-- 动作说明 -->
      <view class="instructions-section">
        <text class="section-title">动作说明</text>
        <text class="instructions-text">{{ exercise.instructions?.zh || '暂无说明' }}</text>
      </view>

      <!-- 推荐动作 -->
      <view class="related-section" v-if="relatedExercises.length > 0">
        <text class="section-title">推荐动作</text>
        <scroll-view :scroll-x="true" :show-scrollbar="true" :enhanced="true" class="related-scroll">
          <view class="related-list">
            <view v-for="item in relatedExercises" :key="item.id" class="related-item">
              <ExerciseCard :exercise="item" />
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-bar">
      <button class="share-btn" open-type="share">
        <text class="share-icon-text">↗</text>
      </button>
      <view class="start-btn" @tap="startTraining">
        <text class="start-text">开始训练</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
import IconFont from '@/components/IconFont/index.vue'
import type { Exercise } from '@/types/exercise'
import { BODY_PART_LABELS, EQUIPMENT_LABELS } from '@/types/exercise'
import type { BodyPart } from '@/types/exercise'
import { getRelatedExercises, getGifUrl } from '@/utils/data'
import { getFullExerciseById } from '../../utils/data-full'
import { useExerciseStore } from '@/store/exercise'
import { useShare } from '@/hooks/useShare'
import FavoriteButton from '@/components/FavoriteButton/index.vue'
import ExerciseCard from '@/components/ExerciseCard/index.vue'

const router = useRouter()
const exerciseStore = useExerciseStore()
const exercise = ref<Exercise | null>(null)

const gifSrc = computed(() => (exercise.value ? getGifUrl(exercise.value) : ''))

const bodyPartLabel = computed(() => {
  if (!exercise.value) return ''
  const bp = exercise.value.body_part as BodyPart
  return BODY_PART_LABELS[bp] || exercise.value.body_part
})

const equipmentLabel = computed(() => {
  if (!exercise.value) return ''
  return EQUIPMENT_LABELS[exercise.value.equipment] || exercise.value.equipment
})

const secondaryMuscles = computed(() => {
  if (!exercise.value || !exercise.value.secondary_muscles?.length) return '无'
  return exercise.value.secondary_muscles.join('、')
})

const steps = computed(() => {
  if (!exercise.value?.instruction_steps) return []
  return exercise.value.instruction_steps.zh || exercise.value.instruction_steps.en || []
})

const relatedExercises = computed(() => {
  if (!exercise.value) return []
  return getRelatedExercises(exercise.value, 6)
})

useShare(() => ({
  title: exercise.value ? `${exercise.value.name} - 健身动作详情` : '健身动作详情',
  path: exercise.value
    ? `/packageDetail/pages/detail/index?id=${exercise.value.id}`
    : '/pages/index/index',
}))

function startTraining(): void {
  if (!exercise.value) return
  Taro.navigateTo({
    url: `/packageDetail/pages/training/index?id=${exercise.value.id}`,
  })
}

onMounted(() => {
  const id = router.params.id
  if (id) {
    exercise.value = getFullExerciseById(id) || null
    exerciseStore.addRecentViewed(id)

    if (exercise.value) {
      Taro.setNavigationBarTitle({ title: exercise.value.name })
    }
  }
})
</script>

<style>
.detail-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 100px;
}

.gif-section {
  width: 100%;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gif-image {
  width: 100%;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}

.gif-image :deep(img) {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.gif-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.placeholder-text {
  font-size: 64px;
}

.info-section {
  padding: 20px 16px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.exercise-name {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
  line-height: 1.3;
}

.info-tags {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.info-tag {
  padding: 4px 12px;
  border-radius: 12px;
  background: #f5f5f5;
  display: inline-flex;
  align-items: center;
}

.info-tag.primary {
  background: #e8f5e9;
}

.info-tag-text {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
  white-space: nowrap;
}

.info-tag.primary .info-tag-text {
  color: #4caf50;
}

.detail-card {
  margin-top: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1PX solid #f5f5f5;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
  line-height: 1.4;
}

.detail-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  line-height: 1.4;
}

.steps-section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  line-height: 1.3;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-num-text {
  font-size: 12px;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.step-text {
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  flex: 1;
}

.instructions-section {
  margin-top: 24px;
}

.instructions-text {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.related-section {
  margin-top: 24px;
}

.related-scroll {
  white-space: nowrap;
}

.related-list {
  display: inline-flex;
  gap: 12px;
  padding-right: 16px;
}

.related-item {
  width: 200px;
  flex-shrink: 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-btn {
  width: 48px;
  height: 48px;
  background: #f5f5f5;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.share-btn::after {
  border: none;
}

.share-icon-text {
  font-size: 20px;
  color: #666;
  font-weight: 700;
}

.start-btn {
  flex: 1;
  height: 48px;
  background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1;
}
</style>
