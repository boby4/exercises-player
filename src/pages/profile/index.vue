<template>
  <view class="profile-page">
    <!-- 顶部头像区域 -->
    <view class="profile-header">
      <view class="header-bg" />
      <view class="header-content">
        <view class="profile-info">
          <view class="avatar-wrap">
            <view class="avatar">
              <text class="avatar-text">EP</text>
            </view>
          </view>
          <view class="profile-text">
            <text class="profile-title">ExercisesPlayer</text>
            <text class="profile-desc">你的专属健身搭子</text>
            <view class="profile-badge">
              <IconFont name="icon-jirounan" :size="12" class="badge-icon" />
              <text class="badge-text">健身达人</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 4宫格统计卡片 -->
    <view class="stats-section">
      <view class="stats-grid">
        <view class="stat-card" @tap="goRecords">
          <view class="stat-icon-wrap" style="background: rgba(76, 175, 80, 0.1)">
            <IconFont name="icon-jishiqi" :size="24" style="color: #4caf50" />
          </view>
          <text class="stat-num">{{ recordStore.totalRecords }}</text>
          <text class="stat-label">训练次数</text>
        </view>
        <view class="stat-card">
          <view class="stat-icon-wrap" style="background: rgba(33, 150, 243, 0.1)">
            <IconFont name="icon-paobu" :size="24" style="color: #2196f3" />
          </view>
          <text class="stat-num">{{ totalDurationText }}</text>
          <text class="stat-label">训练时长</text>
        </view>
        <view class="stat-card" @tap="goFavorites">
          <view class="stat-icon-wrap" style="background: rgba(244, 67, 54, 0.1)">
            <IconFont name="icon-shoushen" :size="24" style="color: #f44336" />
          </view>
          <text class="stat-num">{{ favoriteStore.count }}</text>
          <text class="stat-label">收藏动作</text>
        </view>
        <view class="stat-card" @tap="goPlans">
          <view class="stat-icon-wrap" style="background: rgba(255, 152, 0, 0.1)">
            <IconFont name="icon-jianshenbao" :size="24" style="color: #ff9800" />
          </view>
          <text class="stat-num">{{ planStore.planCount }}</text>
          <text class="stat-label">我的计划</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="section">
      <text class="section-title">功能服务</text>
      <view class="entry-cards">
        <view class="entry-card" @tap="goGenerator">
          <view class="entry-icon-box" style="background: #fff8e1">
            <IconFont name="icon-jianshenbao" :size="20" style="color: #ff9800" />
          </view>
          <view class="entry-info">
            <view class="entry-title">智能生成计划</view>
            <view class="entry-desc">一键生成专属训练计划</view>
          </view>
          <text class="entry-arrow">›</text>
        </view>
        <view class="entry-card" @tap="goCalculator">
          <view class="entry-icon-box" style="background: #fff3e0">
            <IconFont name="icon-chengzhong" :size="20" style="color: #ff9800" />
          </view>
          <view class="entry-info">
            <view class="entry-title">健康计算器</view>
            <view class="entry-desc">BMI · 代谢率 · 体脂率</view>
          </view>
          <text class="entry-arrow">›</text>
        </view>
        <view class="entry-card" @tap="goAbout">
          <view class="entry-icon-box" style="background: #e3f2fd">
            <IconFont name="icon-jiankangshipin" :size="20" style="color: #2196f3" />
          </view>
          <view class="entry-info">
            <view class="entry-title">关于我们</view>
            <view class="entry-desc">版本信息 · 核心功能</view>
          </view>
          <text class="entry-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 清除数据 -->
    <view class="clear-section">
      <view class="clear-btn1" @tap="clearAllData">
        <IconFont name="icon-bushui" :size="16" class="clear-icon" />
        <text class="clear-text">清除本地缓存</text>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import IconFont from '@/components/IconFont/index.vue'
import { useRecordStore } from '@/store/record'
import { useFavoriteStore } from '@/store/favorite'
import { usePlanStore } from '@/store/plan'
import { useShare } from '@/hooks/useShare'

const recordStore = useRecordStore()
const favoriteStore = useFavoriteStore()
const planStore = usePlanStore()

useShare({
  title: '我的健身数据 - ExercisesPlayer',
  path: '/pages/profile/index',
})

// 页面显示时从云端同步数据
useDidShow(() => {
  recordStore.syncFromCloud()
  favoriteStore.syncFromCloud()
  planStore.syncFromCloud()
})

const totalDurationText = computed(() => {
  const seconds = recordStore.totalDuration
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${minutes}分`
  return `${minutes}'${secs}"`
})

const totalMinutes = computed(() => {
  return Math.round(recordStore.totalDuration / 60)
})

function goRecords(): void {
  // 暂时隐藏训练记录
}

function goFavorites(): void {
  Taro.switchTab({ url: '/pages/favorites/index' })
}

function goPlans(): void {
  Taro.switchTab({ url: '/pages/plan/index' })
}

function goCalculator(): void {
  Taro.navigateTo({ url: '/packageDetail/pages/calculator/index' })
}

function goAbout(): void {
  Taro.navigateTo({ url: '/packageDetail/pages/about/index' })
}

function goGenerator(): void {
  Taro.navigateTo({ url: '/packageDetail/pages/generator/index' })
}

function clearAllData(): void {
  Taro.showModal({
    title: '清除所有数据',
    content: '此操作将清除本地所有收藏、训练计划和训练记录，云端数据将保留！',
    success: async (res) => {
      if (res.confirm) {
        Taro.clearStorageSync()
        // 先重置 store 内存状态
        recordStore.reset()
        favoriteStore.reset()
        planStore.reset()
        // 再从云端同步数据
        await Promise.all([
          recordStore.syncFromCloud(),
          favoriteStore.syncFromCloud(),
          planStore.syncFromCloud(),
        ])
        console.log('同步后训练记录数:', recordStore.totalRecords)
        console.log('同步后训练时长:', recordStore.totalDuration)
        Taro.showToast({ title: `已清除，同步到${recordStore.totalRecords}条记录`, icon: 'success' })
      }
    },
  })
}
</script>

<style>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 32px;
}

/* 顶部头像区域 */
.profile-header {
  position: relative;
  padding: 0 0 32px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3d3d3d 100%);
  border-radius: 0 0 32px 32px;
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 40px 24px 0;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrap {
  flex-shrink: 0;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.avatar-text {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2px;
}

.profile-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.profile-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.profile-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(76, 175, 80, 0.15);
  border-radius: 20px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  width: fit-content;
}

.badge-icon {
  color: #4caf50;
}

.badge-text {
  font-size: 12px;
  font-weight: 600;
  color: #4caf50;
}

/* 统计卡片 */
.stats-section {
  padding: 0 16px;
  margin-top: -24px;
  position: relative;
  z-index: 2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background: #fff;
  border-radius: 20px;
  padding: 20px 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-num {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1a;
}

.stat-label {
  font-size: 11px;
  color: #666;
  text-align: center;
}

/* 功能入口 */
.section {
  padding: 24px 16px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-left: 4px;
}

.entry-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-card {
  display: flex;
  align-items: center;
  padding: 18px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.entry-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.entry-info {
  flex: 1;
  margin-left: 14px;
}

.entry-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.entry-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.entry-arrow {
  font-size: 24px;
  color: #ccc;
  flex-shrink: 0;
  font-weight: 300;
}

/* 清除数据 */
.clear-section {
  padding: 40px 16px 32px;
  display: flex;
  justify-content: center;
}

.clear-btn1 {
  width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 24px;
  border: 1px solid #eee;
}

.clear-icon {
  color: #999;
}

.clear-text {
  font-size: 14px;
  font-weight: 500;
  color: #999;
}
</style>
