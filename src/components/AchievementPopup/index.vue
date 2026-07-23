<template>
  <view v-if="show" class="achievement-toast" :class="{ show: isVisible }">
    <view class="toast-content">
      <view class="toast-icon">
        <text class="icon-emoji">{{ achievement?.icon }}</text>
      </view>
      <view class="toast-info">
        <text class="toast-label">成就达成！</text>
        <text class="toast-name">{{ achievement?.name }}</text>
      </view>
      <view class="toast-close" @tap.stop="handleClose">
        <text class="close-icon">×</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAchievementStore } from '@/store/achievement'
import type { AchievementDef } from '@/store/achievement'

const achievementStore = useAchievementStore()
const show = ref(false)
const isVisible = ref(false)
const achievement = ref<AchievementDef | null>(null)

let hideTimer: ReturnType<typeof setTimeout> | null = null

watch(() => achievementStore.showAnimation, (newVal) => {
  if (newVal && achievementStore.currentAchievement) {
    achievement.value = achievementStore.currentAchievement
    show.value = true
    
    // 弹出动画
    setTimeout(() => {
      isVisible.value = true
    }, 50)
    
    // 3秒后自动关闭
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      handleClose()
    }, 3000)
  } else {
    handleClose()
  }
})

function handleClose(): void {
  isVisible.value = false
  setTimeout(() => {
    show.value = false
    achievement.value = null
    achievementStore.hideAnimation()
  }, 400)
}
</script>

<style>
.achievement-toast {
  position: fixed;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: calc(100% - 32px);
  max-width: 360px;
  transition: top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.achievement-toast.show {
  top: 60px;
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(76, 175, 80, 0.2);
  position: relative;
  overflow: hidden;
}

.toast-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.1), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.toast-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  animation: icon-pulse 0.6s ease-out;
}

@keyframes icon-pulse {
  0% { transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(10deg); }
  70% { transform: scale(0.9) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.icon-emoji {
  font-size: 24px;
}

.toast-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-label {
  font-size: 11px;
  color: #4caf50;
  font-weight: 600;
  letter-spacing: 2px;
}

.toast-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.toast-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  flex-shrink: 0;
}

.close-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1;
}
</style>
