<template>
  <view class="plan-detail-page" v-if="plan">
    <!-- 计划头部信息 -->
    <view class="plan-header">
      <view class="plan-type-badge">
        <text class="plan-type-text">{{ typeLabel }}</text>
      </view>
      <text class="plan-detail-name">{{ plan.name }}</text>
      <view class="plan-meta">
        <text class="meta-count">{{ plan.exerciseIds.length }} 个动作</text>
        <text class="meta-dot">·</text>
        <text class="meta-date">{{ formatDate(plan.createdAt) }}</text>
      </view>
    </view>

    <!-- 动作列表 -->
    <view class="section" v-if="exercises.length > 0">
      <text class="section-title">动作列表</text>
      <view class="exercise-list">
        <view
          v-for="(ex, idx) in exercises"
          :key="ex.id"
          class="exercise-item"
          @tap="goExercise(ex.id)"
        >
          <view class="exercise-num">
            <text class="num-text">{{ idx + 1 }}</text>
          </view>
          <image
            v-if="getGif(ex)"
            :src="getGif(ex)"
            class="exercise-thumb"
            mode="aspectFill"
          />
          <view v-else class="exercise-thumb-placeholder">
            <IconFont name="icon-jirounan" :size="18" class="thumb-icon" />
          </view>
          <view class="exercise-info">
            <text class="exercise-name">{{ ex.name }}</text>
            <text class="exercise-target">{{ ex.target }}</text>
          </view>
          <view class="exercise-remove" @tap.stop="removeExercise(ex.id)">
            <IconFont name="icon-bushui" :size="10" class="remove-icon" />
          </view>
        </view>
      </view>
    </view>

    <!-- 空列表 -->
    <view class="empty-section" v-else>
      <IconFont name="icon-yaling" :size="48" class="empty-icon" />
      <text class="empty-title">计划还没有动作</text>
      <text class="empty-desc">点击下方按钮添加动作到计划中</text>
    </view>

    <!-- 添加动作按钮 -->
    <view class="add-section">
      <view class="add-btn" @tap="openAddModal">
        <text class="add-icon">+</text>
        <text class="add-text">添加动作</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="plan.exerciseIds.length > 0">
      <button class="share-btn" open-type="share">
        <text class="share-icon-text">↗</text>
      </button>
      <view class="start-btn" @tap="startTraining">
        <text class="start-text">开始训练</text>
      </view>
    </view>
  </view>

  <!-- 加载状态 -->
  <view class="loading-state" v-else>
    <text class="loading-text">加载中...</text>
  </view>

  <!-- 添加动作弹窗 -->
  <view v-if="showAddModal" class="modal-overlay" @tap="closeAddModal">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="modal-title">选择动作</text>
        <view class="modal-close" @tap="closeAddModal">
          <IconFont name="icon-bushui" :size="11" class="modal-close-icon" />
        </view>
      </view>
      <view class="modal-search">
        <input
          class="modal-search-input"
          v-model="searchKeyword"
          placeholder="列表仅展示50个动作，请按动作名称进行搜索"
        />
      </view>
      <scroll-view :scroll-y="true" class="modal-exercise-list">
        <view
          v-for="ex in filteredAllExercises"
          :key="ex.id"
          class="modal-exercise-item"
          :class="{ selected: selectedIds.includes(ex.id) }"
          @tap="toggleSelect(ex.id)"
        >
          <view class="modal-check" :class="{ checked: selectedIds.includes(ex.id) }">
            <IconFont v-if="selectedIds.includes(ex.id)" name="icon-bushui" :size="12" class="check-mark" />
          </view>
          <image
            v-if="getGif(ex)"
            :src="getGif(ex)"
            class="modal-exercise-thumb"
            mode="aspectFill"
          />
          <view v-else class="modal-exercise-thumb-placeholder">
            <IconFont name="icon-jirounan" :size="18" class="thumb-ph-icon" />
          </view>
          <view class="modal-exercise-info">
            <text class="modal-exercise-name">{{ ex.name }}</text>
            <text class="modal-exercise-target">{{ ex.target }} · {{ ex.equipment }}</text>
          </view>
        </view>
        <view v-if="filteredAllExercises.length === 0" class="modal-empty">
          <text class="modal-empty-text">未找到匹配的动作</text>
        </view>
      </scroll-view>
      <view class="modal-footer">
        <text class="modal-selected-count">已选 {{ selectedIds.length }} 个</text>
        <view class="modal-save-btn" @tap="saveExercises">
          <text class="modal-save-text">保存</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
import IconFont from '@/components/IconFont/index.vue'
import type { Exercise } from '@/types/exercise'
import { PLAN_TYPE_LABELS } from '@/types/exercise'
import { getExerciseById, getGifUrl, getAllExercises } from '@/utils/data'
import { useShare } from '@/hooks/useShare'
import { usePlanStore } from '@/store/plan'

const router = useRouter()
const planStore = usePlanStore()
const plan = ref<any>(null)
const planId = ref('')

const typeLabel = computed(() => {
  if (!plan.value) return ''
  return PLAN_TYPE_LABELS[plan.value.type] || plan.value.type
})

const exercises = computed(() => {
  if (!plan.value) return []
  return plan.value.exerciseIds
    .map((id) => getExerciseById(id))
    .filter(Boolean) as Exercise[]
})

function getGif(ex: Exercise): string {
  return getGifUrl(ex)
}

useShare(() => ({
  title: plan.value ? `${plan.value.name} - 训练计划` : '训练计划',
  path: plan.value
    ? `/packageDetail/pages/planDetail/index?planId=${planId.value}`
    : '/pages/index/index',
}))

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function goExercise(exerciseId: string): void {
  Taro.navigateTo({ url: `/packageDetail/pages/detail/index?id=${exerciseId}` })
}

function goAddExercise(): void {
  openAddModal()
}

const showAddModal = ref(false)
const searchKeyword = ref('')
const selectedIds = ref<string[]>([])

const allExercises = computed(() => getAllExercises())

const filteredAllExercises = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return allExercises.value.slice(0, 50)
  return allExercises.value
    .filter((ex) => ex.name.toLowerCase().includes(kw) || ex.target.toLowerCase().includes(kw) || ex.equipment.toLowerCase().includes(kw))
    .slice(0, 50)
})

function openAddModal(): void {
  searchKeyword.value = ''
  selectedIds.value = plan.value ? [...plan.value.exerciseIds] : []
  showAddModal.value = true
  Taro.hideTabBar({ animation: false })
}

function closeAddModal(): void {
  showAddModal.value = false
  Taro.showTabBar({ animation: false })
}

function toggleSelect(id: string): void {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

function saveExercises(): void {
  if (!plan.value) return
  const currentIds = [...plan.value.exerciseIds]
  let added = 0
  for (const id of selectedIds.value) {
    if (!currentIds.includes(id)) {
      planStore.addExerciseToPlan(planId.value, id)
      added++
    }
  }
  let removed = 0
  for (const id of currentIds) {
    if (!selectedIds.value.includes(id)) {
      planStore.removeExerciseFromPlan(planId.value, id)
      removed++
    }
  }
  showAddModal.value = false
  Taro.showTabBar({ animation: false })
  if (added > 0 || removed > 0) {
    Taro.showToast({ title: `添加 ${added} 个，移除 ${removed} 个`, icon: 'none' })
  }
}

function removeExercise(exerciseId: string): void {
  Taro.showModal({
    title: '移除动作',
    content: '确定从计划中移除这个动作吗？',
    success: (res) => {
      if (res.confirm) {
        planStore.removeExerciseFromPlan(planId.value, exerciseId)
        Taro.showToast({ title: '已移除', icon: 'success' })
      }
    },
  })
}

function startTraining(): void {
  if (!plan.value || plan.value.exerciseIds.length === 0) return
  Taro.navigateTo({
    url: `/packageDetail/pages/training/index?id=${plan.value.exerciseIds[0]}&planId=${planId.value}`,
  })
}

onMounted(() => {
  const id = router.params.planId
  if (id) {
    planId.value = id
    const found = planStore.getPlanById(id)
    if (found) {
      plan.value = found
      Taro.setNavigationBarTitle({ title: found.name })
    }
  }
})
</script>

<style>
.plan-detail-page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: 80px;
}

.loading-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 14px;
  color: #999;
}

.plan-header {
  padding: 20px 16px 16px;
  background: #fff;
}

.plan-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: #e8f5e9;
  border-radius: 8px;
  margin-bottom: 8px;
}

.plan-type-text {
  font-size: 11px;
  color: #4caf50;
  font-weight: 600;
  line-height: 1.2;
}

.plan-detail-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
  display: block;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.meta-count {
  font-size: 12px;
  color: #4caf50;
  font-weight: 500;
}

.meta-dot {
  font-size: 12px;
  color: #ccc;
}

.meta-date {
  font-size: 12px;
  color: #aaa;
}

.section {
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  line-height: 1.3;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exercise-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.exercise-num {
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.num-text {
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.exercise-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  flex-shrink: 0;
  object-fit: cover;
}

.exercise-thumb-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #f5f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thumb-icon {
  font-size: 18px;
  line-height: 1;
}

.exercise-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exercise-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exercise-target {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
}

.exercise-remove {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: #fff0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-icon {
  font-size: 10px;
  color: #e53935;
  line-height: 1;
}

.empty-section {
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
  font-size: 15px;
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

.add-section {
  padding: 0 16px;
  margin-top: 8px;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  background: #fff;
  border-radius: 22px;
  border: 1PX dashed #4caf50;
}

.add-icon {
  font-size: 16px;
  color: #4caf50;
  font-weight: 700;
  line-height: 1;
}

.add-text {
  font-size: 13px;
  color: #4caf50;
  font-weight: 600;
  line-height: 1;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-btn {
  width: 44px;
  height: 44px;
  background: #f5f5f5;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.share-btn::after {
  border: none;
}

.share-icon-text {
  font-size: 20px;
  color: #666;
  font-weight: 700;
}

.start-btn {
  flex: 1;
  height: 44px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.25);
}

.start-text {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  line-height: 1;
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
  max-height: 80vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
  border-bottom: 1PX solid #f0f0f0;
  flex-shrink: 0;
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

.modal-search {
  padding: 10px 16px;
  flex-shrink: 0;
}

.modal-search-input {
  width: 100%;
  padding: 8px 14px;
  background: #f5f6f8;
  border-radius: 10px;
  font-size: 13px;
  color: #1a1a1a;
  border: 1PX solid #eee;
  line-height: 1.4;
}

.modal-exercise-list {
  flex: 1;
  max-height: 50vh;
  padding: 0 16px;
}

.modal-exercise-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1PX solid #f5f5f5;
}

.modal-exercise-item:last-child {
  border-bottom: none;
}

.modal-exercise-item.selected {
  background: #fafffe;
}

.modal-check {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1PX solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-check.checked {
  background: #4caf50;
  border-color: #4caf50;
}

.check-mark {
  font-size: 12px;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

.modal-exercise-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
  background: #f5f5f5;
  object-fit: cover;
}

.modal-exercise-thumb :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

.modal-exercise-thumb-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-ph-icon {
  font-size: 18px;
  line-height: 1;
}

.modal-exercise-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-exercise-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-exercise-target {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
}

.modal-empty {
  padding: 30px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-empty-text {
  font-size: 13px;
  color: #bbb;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1PX solid #f0f0f0;
  flex-shrink: 0;
}

.modal-selected-count {
  font-size: 13px;
  color: #666;
  line-height: 1.3;
}

.modal-save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 28px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 20px;
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.25);
}

.modal-save-text {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}
</style>
