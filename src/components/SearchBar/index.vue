<template>
  <view class="search-bar">
    <view class="search-input-wrap">
      <view class="search-icon-box">
        <text class="search-icon">&#x1F50D;</text>
      </view>
      <input
        class="search-input"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        confirm-type="search"
        @input="handleInput"
        @confirm="handleConfirm"
      />
      <view v-if="modelValue" class="clear-btn" @tap="handleClear">
        <text class="clear-icon">&#x2715;</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索动作、肌群、器械...',
})

const emit = defineEmits<Emits>()

function handleInput(e: { detail: { value: string } }): void {
  emit('update:modelValue', e.detail.value)
}

function handleConfirm(): void {
  emit('search', props.modelValue)
}

function handleClear(): void {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style>
.search-bar {
  padding: 12px 16px 8px;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24px;
  padding: 0 16px;
  height: 44px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1PX solid #f0f0f0;
}

.search-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 10px;
}

.search-icon {
  font-size: 15px;
  line-height: 1;
}

.search-input {
  flex: 1;
  font-size: 14px;
  color: #1a1a1a;
  background: transparent;
  border: none;
  outline: none;
  height: 44px;
  line-height: 44px;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #e8e8e8;
  flex-shrink: 0;
  margin-left: 8px;
}

.clear-icon {
  font-size: 10px;
  color: #999;
  line-height: 1;
}
</style>
