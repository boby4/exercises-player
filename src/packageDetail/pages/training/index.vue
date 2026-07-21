<template>
  <view class="training-page">
    <!-- 顶部状态栏 -->
    <view class="status-bar">
      <view class="top-bar">
        <view class="close-btn" @tap="exitTraining">
          <IconFont name="icon-bushui" :size="12" class="close-icon" />
        </view>
        <text class="progress-text">{{ currentIndex + 1 }} / {{ exercises.length }}</text>
        <view class="timer-badge">
          <text class="timer-text">{{ displayTime }}</text>
        </view>
      </view>
    </view>

    <!-- 进度条 -->
    <view class="progress-bar-wrap">
      <view class="progress-bar" :style="{ width: progress + '%' }" />
    </view>

    <!-- 动作展示区 -->
    <view class="exercise-area" v-if="currentExercise">
      <image
        v-if="currentGif"
        :src="currentGif"
        class="exercise-gif"
      />
      <view v-else class="gif-placeholder">
        <IconFont name="icon-yaling" :size="60" class="placeholder-icon" />
        <text class="placeholder-hint">暂无演示图</text>
      </view>
    </view>

    <!-- 动作信息 -->
    <view class="info-area" v-if="currentExercise">
      <text class="exercise-name">{{ currentExercise.name }}</text>
      <view class="exercise-meta">
        <view class="meta-tag">
          <text class="meta-tag-text">{{ currentExercise.target }}</text>
        </view>
        <view class="meta-tag">
          <text class="meta-tag-text">{{ currentExercise.equipment }}</text>
        </view>
      </view>
    </view>

    <!-- 动作导航条 -->
    <view class="nav-strip" v-if="exercises.length > 1">
      <scroll-view :scroll-x="true" :show-scrollbar="true" :enhanced="true" class="nav-strip-scroll">
        <view class="nav-strip-inner">
          <view
            v-for="(ex, idx) in exercises"
            :key="ex.id"
            class="nav-thumb"
            :class="{ active: idx === currentIndex }"
            @tap="jumpTo(idx)"
          >
            <image
              v-if="getGif(ex)"
              :src="getGif(ex)"
              class="nav-thumb-img"
              mode="aspectFill"
            />
            <view v-else class="nav-thumb-ph">
              <IconFont name="icon-jirounan" :size="20" class="nav-thumb-icon" />
            </view>
            <text class="nav-thumb-num">{{ idx + 1 }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 计时器选择 -->
    <view class="timer-section" v-if="!isRunning && !isPaused">
      <text class="timer-label">选择时长</text>
      <scroll-view :scroll-x="true" :show-scrollbar="true" :enhanced="true" class="timer-scroll">
        <view class="timer-presets">
          <view
            v-for="preset in presets"
            :key="preset.seconds"
            class="timer-preset"
            :class="{ active: totalSeconds === preset.seconds }"
            @tap="setDuration(preset.seconds)"
          >
            <text class="preset-text">{{ preset.label }}</text>
          </view>
          <view class="timer-preset custom-preset" @tap="showCustomInput = true">
            <text class="preset-text">自定义</text>
          </view>
        </view>
      </scroll-view>
      <view v-if="showCustomInput" class="custom-input-wrap">
        <input
          class="custom-input"
          type="number"
          v-model="customSeconds"
          placeholder="输入秒数"
        />
        <view class="custom-confirm" @tap="applyCustom">
          <text class="custom-confirm-text">确定</text>
        </view>
      </view>
    </view>

    <!-- 控制按钮 -->
    <view class="controls">
      <view class="nav-btn" :class="{ disabled: currentIndex === 0 }" @tap="prevExercise">
        <IconFont name="icon-jianshenqixie" :size="16" class="nav-btn-text" />
        <text class="nav-btn-label">上一个</text>
      </view>

      <view class="main-btn" @tap="handleMainAction">
        <view class="main-btn-inner">
          <text class="main-btn-text">{{ mainBtnText }}</text>
        </view>
      </view>

      <view class="nav-btn" :class="{ disabled: currentIndex >= exercises.length - 1 }" @tap="nextExercise">
        <IconFont name="icon-jianshenqixie" :size="16" class="nav-btn-text" />
        <text class="nav-btn-label">下一个</text>
      </view>
    </view>

    <!-- 训练完成 -->
    <view v-if="isComplete && currentIndex >= exercises.length - 1" class="complete-overlay">
      <view class="complete-card">
        <IconFont name="icon-tice" :size="48" class="complete-icon" />
        <text class="complete-title">训练完成！</text>
        <text class="complete-info">{{ exercises.length }} 个动作 · {{ formatTotalDuration }}</text>
        <view class="complete-actions">
          <view class="complete-btn primary" @tap="exitTraining">
            <text class="complete-btn-text">完成</text>
          </view>
          <view class="complete-btn" @tap="restartTraining">
            <text class="complete-btn-text secondary">重新开始</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
import IconFont from '@/components/IconFont/index.vue'
import type { Exercise } from '@/types/exercise'
import { getExerciseById, getExercisesByIds, getGifUrl } from '@/utils/data'
import { useTimer } from '@/hooks/useTimer'
import { useShare } from '@/hooks/useShare'
import { useRecordStore } from '@/store/record'
import { usePlanStore } from '@/store/plan'

const router = useRouter()
const recordStore = useRecordStore()
const planStore = usePlanStore()
const statusBarHeight = ref(44)

const exercises = ref<Exercise[]>([])
const currentIndex = ref(0)
const showCustomInput = ref(false)
const customSeconds = ref('')
const trainingStartTime = ref(0)

const {
  totalSeconds,
  remainingSeconds,
  isRunning,
  isPaused,
  isComplete,
  progress,
  displayTime,
  presets,
  start,
  pause,
  resume,
  reset,
  setDuration,
} = useTimer(60)

const currentExercise = computed(() => exercises.value[currentIndex.value] || null)
const currentGif = computed(() => (currentExercise.value ? getGifUrl(currentExercise.value) : ''))

useShare(() => {
  const names = exercises.value.map((e) => e.name).join('、')
  return {
    title: exercises.value.length > 0 ? `跟我一起练：${names}` : '跟我一起健身吧',
    path: router.params.planId
      ? `/packageDetail/pages/training/index?planId=${router.params.planId}`
      : exercises.value.length > 0
        ? `/packageDetail/pages/training/index?ids=${exercises.value.map((e) => e.id).join(',')}`
        : '/pages/index/index',
  }
})

function getGif(ex: Exercise): string {
  return getGifUrl(ex)
}

const mainBtnText = computed(() => {
  if (isComplete.value) return '完成'
  if (isRunning.value) return '暂停'
  if (isPaused.value) return '继续'
  return '开始'
})

const formatTotalDuration = computed(() => {
  const elapsed = Math.floor((Date.now() - trainingStartTime.value) / 1000)
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return `${mins}分${secs}秒`
})

function handleMainAction(): void {
  if (isComplete.value) {
    finishTraining()
    return
  }
  if (isRunning.value) {
    pause()
    return
  }
  if (isPaused.value) {
    resume()
    return
  }
  trainingStartTime.value = Date.now()
  start()
}

function nextExercise(): void {
  if (currentIndex.value < exercises.value.length - 1) {
    currentIndex.value++
    reset()
  }
}

function prevExercise(): void {
  if (currentIndex.value > 0) {
    currentIndex.value--
    reset()
  }
}

function jumpTo(idx: number): void {
  if (idx >= 0 && idx < exercises.value.length) {
    currentIndex.value = idx
    reset()
  }
}

function applyCustom(): void {
  const secs = parseInt(customSeconds.value)
  if (secs > 0 && secs <= 600) {
    setDuration(secs)
    showCustomInput.value = false
    customSeconds.value = ''
  } else {
    Taro.showToast({ title: '请输入1-600之间的数字', icon: 'none' })
  }
}

function finishTraining(): void {
  const duration = Math.floor((Date.now() - trainingStartTime.value) / 1000)
  const exerciseIds = exercises.value.map((e) => e.id)
  const planId = router.params.planId || undefined
  recordStore.addRecord(exerciseIds, duration, planId)
  Taro.showToast({ title: '训练已记录', icon: 'success' })
  setTimeout(() => Taro.navigateBack(), 1500)
}

function exitTraining(): void {
  Taro.showModal({
    title: '退出训练',
    content: '确定要退出当前训练吗？',
    success: (res) => {
      if (res.confirm) {
        Taro.navigateBack()
      }
    },
  })
}

function restartTraining(): void {
  currentIndex.value = 0
  trainingStartTime.value = Date.now()
  reset()
}

let wakeLock: any = null

async function requestWakeLock() {
  if (process.env.TARO_ENV === 'h5') {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await (navigator as any).wakeLock.request('screen')
      }
    } catch (_e) { /* ignore */ }
  } else {
    Taro.setKeepScreenOn({ keepScreenOn: true })
  }
}

async function releaseWakeLock() {
  if (wakeLock) {
    try { await wakeLock.release() } catch (_e) { /* ignore */ }
    wakeLock = null
  }
  if (process.env.TARO_ENV !== 'h5') {
    Taro.setKeepScreenOn({ keepScreenOn: false })
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && !wakeLock) {
    requestWakeLock()
  }
}

onMounted(() => {
  const sysInfo = Taro.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 44

  requestWakeLock()
  if (process.env.TARO_ENV === 'h5') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  // Load exercises from params
  const planId = router.params.planId
  const ids = router.params.ids
  const singleId = router.params.id
  if (planId) {
    const plan = planStore.getPlanById(planId)
    if (plan && plan.exerciseIds.length > 0) {
      exercises.value = getExercisesByIds(plan.exerciseIds)
    }
  } else if (ids) {
    exercises.value = getExercisesByIds(ids.split(','))
  } else if (singleId) {
    const ex = getExerciseById(singleId)
    if (ex) exercises.value = [ex]
  }

  if (exercises.value.length === 0) {
    Taro.showToast({ title: '未找到动作', icon: 'none' })
    setTimeout(() => Taro.navigateBack(), 1500)
  }
})

onUnmounted(() => {
  releaseWakeLock()
  if (process.env.TARO_ENV === 'h5') {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})
</script>

<style>
.training-page {
  min-height: 100vh;
  background: #111;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: rgba(0, 0, 0, 0.6);
  padding-top: env(safe-area-inset-top);
  flex-shrink: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
}

.close-icon {
  font-size: 12px;
  color: #fff;
  line-height: 1;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.timer-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 10px;
  border: 1PX solid rgba(76, 175, 80, 0.4);
}

.timer-text {
  font-size: 16px;
  color: #66bb6a;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.progress-bar-wrap {
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition: width 0.3s;
  border-radius: 0 2px 2px 0;
}

.exercise-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  background: #1a1a1a;
  overflow: hidden;
  position: relative;
}

.exercise-gif {
  width: 100%;
  max-height: 380px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

.exercise-gif :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gif-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.placeholder-icon {
  font-size: 60px;
}

.placeholder-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}

.info-area {
  padding: 16px 16px 12px;
  text-align: center;
  flex-shrink: 0;
}

.exercise-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.exercise-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.meta-tag-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.3;
}

.nav-strip {
  padding: 8px 0;
  flex-shrink: 0;
}

.nav-strip-scroll {
  white-space: nowrap;
}

.nav-strip-inner {
  display: inline-flex;
  gap: 8px;
  padding: 0 16px;
}

.nav-thumb {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: 10px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.nav-thumb.active {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.15);
}

.nav-thumb-img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #2d2d2d;
  object-fit: cover;
}

.nav-thumb-img :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

.nav-thumb-ph {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #2d2d2d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-thumb-icon {
  font-size: 20px;
  line-height: 1;
}

.nav-thumb-num {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1;
}

.nav-thumb.active .nav-thumb-num {
  color: #66bb6a;
  font-weight: 600;
}

.timer-section {
  padding: 12px 16px;
  flex-shrink: 0;
}

.timer-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}

.timer-scroll {
  white-space: nowrap;
}

.timer-presets {
  display: inline-flex;
  gap: 8px;
}

.timer-preset {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border: 1PX solid transparent;
}

.timer-preset.active {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.15);
}

.preset-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.custom-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.custom-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  border: 1PX solid rgba(255, 255, 255, 0.1);
}

.custom-confirm {
  padding: 10px 18px;
  background: #4caf50;
  border-radius: 10px;
}

.custom-confirm-text {
  font-size: 13px;
  color: #fff;
  font-weight: 600;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  flex-shrink: 0;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
}

.nav-btn.disabled {
  opacity: 0.3;
}

.nav-btn-text {
  font-size: 16px;
  color: #fff;
  line-height: 1;
}

.nav-btn-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.2;
}

.main-btn {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-btn-inner {
  width: 72px;
  height: 72px;
  border-radius: 36px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.35);
}

.main-btn-text {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.complete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.complete-card {
  text-align: center;
  padding: 40px;
}

.complete-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 12px;
}

.complete-title {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  display: block;
  margin-bottom: 8px;
}

.complete-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-bottom: 32px;
}

.complete-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
}

.complete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  width: 100%;
}

.complete-btn.primary {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.3);
}

.complete-btn-text {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
}

.complete-btn-text.secondary {
  color: rgba(255, 255, 255, 0.7);
}
</style>
