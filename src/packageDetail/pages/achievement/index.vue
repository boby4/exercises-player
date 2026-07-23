<template>
  <view class="achievement-page">
    <!-- 顶部等级卡片 -->
    <view class="level-card">
      <view class="level-bg"></view>
      <view class="level-content">
        <view class="level-left">
          <view class="level-icon-wrap" :style="{ background: currentLevel.bgColor }">
            <text class="level-icon">{{ currentLevel.icon }}</text>
          </view>
          <view class="level-info">
            <text class="level-name">{{ currentLevel.name }}</text>
            <text class="level-desc">{{ currentLevel.description }}</text>
          </view>
        </view>
        <view class="level-right">
          <view class="level-stats">
            <view class="stat-item">
              <text class="stat-num">{{ userStats.trainCount }}</text>
              <text class="stat-label">训练次数</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-num">{{ totalDurationText }}</text>
              <text class="stat-label">训练时长</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 等级进度 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-wrap">
          <text class="section-title">等级进度</text>
          <view class="help-icon" @tap="showLevelGuide">
            <text class="help-text">?</text>
          </view>
        </view>
        <text class="section-subtitle">{{ unlockedCount }}/{{ totalCount }} 已解锁</text>
      </view>
      <view class="level-list">
        <view 
          v-for="level in levelAchievements" 
          :key="level.id"
          class="level-item"
          :class="{ unlocked: level.unlocked, current: level.id === currentLevel.id }"
        >
          <view class="level-item-icon" :style="{ background: level.unlocked ? level.color : '#f0f0f0' }">
            <text class="level-item-emoji">{{ level.icon }}</text>
          </view>
          <view class="level-item-info">
            <text class="level-item-name" :style="{ color: level.unlocked ? '#333' : '#999' }">
              {{ level.name }}
            </text>
            <view class="level-item-progress">
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: getProgressPercent(level) + '%', background: level.color }"
                ></view>
              </view>
              <text class="progress-text">{{ level.progress.current }}/{{ level.progress.target }}</text>
            </view>
          </view>
          <view v-if="level.id === currentLevel.id" class="current-badge">
            <text class="current-badge-text">当前</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 成就徽章 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">成就徽章</text>
      </view>
      <view class="badge-grid">
        <view 
          v-for="badge in badgeAchievements" 
          :key="badge.id"
          class="badge-item"
          :class="{ unlocked: badge.unlocked }"
        >
          <view class="badge-icon-wrap" :style="{ background: badge.unlocked ? badge.bgColor : '#f5f5f5' }">
            <text class="badge-icon">{{ badge.icon }}</text>
          </view>
          <text class="badge-name">{{ badge.name }}</text>
          <text class="badge-desc">{{ badge.description }}</text>
          <view v-if="badge.unlocked" class="badge-check">
            <text class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 等级说明弹窗 -->
    <view v-if="showGuide" class="guide-overlay" @tap="showGuide = false">
      <view class="guide-popup" @tap.stop>
        <view class="guide-header">
          <text class="guide-title">等级说明</text>
          <view class="guide-close" @tap="showGuide = false">
            <text class="close-x">×</text>
          </view>
        </view>
        <view class="guide-list">
          <view class="guide-item">
            <text class="guide-emoji">🌱</text>
            <view class="guide-info">
              <text class="guide-name">新手入门</text>
              <text class="guide-rule">训练 小于 10次 或 时长 小于 1小时</text>
            </view>
          </view>
          <view class="guide-item">
            <text class="guide-emoji">💪</text>
            <view class="guide-info">
              <text class="guide-name">初级健身者</text>
              <text class="guide-rule">训练 10-30次 且 时长 1-5小时</text>
            </view>
          </view>
          <view class="guide-item">
            <text class="guide-emoji">🏆</text>
            <view class="guide-info">
              <text class="guide-name">健身达人</text>
              <text class="guide-rule">训练 30-80次 且 时长 5-20小时</text>
            </view>
          </view>
          <view class="guide-item">
            <text class="guide-emoji">⭐</text>
            <view class="guide-info">
              <text class="guide-name">健身专家</text>
              <text class="guide-rule">训练 80-200次 且 时长 20-50小时</text>
            </view>
          </view>
          <view class="guide-item">
            <text class="guide-emoji">👑</text>
            <view class="guide-info">
              <text class="guide-name">健身大师</text>
              <text class="guide-rule">训练 200+次 且 时长 50+小时</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDidShow } from '@tarojs/taro'
import { useAchievementStore } from '@/store/achievement'
import { useRecordStore } from '@/store/record'

const achievementStore = useAchievementStore()
const recordStore = useRecordStore()
const showGuide = ref(false)

const userStats = computed(() => achievementStore.userStats)
const currentLevel = computed(() => achievementStore.currentLevel)
const levelAchievements = computed(() => achievementStore.levelAchievements)
const badgeAchievements = computed(() => achievementStore.badgeAchievements)
const unlockedCount = computed(() => achievementStore.unlockedCount)
const totalCount = computed(() => achievementStore.totalCount)

// 与个人中心保持一致的时长格式
const totalDurationText = computed(() => {
  const seconds = recordStore.totalDuration
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${minutes}分`
  return `${minutes}'${secs}"`
})

function getProgressPercent(level: any): number {
  if (level.progress.target === 0) return 0
  return Math.min(Math.round((level.progress.current / level.progress.target) * 100), 100)
}

function showLevelGuide(): void {
  showGuide.value = true
}

useDidShow(() => {
  achievementStore.syncFromCloud()
  achievementStore.checkAchievements()
})
</script>

<style>
.achievement-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 32px;
}

/* 等级卡片 */
.level-card {
  position: relative;
  margin: 16px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.level-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.level-content {
  position: relative;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.level-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.level-icon {
  font-size: 28px;
}

.level-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.level-name {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.level-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.level-right {
  flex-shrink: 0;
}

.level-stats {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px 14px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
}

.stat-num {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
  white-space: nowrap;
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}

/* 通用区块 */
.section {
  margin: 24px 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title-wrap {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.help-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.help-text {
  font-size: 12px;
  font-weight: 700;
  color: #999;
}

.section-subtitle {
  font-size: 13px;
  color: #999;
}

/* 等级列表 */
.level-list {
  background: #fff;
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.level-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 4px;
}

.level-item:last-child {
  margin-bottom: 0;
}

.level-item.current {
  background: #f8f9fa;
}

.level-item-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.level-item-emoji {
  font-size: 24px;
}

.level-item-info {
  flex: 1;
  min-width: 0;
}

.level-item-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.level-item-progress {
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-right: 12px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  width: 0;
}

.progress-text {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.current-badge {
  background: #4caf50;
  padding: 4px 10px;
  border-radius: 8px;
  margin-left: 12px;
}

.current-badge-text {
  font-size: 11px;
  color: #fff;
  font-weight: 600;
}

/* 徽章网格 */
.badge-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -6px;
}

.badge-item {
  width: calc(33.333% - 12px);
  margin: 6px;
  background: #fff;
  border-radius: 20px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  position: relative;
}

.badge-item.unlocked {
  background: linear-gradient(135deg, #fff 0%, #f8fff8 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.badge-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.badge-icon {
  font-size: 28px;
}

.badge-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  text-align: center;
}

.badge-desc {
  font-size: 11px;
  color: #999;
  text-align: center;
}

.badge-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  font-size: 10px;
  color: #fff;
  font-weight: bold;
}

/* 等级说明弹窗 */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-popup {
  width: 300px;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.guide-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.guide-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-x {
  font-size: 18px;
  color: #999;
}

.guide-list {
  display: flex;
  flex-direction: column;
}

.guide-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.guide-item:last-child {
  border-bottom: none;
}

.guide-emoji {
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.guide-info {
  display: flex;
  flex-direction: column;
}

.guide-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.guide-rule {
  font-size: 12px;
  color: #999;
}
</style>
