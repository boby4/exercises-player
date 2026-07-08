<template>
  <view class="tag-wrap" :class="{ active: selected }" @tap="handleTap">
    <text class="tag-label">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  label: string
  selected?: boolean
}

interface Emits {
  (e: 'tap'): void
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
})

const emit = defineEmits<Emits>()

function handleTap(): void {
  emit('tap')
}
</script>

<style scoped>
.tag-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 20px;
  background: #f5f5f5;
  border: 1PX solid transparent;
  flex-shrink: 0;
}

.tag-wrap.active {
  background: #e8f5e9;
  border-color: #4caf50;
}

.tag-label {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
  white-space: nowrap;
}

.tag-wrap.active .tag-label {
  color: #4caf50;
  font-weight: 600;
}
</style>
