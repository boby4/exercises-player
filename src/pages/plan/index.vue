<template>
  <view class="plan-page">
    <!-- 顶部渐变头部 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-left">
          <text class="header-title">训练计划</text>
          <text class="header-desc">定制你的专属训练方案</text>
        </view>
        <view class="header-stats">
          <view class="stat-item">
            <text class="stat-num">{{ planStore.plans.length }}</text>
            <text class="stat-label">计划总数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num">{{ totalTrainedCount }}</text>
            <text class="stat-label">已训练</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-section">
      <view class="create-btn" @tap="showCreateModal = true">
        <view class="create-icon-wrap">
          <text class="create-icon">+</text>
        </view>
        <text class="create-text">创建计划</text>
      </view>
      <view class="generate-btn" @tap="goGenerator">
        <view class="generate-icon-wrap">
          <text class="generate-icon">✨</text>
        </view>
        <text class="generate-text">智能生成</text>
      </view>
    </view>

    <!-- 计划类型选择 -->
    <view class="type-section">
      <scroll-view :scroll-x="true" :show-scrollbar="false" class="type-scroll">
        <view class="type-list">
          <view
            class="type-chip"
            :class="{ active: selectedType === '' }"
            @tap="selectType('')"
          >
            <text class="type-label">全部</text>
          </view>
          <view
            v-for="pt in planTypes"
            :key="pt.key"
            class="type-chip"
            :class="{ active: selectedType === pt.key }"
            @tap="selectType(pt.key)"
          >
            <IconFont :name="pt.icon" :size="16" class="type-icon" />
            <text class="type-label">{{ pt.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 计划列表 -->
    <view v-if="filteredPlans.length > 0" class="plan-list">
      <view v-for="plan in filteredPlans" :key="plan.id" class="plan-card" @tap="openPlan(plan.id)">
        <view class="plan-card-header">
          <view class="plan-icon-wrap" :class="'icon-' + plan.type">
            <IconFont :name="getTypeIcon(plan.type)" :size="20" style="color: #fff" />
          </view>
          <view class="plan-title-area">
            <text class="plan-name">{{ plan.name }}</text>
            <view class="plan-type-tag" :class="'tag-' + plan.type">
              <text class="type-tag-text">{{ getTypeLabel(plan.type) }}</text>
            </view>
          </view>
          <view class="plan-status" :class="getPlanRecordInfo(plan.id).count > 0 ? 'status-trained' : 'status-new'">
            <text class="status-text">
              {{ getPlanRecordInfo(plan.id).count > 0 ? '已练' + getPlanRecordInfo(plan.id).count + '次' : '未开始' }}
            </text>
          </view>
        </view>
        
        <view class="plan-info-row">
          <view class="info-item">
            <IconFont name="icon-jianshenqixie" :size="14" style="color: #999" />
            <text class="info-text">{{ plan.exerciseIds.length }} 个动作</text>
          </view>
          <view class="info-item">
            <IconFont name="icon-tice" :size="14" style="color: #999" />
            <text class="info-text">{{ formatDate(plan.updatedAt) }}</text>
          </view>
        </view>

        <view v-if="plan.exerciseIds.length > 0" class="plan-chips">
          <view
            v-for="exId in plan.exerciseIds.slice(0, 3)"
            :key="exId"
            class="exercise-chip"
          >
            <text class="chip-text">{{ getExerciseName(exId) }}</text>
          </view>
          <view v-if="plan.exerciseIds.length > 3" class="exercise-chip more-chip">
            <text class="more-text">+{{ plan.exerciseIds.length - 3 }}</text>
          </view>
        </view>

        <view class="plan-actions">
          <view class="start-btn" @tap.stop="startPlanTraining(plan.id)">
            <text class="start-text">&#x25B6; 开始训练</text>
          </view>
          <view class="detail-btn" @tap.stop="openPlan(plan.id)">
            <text class="detail-text">详情</text>
          </view>
          <view class="delete-btn" @tap.stop="deletePlan(plan.id)">
            <text class="delete-text">删除</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <IconFont name="icon-jianshenbao" :size="64" style="color: #ddd" />
      <text class="empty-title">暂无训练计划</text>
      <text class="empty-desc">创建一个计划开始你的训练之旅</text>
    </view>

    <!-- 创建弹窗 -->
    <view v-if="showCreateModal" class="modal-overlay" @tap="showCreateModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">创建训练计划</text>
          <view class="modal-close" @tap="showCreateModal = false">
            <text class="close-icon">&#x2715;</text>
          </view>
        </view>

        <view class="modal-section">
          <text class="modal-label">计划名称</text>
          <input
            class="modal-input"
            v-model="newPlanName"
            placeholder="如：胸部强化日、腿部力量训练..."
          />
        </view>

        <view class="modal-section">
          <text class="modal-label">训练类型</text>
          <view class="modal-type-grid">
            <view
              v-for="pt in planTypes"
              :key="pt.key"
              class="modal-type-item"
              :class="{ active: newPlanType === pt.key }"
              @tap="newPlanType = pt.key"
            >
              <IconFont :name="pt.icon" :size="20" class="modal-type-icon" />
              <text class="modal-type-name">{{ pt.label }}</text>
            </view>
          </view>
        </view>

        <view class="modal-actions">
          <view class="modal-cancel" @tap="showCreateModal = false">
            <text class="cancel-text">取消</text>
          </view>
          <view class="modal-confirm" @tap="createPlan">
            <text class="confirm-text">创建计划</text>
          </view>
        </view>
      </view>
    </view>

    <AchievementPopup />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import IconFont from '@/components/IconFont/index.vue'
import AchievementPopup from '@/components/AchievementPopup/index.vue'
import { usePlanStore } from '@/store/plan'
import { useRecordStore } from '@/store/record'
import { useAchievementStore } from '@/store/achievement'
import { useShare } from '@/hooks/useShare'
import { getExerciseById, getExerciseNameZh } from '@/utils/data'
import { PLAN_TYPE_LABELS } from '@/types/exercise'
import type { PlanType } from '@/types/exercise'

const planStore = usePlanStore()
const recordStore = useRecordStore()
const achievementStore = useAchievementStore()
const showCreateModal = ref(false)

useShare({
  title: '定制你的训练计划 - ExercisesPlayer',
  path: '/pages/plan/index',
})

useDidShow(() => {
  recordStore.syncFromCloud()
})

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
  { key: 'push', label: 'Push', icon: 'icon-jirounan' },
  { key: 'pull', label: 'Pull', icon: 'icon-paobu' },
  { key: 'leg', label: 'Leg', icon: 'icon-fuwocheng' },
  { key: 'upper', label: 'Upper', icon: 'icon-yaling' },
  { key: 'lower', label: 'Lower', icon: 'icon-chengzhong' },
  { key: 'fullbody', label: 'Full Body', icon: 'icon-tice' },
  { key: 'custom', label: '自定义', icon: 'icon-jianshenqixie' },
]

const totalTrainedCount = computed(() => {
  return planStore.plans.reduce((sum, plan) => {
    const recordInfo = getPlanRecordInfo(plan.id)
    return sum + recordInfo.count
  }, 0)
})

const filteredPlans = computed(() => {
  if (!selectedType.value) return planStore.plans
  return planStore.plans.filter((p) => p.type === selectedType.value)
})

function getTypeLabel(type: PlanType): string {
  return PLAN_TYPE_LABELS[type] || type
}

function getTypeIcon(type: PlanType): string {
  const found = planTypes.find((pt) => pt.key === type)
  return found?.icon || 'icon-jianshenqixie'
}

function getExerciseName(id: string): string {
  const ex = getExerciseById(id)
  return ex ? getExerciseNameZh(ex) : '未知动作'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
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
  selectedType.value = type
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
  achievementStore.checkAchievements()
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

function goGenerator(): void {
  Taro.navigateTo({ url: '/packageDetail/pages/generator/index' })
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

<style>
.plan-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 20px;
}

/* 顶部渐变头部 */
.header {
  position: relative;
  padding: 0 0 12px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3d3d3d 100%);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 12px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 2px;
}

.header-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
}

.header-stats {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 8px 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 8px;
}

.stat-num {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
  white-space: nowrap;
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}

/* 操作按钮区域 */
.action-section {
  padding: 0 16px;
  margin-top: 12px;
  display: flex;
}

.action-section > view + view {
  margin-left: 12px;
}

.create-btn,
.generate-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.create-icon-wrap,
.generate-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.create-icon-wrap {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
}

.generate-icon-wrap {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
}

.create-icon,
.generate-icon {
  font-size: 18px;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

.create-text,
.generate-text {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 600;
}

/* 类型选择器 */
.type-section {
  margin-top: 20px;
}

.type-scroll {
  width: 100%;
}

.type-list {
  display: flex;
  flex-wrap: nowrap;
  padding: 0 16px;
}

.type-chip {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-right: 6px;
}

.type-chip.active {
  background: #4caf50;
  border-color: #4caf50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.type-icon {
  font-size: 12px;
  line-height: 1;
  margin-right: 3px;
}

.type-label {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  font-weight: 500;
}

.type-chip.active .type-label {
  color: #fff;
  font-weight: 600;
}

/* 计划列表 */
.plan-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.plan-list > view + view {
  margin-top: 12px;
}

.plan-card {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.plan-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.plan-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.icon-push { background: linear-gradient(135deg, #4caf50, #66bb6a); }
.icon-pull { background: linear-gradient(135deg, #2196f3, #42a5f5); }
.icon-leg { background: linear-gradient(135deg, #ff9800, #ffb74d); }
.icon-upper { background: linear-gradient(135deg, #9c27b0, #ab47bc); }
.icon-lower { background: linear-gradient(135deg, #00bcd4, #26c6da); }
.icon-fullbody { background: linear-gradient(135deg, #e91e63, #ec407a); }
.icon-custom { background: linear-gradient(135deg, #607d8b, #78909c); }

.plan-title-area {
  flex: 1;
  min-width: 0;
}

.plan-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.plan-type-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
}

.tag-push { background: #e8f5e9; }
.tag-pull { background: #e3f2fd; }
.tag-leg { background: #fff3e0; }
.tag-upper { background: #f3e5f5; }
.tag-lower { background: #e0f7fa; }
.tag-fullbody { background: #fce4ec; }
.tag-custom { background: #eceff1; }

.type-tag-text {
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.tag-push .type-tag-text { color: #4caf50; }
.tag-pull .type-tag-text { color: #2196f3; }
.tag-leg .type-tag-text { color: #ff9800; }
.tag-upper .type-tag-text { color: #9c27b0; }
.tag-lower .type-tag-text { color: #00bcd4; }
.tag-fullbody .type-tag-text { color: #e91e63; }
.tag-custom .type-tag-text { color: #607d8b; }

.plan-status {
  padding: 4px 10px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-new {
  background: #f5f5f5;
}

.status-trained {
  background: #e8f5e9;
}

.status-text {
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.status-new .status-text {
  color: #999;
}

.status-trained .status-text {
  color: #4caf50;
}

.plan-info-row {
  display: flex;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-right: 16px;
  line-height: 1;
}

.info-text {
  font-size: 12px;
  color: #666;
  line-height: 1;
}

.plan-chips {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.exercise-chip {
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-right: 6px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-text {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
  display: block;
  line-height: 1;
}

.more-chip {
  background: #e8f5e9;
}

.more-text {
  font-size: 11px;
  color: #4caf50;
  font-weight: 600;
}

.plan-actions {
  display: flex;
}

.plan-actions > view + view {
  margin-left: 8px;
}

.start-btn {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 12px;
}

.start-text {
  font-size: 13px;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.detail-btn {
  height: 36px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
}

.detail-text {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  line-height: 1;
}

.delete-btn {
  height: 36px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff5f5;
  border-radius: 12px;
}

.delete-text {
  font-size: 13px;
  color: #f44336;
  font-weight: 500;
  line-height: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 32px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-top: 16px;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 10000;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 24px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1a;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 14px;
  color: #999;
}

.modal-section {
  margin-bottom: 20px;
}

.modal-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.modal-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: #f5f5f5;
  border-radius: 14px;
  font-size: 15px;
  color: #1a1a1a;
  border: 1.5px solid transparent;
}

.modal-input:focus {
  border-color: #4caf50;
  background: #fff;
}

.modal-type-grid {
  display: flex;
  flex-wrap: wrap;
}

.modal-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 14px;
  border: 1.5px solid transparent;
  min-width: 70px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.modal-type-item.active {
  background: #e8f5e9;
  border-color: #4caf50;
}

.modal-type-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.modal-type-name {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.modal-type-item.active .modal-type-name {
  color: #4caf50;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  margin-top: 24px;
}

.modal-actions > view + view {
  margin-left: 12px;
}

.modal-cancel {
  flex: 1;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 25px;
}

.cancel-text {
  font-size: 15px;
  color: #666;
  font-weight: 600;
}

.modal-confirm {
  flex: 2;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 25px;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.confirm-text {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
}
</style>
