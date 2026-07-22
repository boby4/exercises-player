<template>
  <view class="about-page">
    <!-- 顶部 Logo 区域 -->
    <view class="about-header">
      <view class="logo-wrap">
        <view class="logo">
          <text class="logo-text">EP</text>
        </view>
      </view>
      <text class="app-name">ExercisesPlayer</text>
      <text class="app-slogan">你的专属健身搭子</text>
      <view class="version-badge">
        <text class="version-text">v1.0.0</text>
      </view>
    </view>

    <!-- 核心功能 -->
    <view class="section">
      <text class="section-title">核心功能</text>
      <view class="feature-list">
        <view class="feature-item">
          <view class="feature-icon-wrap" style="background: rgba(76, 175, 80, 0.1)">
            <IconFont name="icon-jianshenqixie" :size="24" style="color: #4caf50" />
          </view>
          <view class="feature-info">
            <view class="feature-title">1324 个健身动作</view>
            <view class="feature-desc">覆盖全身肌群，专业动作指导</view>
          </view>
        </view>
        <view class="feature-item">
          <view class="feature-icon-wrap" style="background: rgba(33, 150, 243, 0.1)">
            <IconFont name="icon-paobu" :size="24" style="color: #2196f3" />
          </view>
          <view class="feature-info">
            <view class="feature-title">训练记录追踪</view>
            <view class="feature-desc">记录每次训练，见证你的进步</view>
          </view>
        </view>
        <view class="feature-item">
          <view class="feature-icon-wrap" style="background: rgba(244, 67, 54, 0.1)">
            <IconFont name="icon-shoushen" :size="24" style="color: #f44336" />
          </view>
          <view class="feature-info">
            <view class="feature-title">智能收藏系统</view>
            <view class="feature-desc">收藏常用动作，快速开始训练</view>
          </view>
        </view>
        <view class="feature-item">
          <view class="feature-icon-wrap" style="background: rgba(255, 152, 0, 0.1)">
            <IconFont name="icon-jianshenbao" :size="24" style="color: #ff9800" />
          </view>
          <view class="feature-info">
            <view class="feature-title">个性化训练计划</view>
            <view class="feature-desc">Push/Pull/Leg 等多种训练模式</view>
          </view>
        </view>
        <view class="feature-item">
          <view class="feature-icon-wrap" style="background: rgba(156, 39, 176, 0.1)">
            <IconFont name="icon-jirounan" :size="24" style="color: #9c27b0" />
          </view>
          <view class="feature-info">
            <view class="feature-title">肌肉群分类</view>
            <view class="feature-desc">精准定位目标肌群，高效训练</view>
          </view>
        </view>
        <view class="feature-item">
          <view class="feature-icon-wrap" style="background: rgba(0, 150, 136, 0.1)">
            <IconFont name="icon-yaling" :size="24" style="color: #009688" />
          </view>
          <view class="feature-info">
            <view class="feature-title">器械分类筛选</view>
            <view class="feature-desc">哑铃、杠铃、器械等多种分类</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 技术栈 -->
    <!-- <view class="section">
      <text class="section-title">技术架构</text>
      <view class="tech-grid">
        <view class="tech-item">
          <text class="tech-name">Taro 4</text>
          <text class="tech-desc">跨端框架</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">Vue 3</text>
          <text class="tech-desc">前端框架</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">TypeScript</text>
          <text class="tech-desc">类型安全</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">Pinia</text>
          <text class="tech-desc">状态管理</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">UnoCSS</text>
          <text class="tech-desc">原子化CSS</text>
        </view>
        <view class="tech-item">
          <text class="tech-name">Vite</text>
          <text class="tech-desc">构建工具</text>
        </view>
      </view>
    </view> -->

    <!-- 版权信息 -->
    <view class="footer">
      <text class="copyright">© 2024 ExercisesPlayer</text>
      <text class="made-with">用心打造的健身应用</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import IconFont from '@/components/IconFont/index.vue'
</script>

<style>
.about-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

/* 顶部 Logo 区域 */
.about-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 40px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3d3d3d 100%);
  border-radius: 0 0 32px 32px;
}

.logo-wrap {
  margin-bottom: 20px;
}

.logo {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(76, 175, 80, 0.3);
}

.logo-text {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 3px;
}

.app-name {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}

.app-slogan {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
}

.version-badge {
  padding: 6px 20px;
  background: rgba(76, 175, 80, 0.15);
  border-radius: 20px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.version-text {
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
}

/* 核心功能 */
.section {
  padding: 24px 16px 0;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
  padding-left: 4px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.feature-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-info {
  flex: 1;
  margin-left: 16px;
}

.feature-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.feature-desc {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  line-height: 1.5;
}

/* 技术栈 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tech-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.tech-desc {
  font-size: 11px;
  color: #999;
}

/* 底部版权 */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px 20px;
  gap: 8px;
}

.copyright {
  font-size: 13px;
  color: #999;
}

.made-with {
  font-size: 12px;
  color: #ccc;
}
</style>
