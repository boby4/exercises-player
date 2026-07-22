<template>
  <view class="calc-page">
    <!-- Tab 切换 -->
    <view class="calc-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="calc-tab"
        :class="{ active: activeTab === tab.key }"
        @tap="switchTab(tab.key)"
      >
        <text class="calc-tab-icon">{{ tab.icon }}</text>
        <text class="calc-tab-label">{{ tab.label }}</text>
      </view>
    </view>

    <!-- BMI -->
    <view v-if="activeTab === 'bmi'" class="calc-content">
      <view class="calc-card">
        <text class="calc-card-title">📏 身体质量指数 (BMI)</text>
        <text class="calc-card-desc">BMI = 体重(kg) ÷ 身高(m)²</text>
      </view>

      <view class="input-card">
        <view class="input-group">
          <text class="input-label">身高</text>
          <view class="input-field-wrap">
            <input
              class="input-field"
              type="digit"
              :value="height"
              @input="height = $event.detail.value"
              placeholder="请输入身高"
            />
            <text class="input-unit">cm</text>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">体重</text>
          <view class="input-field-wrap">
            <input
              class="input-field"
              type="digit"
              :value="weight"
              @input="weight = $event.detail.value"
              placeholder="请输入体重"
            />
            <text class="input-unit">kg</text>
          </view>
        </view>
        <view class="btn-row">
          <view class="btn-primary" @tap="handleCalcBMI">
            <text class="btn-primary-text">立即计算</text>
          </view>
          <view class="btn-secondary" @tap="clearAll">
            <text class="btn-secondary-text">清除</text>
          </view>
        </view>
      </view>

      <!-- BMI 结果 -->
      <view v-if="bmiResult" class="result-card">
        <view class="result-header">
          <text class="result-label">你的 BMI 值</text>
          <text class="result-value" :style="{ color: bmiResult.color }">{{ bmiResult.value }}</text>
        </view>
        <view class="result-bar-wrap">
          <view class="result-bar-bg">
            <view class="result-bar" :style="{ width: bmiResult.percent + '%', background: bmiResult.color }"></view>
          </view>
          <view class="result-bar-labels">
            <text class="bar-label">偏瘦</text>
            <text class="bar-label">正常</text>
            <text class="bar-label">偏胖</text>
            <text class="bar-label">肥胖</text>
          </view>
        </view>
        <view class="result-badge" :style="{ background: bmiResult.color + '15', borderColor: bmiResult.color }">
          <text class="badge-text" :style="{ color: bmiResult.color }">{{ bmiResult.category }}</text>
        </view>
      </view>

      <!-- BMI 参考标准 -->
      <view class="ref-card">
        <text class="ref-title">📊 BMI 分级标准（中国标准）</text>
        <view class="ref-table">
          <view class="ref-row header">
            <text class="ref-cell">分类</text>
            <text class="ref-cell">BMI 范围</text>
          </view>
          <view class="ref-row">
            <text class="ref-cell">偏瘦</text>
            <text class="ref-cell">< 18.5</text>
          </view>
          <view class="ref-row highlight">
            <text class="ref-cell">正常</text>
            <text class="ref-cell">18.5 ~ 23.9</text>
          </view>
          <view class="ref-row">
            <text class="ref-cell">偏胖</text>
            <text class="ref-cell">24 ~ 27.9</text>
          </view>
          <view class="ref-row">
            <text class="ref-cell">肥胖</text>
            <text class="ref-cell">≥ 28</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 代谢率 -->
    <view v-if="activeTab === 'metabolism'" class="calc-content">
      <view class="calc-card">
        <text class="calc-card-title">🔥 基础代谢率 (BMR) & 每日消耗 (TDEE)</text>
        <text class="calc-card-desc">BMR 是你躺着不动一天消耗的热量，TDEE 是你实际每天消耗的总热量</text>
      </view>

      <view class="input-card">
        <view class="input-group">
          <text class="input-label">性别</text>
          <view class="gender-toggle">
            <view class="gender-opt" :class="{ active: gender === 'male' }" @tap="gender = 'male'">
              <text class="gender-icon">♂</text>
              <text class="gender-text">男</text>
            </view>
            <view class="gender-opt" :class="{ active: gender === 'female' }" @tap="gender = 'female'">
              <text class="gender-icon">♀</text>
              <text class="gender-text">女</text>
            </view>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">年龄</text>
          <view class="input-field-wrap">
            <input
              class="input-field"
              type="number"
              :value="age"
              @input="age = $event.detail.value"
              placeholder="请输入年龄"
            />
            <text class="input-unit">岁</text>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">身高</text>
          <view class="input-field-wrap">
            <input
              class="input-field"
              type="digit"
              :value="height"
              @input="height = $event.detail.value"
              placeholder="请输入身高"
            />
            <text class="input-unit">cm</text>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">体重</text>
          <view class="input-field-wrap">
            <input
              class="input-field"
              type="digit"
              :value="weight"
              @input="weight = $event.detail.value"
              placeholder="请输入体重"
            />
            <text class="input-unit">kg</text>
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">活动水平</text>
          <view class="activity-list">
            <view
              v-for="al in activityLevels"
              :key="al.value"
              class="activity-item"
              :class="{ active: activityLevel === al.value }"
              @tap="activityLevel = al.value"
            >
              <view class="activity-radio" :class="{ checked: activityLevel === al.value }"></view>
              <view class="activity-info">
                <text class="activity-name">{{ al.label }}</text>
                <text class="activity-desc">{{ al.desc }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="btn-row">
          <view class="btn-primary" @tap="calcMeta">
            <text class="btn-primary-text">立即计算</text>
          </view>
          <view class="btn-secondary" @tap="clearAll">
            <text class="btn-secondary-text">清除</text>
          </view>
        </view>
      </view>

      <!-- 代谢率结果 -->
      <view v-if="metaResult" class="result-card">
        <view class="meta-grid">
          <view class="meta-item">
            <text class="meta-item-label">基础代谢 BMR</text>
            <text class="meta-item-value">{{ metaResult.bmr }}</text>
            <text class="meta-item-unit">kcal / 天</text>
          </view>
          <view class="meta-item highlight">
            <text class="meta-item-label">每日消耗 TDEE</text>
            <text class="meta-item-value">{{ metaResult.tdee }}</text>
            <text class="meta-item-unit">kcal / 天</text>
          </view>
        </view>
        <view class="meta-tips">
          <view class="meta-tip-card lose">
            <text class="meta-tip-title">减脂建议</text>
            <text class="meta-tip-value">{{ metaResult.lose }} kcal</text>
            <text class="meta-tip-desc">每周约减 0.3~0.5 kg</text>
          </view>
          <view class="meta-tip-card gain">
            <text class="meta-tip-title">增肌建议</text>
            <text class="meta-tip-value">{{ metaResult.gain }} kcal</text>
            <text class="meta-tip-desc">配合力量训练效果更佳</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 体脂率 -->
    <view v-if="activeTab === 'bodyfat'" class="calc-content">
      <view class="calc-card">
        <text class="calc-card-title">📊 体脂率计算器</text>
        <text class="calc-card-desc">基于 BMI 公式估算，仅供参考</text>
      </view>

      <view class="input-card">
        <view class="input-group">
          <text class="input-label">性别</text>
          <view class="gender-toggle">
            <view class="gender-opt" :class="{ active: gender === 'male' }" @tap="gender = 'male'">
              <text class="gender-icon">♂</text>
              <text class="gender-text">男</text>
            </view>
            <view class="gender-opt" :class="{ active: gender === 'female' }" @tap="gender = 'female'">
              <text class="gender-icon">♀</text>
              <text class="gender-text">女</text>
            </view>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">年龄</text>
          <view class="input-field-wrap">
            <input
              class="input-field"
              type="number"
              :value="age"
              @input="age = $event.detail.value"
              placeholder="请输入年龄"
            />
            <text class="input-unit">岁</text>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">身高</text>
          <view class="input-field-wrap">
            <input
              class="input-field"
              type="digit"
              :value="height"
              @input="height = $event.detail.value"
              placeholder="请输入身高"
            />
            <text class="input-unit">cm</text>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">体重</text>
          <view class="input-field-wrap">
            <input
              class="input-field"
              type="digit"
              :value="weight"
              @input="weight = $event.detail.value"
              placeholder="请输入体重"
            />
            <text class="input-unit">kg</text>
          </view>
        </view>
        <view class="btn-row">
          <view class="btn-primary" @tap="calcBF">
            <text class="btn-primary-text">立即计算</text>
          </view>
          <view class="btn-secondary" @tap="clearAll">
            <text class="btn-secondary-text">清除</text>
          </view>
        </view>
      </view>

      <!-- 体脂率结果 -->
      <view v-if="bfResult" class="result-card">
        <view class="bf-result-center">
          <view class="bf-circle" :style="{ borderColor: bfResult.color }">
            <text class="bf-value" :style="{ color: bfResult.color }">{{ bfResult.value }}%</text>
            <text class="bf-label">体脂率</text>
          </view>
          <view class="bf-badge" :style="{ background: bfResult.color + '15', borderColor: bfResult.color }">
            <text class="badge-text" :style="{ color: bfResult.color }">{{ bfResult.category }}</text>
          </view>
        </view>
      </view>

      <!-- 体脂率参考 -->
      <view class="ref-card">
        <text class="ref-title">📊 体脂率参考标准</text>
        <view class="ref-table">
          <view class="ref-row header">
            <text class="ref-cell">分类</text>
            <text class="ref-cell">男性</text>
            <text class="ref-cell">女性</text>
          </view>
          <view class="ref-row">
            <text class="ref-cell">偏低</text>
            <text class="ref-cell">< 10%</text>
            <text class="ref-cell">< 18%</text>
          </view>
          <view class="ref-row highlight">
            <text class="ref-cell">正常</text>
            <text class="ref-cell">10~20%</text>
            <text class="ref-cell">18~28%</text>
          </view>
          <view class="ref-row">
            <text class="ref-cell">偏高</text>
            <text class="ref-cell">20~25%</text>
            <text class="ref-cell">28~33%</text>
          </view>
          <view class="ref-row">
            <text class="ref-cell">肥胖</text>
            <text class="ref-cell">> 25%</text>
            <text class="ref-cell">> 33%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="calc-footer">
      <text class="calc-footer-text">计算结果仅供参考，如有健康问题请咨询专业人士</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useBodyStore } from '@/store/body'
import {
  calcBMI,
  calcMetabolism,
  calcBodyFat,
  ACTIVITY_LEVELS,
} from '@/utils/calculator'
import type { Gender, ActivityLevel, BMIResult, MetabolismResult, BodyFatResult } from '@/utils/calculator'

const bodyStore = useBodyStore()

const activeTab = ref<'bmi' | 'metabolism' | 'bodyfat'>('bmi')
const tabs = [
  { key: 'bmi', icon: '⚖️', label: 'BMI' },
  { key: 'metabolism', icon: '🔥', label: '代谢率' },
  { key: 'bodyfat', icon: '📊', label: '体脂率' },
]

const activityLevels = ACTIVITY_LEVELS

const height = ref('')
const weight = ref('')
const gender = ref<Gender>('male')
const age = ref('')
const activityLevel = ref<ActivityLevel>(1.55)

const bmiResult = ref<BMIResult | null>(null)
const metaResult = ref<MetabolismResult | null>(null)
const bfResult = ref<BodyFatResult | null>(null)

onMounted(() => {
  const d = bodyStore.bodyData
  height.value = d.height ? String(d.height) : ''
  weight.value = d.weight ? String(d.weight) : ''
  gender.value = d.gender
  age.value = d.age ? String(d.age) : ''
  activityLevel.value = d.activityLevel
  Taro.setNavigationBarTitle({ title: '健康计算器' })
})

function saveToStore(): void {
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
}

function switchTab(key: string): void {
  activeTab.value = key as typeof activeTab.value
  bmiResult.value = null
  metaResult.value = null
  bfResult.value = null
}

function handleCalcBMI(): void {
  const h = parseFloat(height.value)
  const w = parseFloat(weight.value)
  if (!h || !w) {
    Taro.showToast({ title: '请输入身高和体重', icon: 'none' })
    return
  }
  saveToStore()
  bmiResult.value = calcBMI(h, w)
}

function calcMeta(): void {
  const h = parseFloat(height.value)
  const w = parseFloat(weight.value)
  const a = parseInt(age.value)
  if (!h || !w || !a) {
    Taro.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  saveToStore()
  metaResult.value = calcMetabolism(gender.value, a, h, w, activityLevel.value)
}

function calcBF(): void {
  const h = parseFloat(height.value)
  const w = parseFloat(weight.value)
  const a = parseInt(age.value)
  if (!h || !w || !a) {
    Taro.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  saveToStore()
  bfResult.value = calcBodyFat(gender.value, a, h, w)
}

function clearAll(): void {
  height.value = ''
  weight.value = ''
  age.value = ''
  bmiResult.value = null
  metaResult.value = null
  bfResult.value = null
}
</script>

<style>
.calc-page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: 40px;
}

/* Tabs */
.calc-tabs {
  display: flex;
  background: #fff;
  padding: 12px 16px;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.calc-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 0;
  background: #f5f6f8;
  border-radius: 12px;
  border: 2px solid transparent;
}

.calc-tab.active {
  background: #e8f5e9;
  border-color: #4caf50;
}

.calc-tab-icon {
  font-size: 20px;
  line-height: 1;
}

.calc-tab-label {
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.calc-tab.active .calc-tab-label {
  color: #4caf50;
}

/* Content */
.calc-content {
  padding: 16px;
}

.calc-card {
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.calc-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.calc-card-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

/* Input Card */
.input-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.input-group {
  margin-bottom: 16px;
}

.input-group:last-of-type {
  margin-bottom: 0;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.input-field-wrap {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 0 14px;
  height: 48px;
  border: 1PX solid #eee;
}

.input-field {
  flex: 1;
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 600;
  background: transparent;
  border: none;
  height: 48px;
  line-height: 48px;
}

.input-unit {
  font-size: 13px;
  color: #999;
  margin-left: 8px;
}

/* Gender Toggle */
.gender-toggle {
  display: flex;
  gap: 10px;
}

.gender-opt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px solid #eee;
}

.gender-opt.active {
  background: #e8f5e9;
  border-color: #4caf50;
}

.gender-icon {
  font-size: 18px;
  color: #999;
}

.gender-opt.active .gender-icon {
  color: #4caf50;
}

.gender-text {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.gender-opt.active .gender-text {
  color: #4caf50;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1PX solid #eee;
}

.activity-item.active {
  background: #e8f5e9;
  border-color: #4caf50;
}

.activity-radio {
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border: 2px solid #ddd;
  flex-shrink: 0;
}

.activity-radio.checked {
  border-color: #4caf50;
  background: #4caf50;
  box-shadow: inset 0 0 0 3px #fff;
}

.activity-info {
  flex: 1;
}

.activity-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.activity-desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

/* Buttons */
.btn-row {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  flex: 2;
  height: 48px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-primary-text {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.btn-secondary {
  flex: 1;
  height: 48px;
  background: #f5f6f8;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1PX solid #eee;
}

.btn-secondary-text {
  font-size: 14px;
  color: #999;
  font-weight: 600;
}

/* Result Card */
.result-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-label {
  font-size: 14px;
  color: #666;
}

.result-value {
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
}

.result-bar-wrap {
  margin-bottom: 16px;
}

.result-bar-bg {
  height: 10px;
  background: linear-gradient(90deg, #2196f3 0%, #4caf50 30%, #ff9800 65%, #f44336 100%);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 6px;
}

.result-bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  transition: width 0.5s;
}

.result-bar-labels {
  display: flex;
  justify-content: space-between;
}

.bar-label {
  font-size: 10px;
  color: #999;
}

.result-badge {
  display: inline-flex;
  padding: 8px 24px;
  border-radius: 20px;
  border: 1PX solid;
}

.badge-text {
  font-size: 15px;
  font-weight: 700;
}

/* Metabolism Result */
.meta-grid {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.meta-item {
  flex: 1;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
}

.meta-item.highlight {
  background: #e8f5e9;
}

.meta-item-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 8px;
}

.meta-item-value {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1;
}

.meta-item.highlight .meta-item-value {
  color: #4caf50;
}

.meta-item-unit {
  font-size: 10px;
  color: #bbb;
  margin-top: 4px;
}

.meta-tips {
  display: flex;
  gap: 10px;
}

.meta-tip-card {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  text-align: center;
}

.meta-tip-card.lose {
  background: #e3f2fd;
}

.meta-tip-card.gain {
  background: #fff3e0;
}

.meta-tip-title {
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;
}

.meta-tip-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.meta-tip-desc {
  font-size: 10px;
  color: #999;
}

/* Body Fat Result */
.bf-result-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.bf-circle {
  width: 140px;
  height: 140px;
  border-radius: 70px;
  border: 4PX solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.bf-value {
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
}

.bf-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.bf-badge {
  display: inline-flex;
  padding: 8px 24px;
  border-radius: 20px;
  border: 1PX solid;
}

/* Reference Card */
.ref-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ref-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.ref-table {
  border: 1PX solid #eee;
  border-radius: 10px;
  overflow: hidden;
}

.ref-row {
  display: flex;
  border-bottom: 1PX solid #f0f0f0;
}

.ref-row:last-child {
  border-bottom: none;
}

.ref-row.header {
  background: #f8f9fa;
}

.ref-row.highlight {
  background: #f0fdf0;
}

.ref-cell {
  flex: 1;
  padding: 10px 12px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.ref-row.header .ref-cell {
  font-weight: 700;
  color: #333;
}

/* Footer */
.calc-footer {
  padding: 20px 16px;
  text-align: center;
}

.calc-footer-text {
  font-size: 11px;
  color: #ccc;
}
</style>
