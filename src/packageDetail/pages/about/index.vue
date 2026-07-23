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
      <view class="feature-grid">
        <view class="feature-card">
          <view class="feature-icon-box">
            <IconFont name="icon-jianshenqixie" :size="24" style="color: #333" />
          </view>
          <text class="feature-name">海量动作库</text>
          <text class="feature-count">1324+</text>
          <text class="feature-desc">覆盖全身肌群</text>
        </view>
        <view class="feature-card">
          <view class="feature-icon-box">
            <IconFont name="icon-jishiqi" :size="24" style="color: #333" />
          </view>
          <text class="feature-name">训练记录</text>
          <text class="feature-count">可视化</text>
          <text class="feature-desc">追踪每次进步</text>
        </view>
        <view class="feature-card">
          <view class="feature-icon-box">
            <IconFont name="icon-shoushen" :size="24" style="color: #333" />
          </view>
          <text class="feature-name">智能收藏</text>
          <text class="feature-count">一键收藏</text>
          <text class="feature-desc">常用动作速达</text>
        </view>
        <view class="feature-card">
          <view class="feature-icon-box">
            <IconFont name="icon-jianshenbao" :size="24" style="color: #333" />
          </view>
          <text class="feature-name">训练计划</text>
          <text class="feature-count">AI 生成</text>
          <text class="feature-desc">个性化定制</text>
        </view>
        <view class="feature-card">
          <view class="feature-icon-box">
            <IconFont name="icon-jirounan" :size="24" style="color: #333" />
          </view>
          <text class="feature-name">肌群分类</text>
          <text class="feature-count">精准定位</text>
          <text class="feature-desc">高效训练</text>
        </view>
        <view class="feature-card">
          <view class="feature-icon-box">
            <IconFont name="icon-chengzhong" :size="24" style="color: #333" />
          </view>
          <text class="feature-name">健康计算</text>
          <text class="feature-count">BMI/BMR</text>
          <text class="feature-desc">科学管理体重</text>
        </view>
      </view>
    </view>

    <!-- 应用特色 -->
    <view class="section">
      <view class="highlight-list">
        <view class="highlight-item">
          <view class="highlight-dot"></view>
          <text class="highlight-text">完全离线可用，无需网络</text>
        </view>
        <view class="highlight-item">
          <view class="highlight-dot"></view>
          <text class="highlight-text">数据云端同步，多设备共享</text>
        </view>
        <view class="highlight-item">
          <view class="highlight-dot"></view>
          <text class="highlight-text">专业动作指导，安全训练</text>
        </view>
        <view class="highlight-item">
          <view class="highlight-dot"></view>
          <text class="highlight-text">智能计划生成，省时省力</text>
        </view>
      </view>
    </view>

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
  margin-bottom: 16px;
  padding-left: 4px;
}

.feature-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -6px;
}

.feature-card {
  width: calc(33.333% - 12px);
  margin: 6px;
  background: #fff;
  border-radius: 20px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.feature-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.feature-emoji {
  font-size: 26px;
}

.feature-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  text-align: center;
}

.feature-count {
  font-size: 12px;
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 11px;
  color: #999;
  text-align: center;
}

/* 应用特色 */
.highlight-list {
  background: #fff;
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.highlight-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.highlight-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

.highlight-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  margin-right: 14px;
  flex-shrink: 0;
}

.highlight-text {
  font-size: 15px;
  color: #333;
}

/* 底部版权 */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px 20px;
}

.copyright {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.made-with {
  font-size: 12px;
  color: #ccc;
}
</style>
