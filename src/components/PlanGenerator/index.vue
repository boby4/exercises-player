<template>
  <view v-if="visible" class="gen-overlay" @tap="close">
    <view class="gen-modal" @tap.stop>
      <!-- 头部 -->
      <view class="gen-header">
        <text class="gen-title">智能生成训练计划</text>
        <view class="gen-close" @tap="close">
          <text class="gen-close-icon">&#x2715;</text>
        </view>
      </view>

      <!-- 步骤指示器 -->
      <view class="gen-steps">
        <view
          v-for="(s, i) in steps"
          :key="i"
          class="gen-step"
          :class="{ active: step === i, done: step > i }"
        >
          <view class="gen-step-dot">
            <text class="gen-step-num">{{ step > i ? '✓' : i + 1 }}</text>
          </view>
          <text class="gen-step-label">{{ s }}</text>
        </view>
      </view>

      <!-- Step 0: 训练目标 -->
      <view v-if="step === 0" class="gen-body">
        <text class="gen-section-title">你的训练目标是什么？</text>
        <view class="gen-grid">
          <view
            v-for="g in goals"
            :key="g.key"
            class="gen-card"
            :class="{ selected: goal === g.key }"
            @tap="goal = g.key"
          >
            <text class="gen-card-icon">{{ g.icon }}</text>
            <text class="gen-card-label">{{ g.label }}</text>
          </view>
        </view>
      </view>

      <!-- Step 1: 训练部位 -->
      <view v-if="step === 1" class="gen-body">
        <text class="gen-section-title">想练哪些部位？（可多选）</text>
        <view class="gen-grid">
          <view
            v-for="f in focuses"
            :key="f.key"
            class="gen-card sm"
            :class="{ selected: bodyFocus.includes(f.key) }"
            @tap="toggleFocus(f.key)"
          >
            <text class="gen-card-icon">{{ f.icon }}</text>
            <text class="gen-card-label">{{ f.label }}</text>
          </view>
        </view>
        <view class="gen-hint">
          <text class="gen-hint-text">快捷预设：</text>
          <view class="gen-presets">
            <view class="gen-preset" @tap="setPreset('push')">推Push</view>
            <view class="gen-preset" @tap="setPreset('pull')">拉Pull</view>
            <view class="gen-preset" @tap="setPreset('leg')">腿Leg</view>
            <view class="gen-preset" @tap="setPreset('fullbody')">全身</view>
          </view>
        </view>
      </view>

      <!-- Step 2: 训练时长 -->
      <view v-if="step === 2" class="gen-body">
        <text class="gen-section-title">计划练多久？</text>
        <view class="gen-grid">
          <view
            v-for="d in durations"
            :key="d.key"
            class="gen-card"
            :class="{ selected: duration === d.key }"
            @tap="duration = d.key"
          >
            <text class="gen-card-icon">{{ d.icon }}</text>
            <text class="gen-card-label">{{ d.label }}</text>
            <text class="gen-card-sub">{{ d.exercises }}个动作</text>
          </view>
        </view>
      </view>

      <!-- Step 3: 训练地点 & 器械 -->
      <view v-if="step === 3" class="gen-body">
        <text class="gen-section-title">在哪练？</text>
        <view class="gen-grid">
          <view
            v-for="loc in locations"
            :key="loc.key"
            class="gen-card"
            :class="{ selected: location === loc.key }"
            @tap="location = loc.key"
          >
            <text class="gen-card-icon">{{ loc.icon }}</text>
            <text class="gen-card-label">{{ loc.label }}</text>
          </view>
        </view>
        <view class="gen-sub-section">
          <text class="gen-sub-title">器械偏好（可选多选）</text>
          <view class="gen-equip-grid">
            <view
              v-for="eq in availableEquipments"
              :key="eq"
              class="gen-equip-chip"
              :class="{ selected: preferredEquipment.includes(eq) }"
              @tap="toggleEquipment(eq)"
            >
              <text class="gen-equip-text">{{ getEquipLabel(eq) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Step 4: 预览 -->
      <view v-if="step === 4" class="gen-body">
        <text class="gen-section-title">为你生成的计划</text>
        <view class="gen-preview-name">
          <text class="gen-preview-name-text">{{ generatedPlan?.name || '' }}</text>
          <text class="gen-preview-count">{{ generatedPlan?.exercises.length || 0 }} 个动作</text>
        </view>
        <view class="gen-preview-list">
          <view
            v-for="(ex, idx) in generatedPlan?.exercises || []"
            :key="ex.id"
            class="gen-preview-item"
          >
            <text class="gen-preview-idx">{{ idx + 1 }}</text>
            <view class="gen-preview-info">
              <text class="gen-preview-ex-name">{{ ex.name }}</text>
              <text class="gen-preview-ex-meta">{{ ex.target }} · {{ getEquipLabel(ex.equipment) }}</text>
            </view>
            <view class="gen-preview-del" @tap="removeExercise(ex.id)">
              <text class="gen-preview-del-icon">&#x2715;</text>
            </view>
          </view>
        </view>
        <view class="gen-preview-actions">
          <view class="gen-refresh-btn" @tap="regenerate">
            <text class="gen-refresh-text">换一批</text>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="gen-footer">
        <view v-if="step > 0" class="gen-prev-btn" @tap="prevStep">
          <text class="gen-prev-text">上一步</text>
        </view>
        <view
          class="gen-next-btn"
          :class="{ disabled: !canNext }"
          @tap="step < 4 ? nextStep() : savePlan()"
        >
          <text class="gen-next-text">{{ step < 4 ? '下一步' : '保存计划' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Taro from '@tarojs/taro'
import {
  generatePlan,
  getAvailableEquipment,
  getCountByDuration,
  GOAL_LABELS,
  GOAL_ICONS,
  FOCUS_LABELS,
  FOCUS_ICONS,
  DURATION_LABELS,
  LOCATION_LABELS,
  LOCATION_ICONS,
} from '@/utils/planGenerator'
import type { TrainingGoal, BodyFocus, Duration, Location, GeneratedPlan } from '@/utils/planGenerator'
import { EQUIPMENT_LABELS } from '@/types/exercise'
import { usePlanStore } from '@/store/plan'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const planStore = usePlanStore()
const step = ref(0)
const steps = ['训练目标', '训练部位', '训练时长', '训练地点', '预览确认']

// 表单数据
const goal = ref<TrainingGoal>('muscle_gain')
const bodyFocus = ref<BodyFocus[]>(['fullbody'])
const duration = ref<Duration>('30min')
const location = ref<Location>('gym')
const preferredEquipment = ref<string[]>([])
const generatedPlan = ref<GeneratedPlan | null>(null)

// 选项数据
const goals = Object.entries(GOAL_LABELS).map(([k, v]) => ({
  key: k as TrainingGoal,
  label: v,
  icon: GOAL_ICONS[k as TrainingGoal],
}))

const focuses = Object.entries(FOCUS_LABELS).map(([k, v]) => ({
  key: k as BodyFocus,
  label: v,
  icon: FOCUS_ICONS[k as BodyFocus],
}))

const durations = (['15min', '30min', '45min', '60min'] as Duration[]).map((d) => ({
  key: d,
  label: DURATION_LABELS[d],
  icon: d === '15min' ? '⚡' : d === '30min' ? '⏱️' : d === '45min' ? '⏰' : '🕐',
  exercises: getCountByDuration(goal.value, d),
}))

const locations = Object.entries(LOCATION_LABELS).map(([k, v]) => ({
  key: k as Location,
  label: v,
  icon: LOCATION_ICONS[k as Location],
}))

const availableEquipments = computed(() => getAvailableEquipment(location.value))

function getEquipLabel(eq: string): string {
  return EQUIPMENT_LABELS[eq] || eq
}

const canNext = computed(() => {
  if (step.value === 1 && bodyFocus.value.length === 0) return false
  return true
})

function toggleFocus(focus: BodyFocus): void {
  if (focus === 'fullbody') {
    bodyFocus.value = bodyFocus.value.includes('fullbody') ? [] : ['fullbody']
    return
  }
  const idx = bodyFocus.value.indexOf(focus)
  if (idx === -1) {
    bodyFocus.value = [...bodyFocus.value.filter((f) => f !== 'fullbody'), focus]
  } else {
    bodyFocus.value = bodyFocus.value.filter((f) => f !== focus)
  }
}

function setPreset(type: string): void {
  const presetMap: Record<string, BodyFocus[]> = {
    push: ['chest', 'shoulders', 'arms'],
    pull: ['back', 'arms'],
    leg: ['legs'],
    fullbody: ['fullbody'],
  }
  bodyFocus.value = presetMap[type] || ['fullbody']
}

function toggleEquipment(eq: string): void {
  const idx = preferredEquipment.value.indexOf(eq)
  if (idx === -1) {
    preferredEquipment.value = [...preferredEquipment.value, eq]
  } else {
    preferredEquipment.value = preferredEquipment.value.filter((e) => e !== eq)
  }
}

function nextStep(): void {
  if (!canNext.value) return
  if (step.value === 3) {
    doGenerate()
  }
  step.value++
}

function prevStep(): void {
  if (step.value > 0) step.value--
}

function doGenerate(): void {
  generatedPlan.value = generatePlan({
    goal: goal.value,
    bodyFocus: bodyFocus.value,
    duration: duration.value,
    location: location.value,
    preferredEquipment: preferredEquipment.value.length > 0 ? preferredEquipment.value : undefined,
    excludeIds: generatedPlan.value?.exercises.map((e) => e.id),
  })
}

function regenerate(): void {
  doGenerate()
}

function removeExercise(id: string): void {
  if (!generatedPlan.value) return
  generatedPlan.value = {
    ...generatedPlan.value,
    exercises: generatedPlan.value.exercises.filter((e) => e.id !== id),
  }
}

function savePlan(): void {
  if (!generatedPlan.value || generatedPlan.value.exercises.length === 0) {
    Taro.showToast({ title: '请至少保留一个动作', icon: 'none' })
    return
  }
  planStore.createPlan(
    generatedPlan.value.name,
    generatedPlan.value.type,
    generatedPlan.value.exercises.map((e) => e.id),
  )
  Taro.showToast({ title: '计划已生成', icon: 'success' })
  emit('saved')
  close()
}

function close(): void {
  step.value = 0
  emit('close')
}

// 每次打开时重置
watch(
  () => props.visible,
  (val) => {
    if (val) {
      step.value = 0
      goal.value = 'muscle_gain'
      bodyFocus.value = ['fullbody']
      duration.value = '30min'
      location.value = 'gym'
      preferredEquipment.value = []
      generatedPlan.value = null
    }
  },
)
</script>

<style>
.gen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10000;
}

.gen-modal {
  width: 100%;
  max-height: 90vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

.gen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1PX solid #f0f0f0;
  flex-shrink: 0;
}

.gen-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.gen-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #f5f6f8;
}

.gen-close-icon {
  font-size: 11px;
  color: #aaa;
  line-height: 1;
}

/* 步骤指示器 */
.gen-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 20px 10px;
  flex-shrink: 0;
}

.gen-step {
  display: flex;
  align-items: center;
  gap: 4px;
}

.gen-step-dot {
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gen-step-num {
  font-size: 10px;
  color: #999;
  font-weight: 600;
  line-height: 1;
}

.gen-step.active .gen-step-dot {
  background: #4caf50;
}

.gen-step.active .gen-step-num {
  color: #fff;
}

.gen-step.done .gen-step-dot {
  background: #e8f5e9;
}

.gen-step.done .gen-step-num {
  color: #4caf50;
}

.gen-step-label {
  font-size: 10px;
  color: #ccc;
  line-height: 1;
}

.gen-step.active .gen-step-label {
  color: #4caf50;
  font-weight: 600;
}

.gen-step.done .gen-step-label {
  color: #999;
}

/* 内容区 */
.gen-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px 16px;
  min-height: 260px;
}

.gen-section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 14px;
  line-height: 1.3;
}

.gen-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.gen-card {
  width: calc(33.333% - 7px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  background: #f8f9fa;
  border-radius: 14px;
  border: 2px solid transparent;
  gap: 6px;
}

.gen-card.sm {
  width: calc(25% - 8px);
  padding: 12px 6px;
}

.gen-card.selected {
  border-color: #4caf50;
  background: #e8f5e9;
}

.gen-card-icon {
  font-size: 28px;
  line-height: 1;
}

.gen-card.sm .gen-card-icon {
  font-size: 22px;
}

.gen-card-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  line-height: 1.2;
}

.gen-card.selected .gen-card-label {
  color: #4caf50;
  font-weight: 700;
}

.gen-card-sub {
  font-size: 10px;
  color: #aaa;
  line-height: 1;
}

.gen-card.selected .gen-card-sub {
  color: #66bb6a;
}

/* 快捷预设 */
.gen-hint {
  margin-top: 16px;
}

.gen-hint-text {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
  margin-bottom: 8px;
}

.gen-presets {
  display: flex;
  gap: 8px;
}

.gen-preset {
  padding: 6px 14px;
  background: #f5f6f8;
  border-radius: 14px;
  font-size: 11px;
  color: #666;
}

/* 器械选择 */
.gen-sub-section {
  margin-top: 18px;
}

.gen-sub-title {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
  line-height: 1.2;
}

.gen-equip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gen-equip-chip {
  padding: 6px 14px;
  background: #f5f6f8;
  border-radius: 14px;
  border: 1PX solid #eee;
}

.gen-equip-chip.selected {
  background: #e8f5e9;
  border-color: #4caf50;
}

.gen-equip-text {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.gen-equip-chip.selected .gen-equip-text {
  color: #4caf50;
  font-weight: 600;
}

/* 预览 */
.gen-preview-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #e8f5e9;
  border-radius: 10px;
  margin-bottom: 12px;
}

.gen-preview-name-text {
  font-size: 14px;
  font-weight: 700;
  color: #2e7d32;
  line-height: 1.3;
}

.gen-preview-count {
  font-size: 11px;
  color: #4caf50;
  line-height: 1;
}

.gen-preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.gen-preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #f8f9fa;
  border-radius: 10px;
}

.gen-preview-idx {
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
  text-align: center;
}

.gen-preview-info {
  flex: 1;
  min-width: 0;
}

.gen-preview-ex-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.gen-preview-ex-meta {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
}

.gen-preview-del {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #fff0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.gen-preview-del-icon {
  font-size: 10px;
  color: #e53935;
  line-height: 1;
}

.gen-preview-actions {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.gen-refresh-btn {
  padding: 8px 20px;
  background: #f5f6f8;
  border-radius: 16px;
}

.gen-refresh-text {
  font-size: 12px;
  color: #666;
  line-height: 1;
}

/* 底部按钮 */
.gen-footer {
  display: flex;
  gap: 10px;
  padding: 12px 20px 16px;
  border-top: 1PX solid #f0f0f0;
  flex-shrink: 0;
}

.gen-prev-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f8;
  border-radius: 22px;
}

.gen-prev-text {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.gen-next-btn {
  flex: 2;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 22px;
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.25);
}

.gen-next-btn.disabled {
  opacity: 0.4;
}

.gen-next-text {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}
</style>
