<template>
  <view class="page">
    <!-- 创建计划按钮 -->
    <view class="create-section">
      <view class="create-btn" @tap="showCreateModal = true">
        <text class="create-icon">+</text>
        <text class="create-text">创建训练计划</text>
      </view>
    </view>

    <!-- 计划类型选择 -->
    <scroll-view scroll-x class="type-scroll">
      <view class="type-inner">
        <view class="type-list">
          <view
            v-for="pt in planTypes"
            :key="pt.key"
            class="type-chip"
            :class="{ active: selectedType === pt.key }"
            @tap="selectType(pt.key)"
          >
            <text class="type-icon">{{ pt.icon }}</text>
            <text class="type-label">{{ pt.label }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 计划列表 -->
    <view v-if="filteredPlans.length > 0" class="plan-list">
      <view v-for="plan in filteredPlans" :key="plan.id" class="plan-card" @tap="openPlan(plan.id)">
        <view class="plan-accent" :class="'accent-' + plan.type"></view>
        <view class="plan-body">
          <view class="plan-row1">
            <text class="plan-name">{{ plan.name }}</text>
            <view class="plan-type-badge">
              <text class="plan-type-icon">{{ getTypeIcon(plan.type) }}</text>
              <text class="plan-type-text">{{ getTypeLabel(plan.type) }}</text>
            </view>
          </view>
          <view class="plan-row2">
            <text class="plan-count">{{ plan.exerciseIds.length }} 个动作</text>
            <text class="plan-sep">·</text>
            <text class="plan-date">{{ formatDate(plan.updatedAt) }}</text>
            <view
              class="plan-status"
              :class="getPlanRecordInfo(plan.id).count > 0 ? 'status-trained' : 'status-new'"
            >
              <text class="plan-status-text">
                {{ getPlanRecordInfo(plan.id).count > 0 ? '已练' + getPlanRecordInfo(plan.id).count + '次' : '未开始' }}
              </text>
            </view>
          </view>
          <view v-if="plan.exerciseIds.length > 0" class="plan-chips">
            <view
              v-for="exId in plan.exerciseIds.slice(0, 3)"
              :key="exId"
              class="plan-exercise-chip"
            >
              <text class="plan-exercise-name">{{ getExerciseName(exId) }}</text>
            </view>
            <view v-if="plan.exerciseIds.length > 3" class="plan-exercise-chip more-chip">
              <text class="more-text">+{{ plan.exerciseIds.length - 3 }}</text>
            </view>
          </view>
          <view class="plan-footer">
            <view class="action-btn start-btn" @tap.stop="startPlanTraining(plan.id)">
              <text class="action-label">&#x25B6; 开始训练</text>
            </view>
            <view class="action-btn del-btn" @tap.stop="deletePlan(plan.id)">
              <text class="del-label">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-title">暂无训练计划</text>
      <text class="empty-desc">创建一个计划开始你的训练之旅</text>
    </view>

    <!-- 创建弹窗 -->
    <view v-if="showCreateModal" class="modal-overlay" @tap="showCreateModal = false">
      <view class="modal-content" @tap.stop>
        <!-- 头部 -->
        <view class="modal-header">
          <text class="modal-title">创建训练计划</text>
          <view class="modal-close" @tap="showCreateModal = false">
            <text class="modal-close-icon">&#x2715;</text>
          </view>
        </view>

        <!-- 名称 -->
        <view class="modal-section">
          <text class="modal-label">计划名称</text>
          <input
            class="modal-input"
            v-model="newPlanName"
            placeholder="如：胸部强化日、腿部力量训练..."
          />
        </view>

        <!-- 类型 -->
        <view class="modal-section">
          <text class="modal-label">训练类型</text>
          <view class="modal-type-grid">
            <view
              v-for="pt in planTypes"
              :key="pt.key"
              class="modal-type-chip"
              :class="{ active: newPlanType === pt.key }"
              @tap="newPlanType = pt.key"
            >
              <text class="modal-type-icon">{{ pt.icon }}</text>
              <text class="modal-type-label">{{ pt.label }}</text>
            </view>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="modal-actions">
          <view class="modal-cancel" @tap="showCreateModal = false">
            <text class="modal-cancel-text">取消</text>
          </view>
          <view class="modal-confirm" @tap="createPlan">
            <text class="modal-confirm-text">创建计划</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Taro from '@tarojs/taro'
import { usePlanStore } from '@/store/plan'
import { useRecordStore } from '@/store/record'
import { getExerciseById } from '@/utils/data'
import { PLAN_TYPE_LABELS } from '@/types/exercise'
import type { PlanType } from '@/types/exercise'

const planStore = usePlanStore()
const recordStore = useRecordStore()
const showCreateModal = ref(false)
const newPlanName = ref('')
const newPlanType = ref<PlanType>('push')
const selectedType = ref('')

watch(showCreateModal, (val) => {
  if (val) {
    Taro.hideTabBar({ animation: false })
  } else {
    Taro.showTabBar({ animation: false })
  }
})

const planTypes: Array<{ key: PlanType; label: string; icon: string }> = [
  { key: 'push', label: 'Push', icon: '💪' },
  { key: 'pull', label: 'Pull', icon: '🏋️' },
  { key: 'leg', label: 'Leg', icon: '🦵' },
  { key: 'upper', label: 'Upper', icon: '⬆️' },
  { key: 'lower', label: 'Lower', icon: '⬇️' },
  { key: 'fullbody', label: 'Full Body', icon: '🔥' },
  { key: 'custom', label: '自定义', icon: '✨' },
]

const filteredPlans = computed(() => {
  if (!selectedType.value) return planStore.plans
  return planStore.plans.filter((p) => p.type === selectedType.value)
})

function getTypeLabel(type: PlanType): string {
  return PLAN_TYPE_LABELS[type] || type
}

function getTypeIcon(type: PlanType): string {
  const found = planTypes.find((pt) => pt.key === type)
  return found?.icon || '✨'
}

function getExerciseName(id: string): string {
  const ex = getExerciseById(id)
  return ex?.name || '未知动作'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function getPlanRecordInfo(planId: string): { count: number; lastDate: string } {
  const matched = recordStore.records.filter((r) => r.planId === planId)
  if (matched.length === 0) return { count: 0, lastDate: '' }
  return {
    count: matched.length,
    lastDate: matched[0].completedAt ? matched[0].completedAt.split('T')[0] : '',
  }
}

function selectType(type: string): void {
  selectedType.value = selectedType.value === type ? '' : type
}

function createPlan(): void {
  if (!newPlanName.value.trim()) {
    Taro.showToast({ title: '请输入计划名称', icon: 'none' })
    return
  }
  planStore.createPlan(newPlanName.value.trim(), newPlanType.value)
  newPlanName.value = ''
  newPlanType.value = 'push'
  showCreateModal.value = false
  Taro.showToast({ title: '创建成功', icon: 'success' })
}

function openPlan(planId: string): void {
  Taro.navigateTo({ url: `/packageDetail/pages/planDetail/index?planId=${planId}` })
}

function startPlanTraining(planId: string): void {
  const plan = planStore.getPlanById(planId)
  if (plan && plan.exerciseIds.length > 0) {
    Taro.navigateTo({ url: `/packageDetail/pages/training/index?id=${plan.exerciseIds[0]}&planId=${planId}` })
  } else {
    Taro.showToast({ title: '请先添加动作', icon: 'none' })
  }
}

function deletePlan(planId: string): void {
  Taro.showModal({
    title: '确认删除',
    content: '确定要删除这个训练计划吗？',
    success: (res) => {
      if (res.confirm) {
        planStore.deletePlan(planId)
        Taro.showToast({ title: '已删除', icon: 'success' })
      }
    },
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: 20px;
}

.create-section {
  padding: 16px 16px 12px;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.create-icon {
  font-size: 18px;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

.create-text {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.type-scroll {
  white-space: nowrap;
  margin-bottom: 12px;
}

.type-inner {
  padding: 0 16px;
}

.type-list {
  display: inline-flex;
  gap: 8px;
  padding-right: 16px;
}

.type-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 12px;
  border: 1PX solid #eee;
  flex-shrink: 0;
  min-width: 56px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.type-chip.active {
  border-color: #4caf50;
  background: #e8f5e9;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.15);
}

.type-icon {
  font-size: 18px;
  margin-bottom: 3px;
  line-height: 1;
}

.type-label {
  font-size: 10px;
  color: #888;
  line-height: 1.2;
  white-space: nowrap;
}

.type-chip.active .type-label {
  color: #4caf50;
  font-weight: 600;
}

.plan-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-card {
  display: flex;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.plan-accent {
  width: 4px;
  background: #4caf50;
  flex-shrink: 0;
}

.accent-push { background: #4caf50; }
.accent-pull { background: #2196f3; }
.accent-leg { background: #ff9800; }
.accent-upper { background: #9c27b0; }
.accent-lower { background: #00bcd4; }
.accent-fullbody { background: #e91e63; }
.accent-custom { background: #607d8b; }

.plan-body {
  flex: 1;
  padding: 10px 12px;
  min-width: 0;
}

.plan-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.plan-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 6px 8px;
  background: #e8f5e9;
  border-radius: 4px;
  flex-shrink: 0;
}

.plan-type-icon {
  font-size: 11px;
  line-height: 1;
}

.plan-type-text {
  font-size: 10px;
  color: #4caf50;
  font-weight: 600;
  line-height: 1;
}

.plan-row2 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.plan-count {
  font-size: 11px;
  color: #4caf50;
  line-height: 1.2;
}

.plan-sep {
  font-size: 11px;
  color: #ddd;
  line-height: 1.2;
}

.plan-date {
  font-size: 11px;
  color: #bbb;
  line-height: 1.2;
}

.plan-status {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 6px;
  margin-left: auto;
}

.plan-status.status-new {
  background: #f5f6f8;
}

.plan-status.status-trained {
  background: #e8f5e9;
}

.plan-status-text {
  font-size: 10px;
  line-height: 1.3;
}

.status-new .plan-status-text {
  color: #999;
}

.status-trained .plan-status-text {
  color: #4caf50;
  font-weight: 600;
}

.plan-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.plan-exercise-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: #f0f4f8;
  border-radius: 10px;
}

.plan-exercise-name {
  font-size: 10px;
  color: #666;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.more-chip {
  background: #e8f5e9;
}

.more-text {
  font-size: 10px;
  color: #4caf50;
  font-weight: 600;
  line-height: 1.3;
}

.plan-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.start-btn {
  flex: 1;
  height: 30px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
}

.action-label {
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.del-btn {
  height: 30px;
  padding: 0 12px;
  background: #f5f6f8;
}

.del-label {
  font-size: 11px;
  color: #bbb;
  line-height: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 32px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  line-height: 1;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.3;
}

.empty-desc {
  font-size: 12px;
  color: #bbb;
  line-height: 1.4;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  width: 100%;
  padding: 0 20px 28px;
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
  background: #fff;
  border-radius: 20px 20px 0 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0 10px;
  border-bottom: 1PX solid #f0f0f0;
  margin-bottom: 14px;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #f5f6f8;
  flex-shrink: 0;
}

.modal-close-icon {
  font-size: 11px;
  color: #aaa;
  line-height: 1;
}

.modal-section {
  margin-bottom: 16px;
}

.modal-label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
  line-height: 1.4;
}

.modal-input {
  width: 100%;
  padding: 10px 14px;
  background: #f5f6f8;
  border-radius: 10px;
  font-size: 14px;
  color: #1a1a1a;
  border: 1PX solid #eee;
  line-height: 1.4;
}

.modal-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.modal-type-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  background: #f5f6f8;
  border-radius: 18px;
  border: 1PX solid #eee;
  flex-shrink: 0;
}

.modal-type-chip.active {
  background: #e8f5e9;
  border-color: #4caf50;
  box-shadow: 0 1px 4px rgba(76, 175, 80, 0.15);
}

.modal-type-icon {
  font-size: 13px;
  line-height: 1;
}

.modal-type-label {
  font-size: 11px;
  color: #888;
  line-height: 1.2;
  white-space: nowrap;
}

.modal-type-chip.active .modal-type-label {
  color: #4caf50;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.modal-cancel {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f8;
  border-radius: 21px;
}

.modal-cancel-text {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.modal-confirm {
  flex: 2;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 21px;
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.25);
}

.modal-confirm-text {
  font-size: 13px;
  color: #fff;
  font-weight: 600;
}
</style>
