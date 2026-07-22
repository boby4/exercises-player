# AGENTS.md - AI Agent 快速上手指南

## 项目概述

**ExercisesPlayer** - 基于 Taro 4.2.0 + Vue 3 的跨端健身动作库应用，同时支持微信小程序和 H5 双端运行。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Taro 4.2.0 + Vue 3 (Composition API) |
| 状态管理 | Pinia |
| 构建工具 | Vite 4 |
| CSS方案 | UnoCSS (H5) + scoped CSS (小程序) |
| 云后端 | 微信云开发 (@cloudbase/node-sdk) |
| 部署 | Vercel (H5) + 微信开发者工具 (小程序) |

## 核心命令

```bash
# 开发
npm run dev:weapp     # 小程序开发模式 (watch)
npm run dev:h5        # H5 开发模式 (watch)

# 构建
npm run build:weapp   # 构建小程序 → dist-weapp/
npm run build:h5      # 构建H5 → dist/

# 代码检查
npm run lint          # ESLint 检查
```

## 目录结构

```
exercises-player/
├── cloud/functions/       # 云函数
│   └── syncData/          # 统一数据同步函数
├── config/                # Taro 构建配置
│   ├── index.ts           # 主配置
│   ├── dev.ts             # 开发环境配置
│   └── prod.ts            # 生产环境配置
├── src/
│   ├── app.ts             # 应用入口
│   ├── app.config.ts      # 页面/路由/TabBar配置
│   ├── components/        # 公共组件
│   │   ├── FavoriteButton/  # 收藏按钮
│   │   ├── IconFont/        # IconFont 图标组件
│   │   └── SvgIcon/         # SVG 图标组件 (备用)
│   ├── hooks/             # Vue composables
│   │   ├── useSearch.ts   # 搜索逻辑
│   │   ├── useShare.ts    # 微信分享转发
│   │   └── useTimer.ts    # 计时器逻辑
│   ├── pages/             # 主包页面 (TabBar)
│   │   ├── index/         # 首页 - 随机推荐
│   │   ├── search/        # 搜索 - 按部位/器械筛选
│   │   ├── favorites/     # 收藏列表
│   │   ├── plan/          # 训练计划
│   │   └── profile/       # 个人中心
│   ├── packageDetail/     # 分包页面 (非TabBar)
│   │   └── pages/
│   │       ├── detail/    # 动作详情
│   │       ├── training/  # 训练执行
│   │       ├── planDetail/ # 计划详情
│   │       ├── calculator/ # 健康计算器
│   │       ├── about/     # 关于我们
│   │       └── generator/ # 智能生成训练计划
│   ├── store/             # Pinia 状态
│   │   ├── exercise.ts    # 动作数据 (ExerciseDB)
│   │   ├── favorite.ts    # 收藏 + 云同步
│   │   ├── plan.ts        # 训练计划 + 云同步
│   │   └── record.ts      # 训练记录 + 云同步
│   ├── styles/            # 全局样式
│   │   └── iconfont.css   # IconFont 字体样式
│   ├── types/             # TypeScript 类型定义
│   │   └── exercise.ts    # Exercise/Plan/Record 类型
│   └── utils/             # 工具函数
│       ├── cloud.ts       # 云开发封装 (仅小程序)
│       ├── data.ts        # 数据加载/过滤
│       ├── planGenerator.ts # 智能训练计划生成引擎
│       └── storage.ts     # 本地存储封装
├── scripts/               # 构建辅助脚本
│   └── patch-share-config.js # 注入页面分享配置到 JSON
├── project.config.json    # 微信开发者工具配置
└── package.json
```

## 关键设计决策

### 1. 跨端适配策略

```typescript
// 平台判断
process.env.TARO_ENV === 'weapp'  // 小程序
process.env.TARO_ENV === 'h5'     // H5
```

- **条件编译**: 使用 `process.env.TARO_ENV` 区分平台
- **云开发**: 仅小程序端启用 (`isWeapp()` 判断)
- **存储**: 小程序走云数据库，H5 走 localStorage

### 2. 尺寸单位规范

- **designWidth: 375** - 设计稿基准宽度
- 小程序使用 `pxtransform` 自动转换 rpx
- H5 使用 rem 缩放 (公式: `20 * w / 375`，上限40px)
- **大写 PX** 可绕过 Taro 自动转换: `width: 100PX` 保持原值

### 3. 数据同步架构

```
用户操作 → Store 本地更新 → 云端同步 (异步)
                    ↓
              启动时 syncFromCloud() 合并
```

- 本地优先写入，后台异步同步云端
- 每次启动调用 `syncFromCloud()` 合并数据
- `cloudMap: Map<localId, cloudId>` 维护 ID 映射

### 4. 云函数设计

**syncData** - 统一数据操作函数:

```javascript
// 调用方式
{
  action: 'get' | 'add' | 'update' | 'delete',
  collection: 'favorites' | 'plans' | 'records',
  data: { ... },     // add/update 时
  id: 'xxx'          // update/delete 时
}
```

- 通过 `_openid` 自动隔离用户数据
- 云函数使用 `@cloudbase/node-sdk` (非 wx-server-sdk)

### 5. 智能训练计划生成

纯前端规则引擎，无 AI API 依赖。用户通过 5 个维度配置需求，系统自动从 1324 个动作中筛选组合。

**生成维度：**

| 维度 | 选项 | 影响 |
|------|------|------|
| 训练目标 | 增肌/减脂/力量/耐力/柔韧/自定义 | 动作筛选策略 + 数量分配 |
| 训练部位 | 胸/背/肩/手臂/核心/腿/全身（多选） | 目标肌群映射 |
| 训练时长 | 15/30/45/60 分钟 | 总动作数量 |
| 训练地点 | 健身房/家里/户外/办公室 | 可用器械池约束 |
| 器械偏好 | 哑铃/杠铃/自重/绳索等（多选） | 动作优先排序 |

**核心流程：**

```
用户配置(5维度) → 地点约束器械池 → 部位映射目标肌群 → 目标+时长计算数量
→ 按肌群分组筛选 → 权重分配 → 随机采样 → 生成计划
```

**训练计划三阶段：**

生成的计划包含三个阶段，确保训练完整性和安全性：
- **热身阶段** (1个动作) - 从 cardio 或 body weight 动作中随机选择
- **正式训练** (3-8个动作) - 根据时长和目标按权重分配
- **拉伸放松** (1个动作) - 从 stretch/yoga 类动作中随机选择

**关键文件：**

- `src/utils/planGenerator.ts` — 核心逻辑（纯函数，所有映射表和生成算法）
- `src/packageDetail/pages/generator/index.vue` — 独立页面 UI (5步分步表单)

### 6. IconFont 图标系统

项目使用 Iconfont 图标字体，跨端兼容（H5 + 小程序）。

**使用方式：**

```vue
<template>
  <IconFont name="icon-yaling" :size="24" />
  <IconFont name="icon-paobu" :size="20" />
</template>

<script setup>
import IconFont from '@/components/IconFont/index.vue'
</script>
```

**图标分类：**

| 分类 | 图标类名 |
|------|----------|
| 健身器械 | icon-yaling, icon-jianshenqixie, icon-tiaosheng |
| 身体指标 | icon-chengzhong, icon-feipang, icon-jirounan |
| 运动类型 | icon-paobu, icon-fuwocheng, icon-yuqie |
| 健康数据 | icon-bushui, icon-danbaifen, icon-jiankangshipin |
| 状态图标 | icon-jieshi, icon-shoushen, icon-jieyan |

**配置文件：**

- `src/styles/iconfont.css` — @font-face 定义和图标类名
- `src/components/IconFont/index.vue` — 图标组件封装

### 7. 健康计算器

位于 `packageDetail/pages/calculator/index`，提供三种健康指标计算：

- **BMI 计算** - 体重指数，判断体重是否健康
- **BMR 计算** - 基础代谢率，估算每日热量消耗
- **体脂率计算** - 基于腰围估算体脂百分比

### 8. 关于我们页面

位于 `packageDetail/pages/about/index`，展示：

- 应用 Logo 和品牌信息
- 6大核心功能介绍（2x2网格布局）
- 技术栈展示
- 版权信息

### 9. 个人中心优化

顶部区域采用水平布局（头像左、文字右），包含：

- 渐变深色背景 + 品牌头像
- 用户信息和健身达人徽章
- 4宫格统计卡片（训练次数/时长/收藏/计划）
- 功能服务入口（智能生成计划/健康计算器/关于我们）
- 清除数据按钮（灰色圆角居中）

### 10. 微信分享转发

通过 `useShare` hook + 页面级 config 实现全局分享：

```typescript
// 页面中使用
useShare(() => ({
  title: '分享标题',
  path: '/pages/xxx/index?id=xxx',
}))
```

**关键点：**
- `enableShareAppMessage/enableShareTimeline` 必须在**页面 JSON 配置**中设置（非 window 全局）
- 构建后由 `scripts/patch-share-config.js` 自动注入到编译产物的页面 JSON
- `build:weapp` 脚本已集成此补丁步骤

## 数据模型

```typescript
// 动作
interface Exercise {
  id: string
  name: string
  body_part: BodyPart      // 部位
  equipment: string         // 器械
  target: string            // 目标肌肉
  muscle_group: string      // 肌群
  gif_url: string | null    // GIF 动图 URL
  // ... 多语言指令等
}

// 训练计划
interface TrainingPlan {
  id: string
  name: string
  type: PlanType           // push/pull/leg/upper/lower/fullbody/custom
  exerciseIds: string[]
}

// 训练记录
interface TrainingRecord {
  id: string
  date: string             // YYYY-MM-DD
  exerciseIds: string[]
  duration: number         // 秒
  planId?: string
}
```

## 编码规范

### 必须遵守

1. **Vue 3 Composition API** - 使用 `<script setup>`
2. **Scoped CSS** - 所有 `.vue` 文件必须使用 `<style scoped>`
3. **小写 px** - 普通样式用小写 `px`，绕过转换用大写 `PX`
4. **tabBar 跳转** - 使用 `Taro.switchTab()`，非 `Taro.navigateTo()`
5. **scroll-view 属性** - 使用 `:scroll-x="true"` 显式绑定

### 页面配置文件

每个页面可有同名 `.config.ts` 文件设置页面级配置（如分享开关）：

```typescript
// src/pages/xxx/index.config.ts
export default definePageConfig({
  enableShareAppMessage: true,
  enableShareTimeline: true,
})
```

> 注意：`window` 全局配置中的 `enableShareAppMessage` 不生效，必须在页面级设置。

### 禁止事项

- ❌ 使用 `wx.` API，统一使用 `Taro.` API
- ❌ 在小程序中使用 `calc()` + rpx/px 混用
- ❌ 给小程序 scroll-view 设置 padding (需移至内部容器)
- ❌ H5 index.html 中删除 `htmlWebpackPlugin.script` 占位符

## GIF 资源管理

```typescript
// 正确的 GIF CDN 地址
const gifUrl = `https://static.exercisedb.dev/media/${exercise.media_id}.gif`
```

- GIF 托管在 ExerciseDB CDN
- 本地不存储 GIF 文件 (避免主包膨胀)

## 部署信息

| 端 | 地址 |
|----|------|
| H5 | https://exercises-player.vercel.app |
| 小程序 | AppID: wxf2431002be6b06e2 |
| 云环境 | cloudbase-d4gcmht1z6dda3d54 |

## 常见坑点

| 问题 | 解决方案 |
|------|----------|
| scroll-view 横向滚动不生效 | 添加 `:scroll-x="true"` 和固定高度 |
| 小程序 emoji 渲染不一致 | 使用 Unicode 字符 ♥/♡ 替代 emoji |
| 云函数 wx-server-sdk 找不到 | 改用 @cloudbase/node-sdk |
| 主包体积超限 2MB | 使用分包加载，大数据移至分包 |
| H5 本地和线上尺寸不一致 | 确保 rem 公式统一: `20 * w / 375` |
| 分享菜单灰色不可用 | 需在页面 `.config.ts` 中设置 `enableShareAppMessage: true`，window 全局不生效 |
| 构建后页面 JSON 无分享配置 | 执行 `npm run build:weapp` 会自动运行 patch 脚本注入 |
| 小程序 v-html 不支持 | 使用 `rich-text` 组件或 SVG data URI |
| UnoCSS 图标在小程序不显示 | 使用 IconFont 字体图标替代 |
| 清除缓存后数据丢失 | 清除后调用 `syncFromCloud()` 从云端恢复 |
| 函数名冲突导致递归 | 避免页面函数与导入函数同名，使用 handle 前缀区分 |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动小程序开发
npm run dev:weapp

# 3. 用微信开发者工具打开 dist-weapp 目录

# 4. 或启动 H5 开发
npm run dev:h5
```
