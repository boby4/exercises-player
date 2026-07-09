<template>
  <view class="muscle-card" @tap="handleTap">
    <view class="muscle-icon-wrap" :style="{ background: bgColor }">
      <text class="muscle-icon">{{ icon }}</text>
    </view>
    <view class="muscle-info">
      <text class="muscle-name">{{ label }}</text>
      <text class="muscle-count">{{ count }} 个动作</text>
    </view>
    <text class="arrow">›</text>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { useExerciseStore } from '@/store/exercise'

interface Props {
  label: string
  value: string
  count: number
  icon?: string
  type?: 'bodyPart' | 'equipment' | 'target'
}

const props = withDefaults(defineProps<Props>(), {
  icon: '💪',
  type: 'bodyPart',
})

const BG_COLORS: Record<string, string> = {
  'upper arms': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
  'upper legs': 'linear-gradient(135deg, #4ECDC4 0%, #44CF6C 100%)',
  back: 'linear-gradient(135deg, #45B7D1 0%, #96C93D 100%)',
  waist: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)',
  chest: 'linear-gradient(135deg, #A770EF 0%, #CF8BF3 100%)',
  shoulders: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  'lower legs': 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
  'lower arms': 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
  cardio: 'linear-gradient(135deg, #FF0844 0%, #FFB199 100%)',
  neck: 'linear-gradient(135deg, #96E6A1 0%, #D4FC79 100%)',
}

const ICONS: Record<string, string> = {
  'upper arms': '💪',
  'upper legs': '🦵',
  back: '🔙',
  waist: '🎯',
  chest: '🏋️',
  shoulders: '🤸',
  'lower legs': '🦿',
  'lower arms': '✊',
  cardio: '❤️',
  neck: '🧘',
}

const bgColor = BG_COLORS[props.value] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
const icon = ICONS[props.value] || props.icon

const exerciseStore = useExerciseStore()

function handleTap(): void {
  exerciseStore.setPendingFilter(props.type, props.value)
  Taro.switchTab({ url: '/pages/search/index' })
}
</script>

<style>
.muscle-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.muscle-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.muscle-icon {
  font-size: 24px;
  line-height: 1;
}

.muscle-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.muscle-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.muscle-count {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  line-height: 1.2;
}

.arrow {
  font-size: 20px;
  color: #ccc;
  line-height: 1;
}
</style>
