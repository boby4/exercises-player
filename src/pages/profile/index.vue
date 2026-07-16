<template>
  <view class="profile-page">
    <!-- 统计卡片 -->
    <view class="stats-hero">
      <view class="stats-row">
        <view class="stat-box">
          <text class="stat-num">{{ recordStore.totalRecords }}</text>
          <text class="stat-label">训练次数</text>
        </view>
        <view class="stat-box">
          <text class="stat-num">{{ totalMinutes }}</text>
          <text class="stat-label">总时长(分钟)</text>
        </view>
        <view class="stat-box">
          <text class="stat-num">{{ favoriteStore.count }}</text>
          <text class="stat-label">收藏动作</text>
        </view>
      </view>
    </view>

    <!-- 最近训练记录 -->
    <view class="section">
      <text class="section-title">最近训练</text>
      <view v-if="recordStore.recentRecords.length > 0" class="record-list">
        <view v-for="record in recordStore.recentRecords" :key="record.id" class="record-card">
          <view class="record-left">
            <view class="record-date-badge">
              <text class="record-day">{{ getDay(record.date) }}</text>
              <text class="record-month">{{ getMonth(record.date) }}</text>
            </view>
          </view>
          <view class="record-info">
            <text class="record-title">{{ record.exerciseIds.length }} 个动作</text>
            <text class="record-duration">{{ formatDuration(record.duration) }}</text>
          </view>
          <view class="record-delete" @tap="deleteRecord(record.id)">
            <IconFont name="icon-bushui" :size="16" class="delete-icon" />
          </view>
        </view>
      </view>
      <view v-else class="empty-records">
        <IconFont name="icon-tice" :size="48" class="empty-icon" />
        <text class="empty-text">暂无训练记录</text>
      </view>
    </view>

    <!-- 设置项 -->
    <view class="section">
      <text class="section-title">设置</text>
      <view class="settings-list">
        <view class="setting-item" @tap="showAbout">
          <text class="setting-label">关于</text>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @tap="clearAllData">
          <text class="setting-label danger">清除所有数据</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import IconFont from '@/components/IconFont/index.vue'
import { useRecordStore } from '@/store/record'
import { useFavoriteStore } from '@/store/favorite'

const recordStore = useRecordStore()
const favoriteStore = useFavoriteStore()

const totalMinutes = computed(() => {
  return Math.round(recordStore.totalDuration / 60)
})

function getDay(dateStr: string): string {
  const date = new Date(dateStr)
  return date.getDate().toString()
}

function getMonth(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const date = new Date(dateStr)
  return months[date.getMonth()]
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}秒`
  return `${mins}分${secs}秒`
}

function deleteRecord(id: string): void {
  Taro.showModal({
    title: '确认删除',
    content: '确定要删除这条训练记录吗？',
    success: (res) => {
      if (res.confirm) {
        recordStore.deleteRecord(id)
      }
    },
  })
}

function showAbout(): void {
  Taro.showModal({
    title: 'ExercisesPlayer',
    content: '离线健身动作库 v1.0.0\n包含 1,324 个健身动作\n数据来源：exercises-dataset',
    showCancel: false,
  })
}

function clearAllData(): void {
  Taro.showModal({
    title: '清除所有数据',
    content: '此操作将清除所有收藏、训练计划和训练记录，不可恢复！',
    success: (res) => {
      if (res.confirm) {
        Taro.clearStorageSync()
        Taro.showToast({ title: '已清除', icon: 'success' })
        Taro.reLaunch({ url: '/pages/index/index' })
      }
    },
  })
}
</script>

<style>
.profile-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.stats-hero {
  padding: 24px 16px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #4caf50;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

.section {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-card {
  display: flex;
  align-items: center;
  padding: 14px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.record-date-badge {
  width: 48px;
  height: 48px;
  background: #e8f5e9;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.record-day {
  font-size: 16px;
  font-weight: 700;
  color: #4caf50;
  line-height: 1;
}

.record-month {
  font-size: 9px;
  color: #4caf50;
  margin-top: 2px;
}

.record-info {
  flex: 1;
  margin-left: 12px;
}

.record-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.record-duration {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.record-delete {
  padding: 6px;
}

.delete-icon {
  font-size: 16px;
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.settings-list {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #333;
}

.setting-label.danger {
  color: #ff4444;
}

.setting-arrow {
  font-size: 18px;
  color: #ccc;
}
</style>
