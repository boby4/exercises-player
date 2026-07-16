<template>
  <text class="iconfont icon-text" :class="iconClass" :style="iconStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string  // 图标类名，如 'icon-dumbbell'
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
})

// 图标类名
const iconClass = computed(() => {
  // 如果传入的是完整的 icon-xxx 格式，直接使用
  // 否则添加 icon- 前缀
  return props.name.startsWith('icon-') ? props.name : `icon-${props.name}`
})

// 图标样式
const iconStyle = computed(() => {
  const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
  return {
    fontSize: sizeValue,
    width: sizeValue,
    height: sizeValue,
  }
})
</script>

<style scoped>
.icon-text {
  font-family: 'iconfont' !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
