<template>
  <view v-if="visible" class="calc-overlay">
    <view class="calc-modal">
      <!-- 头部 -->
      <view class="calc-header">
        <text class="calc-title">健康计算器</text>
        <view class="calc-close" @tap="close">
          <text class="calc-close-icon">&#x2715;</text>
        </view>
      </view>

      <!-- Tab -->
      <view class="calc-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="calc-tab"
          :class="{ active: activeTab === tab.key }"
          @tap="activeTab = tab.key"
        >
          <text class="calc-tab-icon">{{ tab.icon }}</text>
          <text class="calc-tab-label">{{ tab.label }}</text>
        </view>
      </view>

      <!-- 输入区 -->
      <view class="calc-inputs">
        <!-- 共享字段 -->
        <view class="input-row">
          <text class="input-label">身高</text>
          <view class="input-wrap">
            <input
              class="input-field"
              type="digit"
              :value="height"
              @input="height = $event.detail.value"
              placeholder="170"
            />
            <text class="input-unit">cm</text>
          </view>
        </view>
        <view class="input-row">
          <text class="input-label">体重</text>
          <view class="input-wrap">
            <input
              class="input-field"
              type="digit"
              :value="weight"
              @input="weight = $event.detail.value"
              placeholder="65"
            />
            <text class="input-unit">kg</text>
          </view>
        </view>

        <!-- BMR/TDEE + 体脂率 共用字段 -->
        <template v-if="activeTab !== 'bmi'">
          <view class="input-row">
            <text class="input-label">性别</text>
            <view class="gender-btns">
              <view
                class="gender-btn"
                :class="{ active: gender === 'male' }"
                @tap="gender = 'male'"
              >
                <text class="gender-text">♂ 男</text>
              </view>
              <view
                class="gender-btn"
                :class="{ active: gender === 'female' }"
                @tap="gender = 'female'"
              >
                <text class="gender-text">♀ 女</text>
              </view>
            </view>
          </view>
          <view class="input-row">
            <text class="input-label">年龄</text>
            <view class="input-wrap">
              <input
                class="input-field"
                type="number"
                :value="age"
                @input="age = $event.detail.value"
                placeholder="25"
              />
              <text class="input-unit">岁</text>
            </view>
          </view>
        </template>

        <!-- 活动水平（仅代谢率） -->
        <view v-if="activeTab === 'metabolism'" class="input-row">
          <text class="input-label">活动水平</text>
          <scroll-view :scroll-x="true" class="activity-scroll">
            <view class="activity-btns">
              <view
                v-for="al in activityLevels"
                :key="al.value"
                class="activity-btn"
                :class="{ active: activityLevel === al.value }"
                @tap="activityLevel = al.value"
              >
                <text class="activity-label">{{ al.label }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <!-- 结果区 -->
      <view class="calc-result" v-if="hasInput">
        <!-- BMI -->
        <view v-if="activeTab === 'bmi' && bmiResult" class="result-bmi">
          <view class="bmi-gauge">
            <view class="bmi-value-wrap">
              <text class="bmi-value" :style="{ color: bmiResult.color }">{{ bmiResult.value }}</text>
              <text class="bmi-label">BMI</text>
            </view>
            <view class="bmi-bar-bg">
              <view class="bmi-bar" :style="{ width: bmiResult.percent + '%', background: bmiResult.color }"></view>
            </view>
            <view class="bmi-categories">
              <text class="bmi-cat">偏瘦</text>
              <text class="bmi-cat">正常</text>
              <text class="bmi-cat">偏胖</text>
              <text class="bmi-cat">肥胖</text>
            </view>
          </view>
          <view class="bmi-badge" :style="{ background: bmiResult.color + '20' }">
            <text class="bmi-badge-text" :style="{ color: bmiResult.color }">{{ bmiResult.category }}</text>
          </view>
        </view>

        <!-- 代谢率 -->
        <view v-if="activeTab === 'metabolism' && metaResult" class="result-meta">
          <view class="meta-card">
            <text class="meta-card-label">基础代谢 (BMR)</text>
            <text class="meta-card-value">{{ metaResult.bmr }}</text>
            <text class="meta-card-unit">kcal/天</text>
          </view>
          <view class="meta-card highlight">
            <text class="meta-card-label">每日消耗 (TDEE)</text>
            <text class="meta-card-value">{{ metaResult.tdee }}</text>
            <text class="meta-card-unit">kcal/天</text>
          </view>
          <view class="meta-tips">
            <view class="meta-tip lose">
              <text class="meta-tip-label">减脂建议</text>
              <text class="meta-tip-value">{{ metaResult.lose }} kcal</text>
            </view>
            <view class="meta-tip gain">
              <text class="meta-tip-label">增肌建议</text>
              <text class="meta-tip-value">{{ metaResult.gain }} kcal</text>
            </view>
          </view>
        </view>

        <!-- 体脂率 -->
        <view v-if="activeTab === 'bodyfat' && bfResult" class="result-bf">
          <view class="bf-circle">
            <text class="bf-value" :style="{ color: bfResult.color }">{{ bfResult.value }}%</text>
            <text class="bf-label">体脂率</text>
          </view>
          <view class="bf-badge" :style="{ background: bfResult.color + '20' }">
            <text class="bf-badge-text" :style="{ color: bfResult.color }">{{ bfResult.category }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="calc-empty">
        <text class="calc-empty-text">请输入身高和体重</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBodyStore } from '@/store/body'
import {
  calcBMI,
  calcMetabolism,
  calcBodyFat,
  ACTIVITY_LEVELS,
} from '@/utils/calculator'
import type { Gender, ActivityLevel } from '@/utils/calculator'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const bodyStore = useBodyStore()

const activeTab = ref<'bmi' | 'metabolism' | 'bodyfat'>('bmi')
const tabs = [
  { key: 'bmi', icon: '⚖️', label: 'BMI' },
  { key: 'metabolism', icon: '🔥', label: '代谢率' },
  { key: 'bodyfat', icon: '📊', label: '体脂率' },
]

const activityLevels = ACTIVITY_LEVELS

// 输入（字符串，适配 input）
const height = ref('')
const weight = ref('')
const gender = ref<Gender>('male')
const age = ref('')
const activityLevel = ref<ActivityLevel>(1.55)

// 打开时从 store 回填
watch(
  () => props.visible,
  (val) => {
    if (val) {
      const d = bodyStore.bodyData
      height.value = d.height ? String(d.height) : ''
      weight.value = d.weight ? String(d.weight) : ''
      gender.value = d.gender
      age.value = d.age ? String(d.age) : ''
      activityLevel.value = d.activityLevel
    }
  }
)

// 输入变化时保存到 store
watch([height, weight, gender, age, activityLevel], () => {
  const h = parseFloat(height.value)
  const w = parseFloat(weight.value)
  const a = parseInt(age.value)
  if (h > 0 && w > 0) {
    bodyStore.updateData({
      height: h,
      weight: w,
      gender: gender.value,
      age: a > 0 ? a : bodyStore.bodyData.age,
      activityLevel: activityLevel.value,
    })
  }
})

const hasInput = computed(() => {
  const h = parseFloat(height.value)
  const w = parseFloat(weight.value)
  return h > 0 && w > 0
})

const bmiResult = computed(() => {
  if (!hasInput.value) return null
  return calcBMI(parseFloat(height.value), parseFloat(weight.value))
})

const metaResult = computed(() => {
  if (!hasInput.value) return null
  const a = parseInt(age.value)
  if (!a || a <= 0) return null
  return calcMetabolism(gender.value, a, parseFloat(height.value), parseFloat(weight.value), activityLevel.value)
})

const bfResult = computed(() => {
  if (!hasInput.value) return null
  const a = parseInt(age.value)
  if (!a || a <= 0) return null
  return calcBodyFat(gender.value, a, parseFloat(height.value), parseFloat(weight.value))
})

function close(): void {
  emit('close')
}
</script>

<style>
.calc-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
}

.calc-modal {
  width: 100%;
  max-height: 92vh;
  background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}

.calc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
}

.calc-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.calc-close {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.calc-close-icon {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* Tabs */
.calc-tabs {
  display: flex;
  padding: 0 20px;
  gap: 8px;
  margin-bottom: 20px;
}

.calc-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 0;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  border: 2px solid transparent;
}

.calc-tab.active {
  background: rgba(76, 175, 80, 0.15);
  border-color: #4caf50;
}

.calc-tab-icon {
  font-size: 22px;
  line-height: 1;
}

.calc-tab-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.calc-tab.active .calc-tab-label {
  color: #4caf50;
}

/* Inputs */
.calc-inputs {
  padding: 0 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  width: 60px;
  flex-shrink: 0;
}

.input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0 14px;
  height: 44px;
  border: 1PX solid rgba(255, 255, 255, 0.1);
}

.input-field {
  flex: 1;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
  background: transparent;
  border: none;
  height: 44px;
  line-height: 44px;
}

.input-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-left: 6px;
}

.gender-btns {
  flex: 1;
  display: flex;
  gap: 8px;
}

.gender-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 2px solid transparent;
}

.gender-btn.active {
  background: rgba(76, 175, 80, 0.15);
  border-color: #4caf50;
}

.gender-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.gender-btn.active .gender-text {
  color: #4caf50;
}

.activity-scroll {
  flex: 1;
  white-space: nowrap;
}

.activity-btns {
  display: inline-flex;
  gap: 6px;
}

.activity-btn {
  display: inline-flex;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  border: 1PX solid transparent;
  flex-shrink: 0;
}

.activity-btn.active {
  background: rgba(76, 175, 80, 0.15);
  border-color: #4caf50;
}

.activity-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.activity-btn.active .activity-label {
  color: #4caf50;
  font-weight: 600;
}

/* Result */
.calc-result {
  padding: 0 20px 24px;
}

.calc-empty {
  padding: 60px 20px;
  text-align: center;
}

.calc-empty-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
}

/* BMI Result */
.result-bmi {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.bmi-gauge {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.bmi-value-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bmi-value {
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
}

.bmi-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.bmi-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.bmi-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bmi-categories {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.bmi-cat {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
}

.bmi-badge {
  padding: 10px 28px;
  border-radius: 20px;
}

.bmi-badge-text {
  font-size: 15px;
  font-weight: 700;
}

/* Metabolism Result */
.result-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.meta-card.highlight {
  background: rgba(76, 175, 80, 0.12);
  border: 1PX solid rgba(76, 175, 80, 0.3);
}

.meta-card-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.meta-card-value {
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.meta-card.highlight .meta-card-value {
  color: #4caf50;
}

.meta-card-unit {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

.meta-tips {
  display: flex;
  gap: 10px;
}

.meta-tip {
  flex: 1;
  padding: 14px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.meta-tip.lose {
  background: rgba(33, 150, 243, 0.1);
}

.meta-tip.gain {
  background: rgba(255, 152, 0, 0.1);
}

.meta-tip-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.meta-tip-value {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.meta-tip.lose .meta-tip-value {
  color: #2196f3;
}

.meta-tip.gain .meta-tip-value {
  color: #ff9800;
}

/* Body Fat Result */
.result-bf {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.bf-circle {
  width: 160px;
  height: 160px;
  border-radius: 80px;
  background: rgba(255, 255, 255, 0.06);
  border: 4PX solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bf-value {
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
}

.bf-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.bf-badge {
  padding: 10px 28px;
  border-radius: 20px;
}

.bf-badge-text {
  font-size: 15px;
  font-weight: 700;
}
</style>
