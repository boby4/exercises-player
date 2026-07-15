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
│   │   └── FavoriteButton/  # 收藏按钮
│   ├── hooks/             # Vue composables
│   │   ├── useSearch.ts   # 搜索逻辑
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
│   │       └── planDetail/ # 计划详情
│   ├── store/             # Pinia 状态
│   │   ├── exercise.ts    # 动作数据 (ExerciseDB)
│   │   ├── favorite.ts    # 收藏 + 云同步
│   │   ├── plan.ts        # 训练计划 + 云同步
│   │   └── record.ts      # 训练记录 + 云同步
│   ├── types/             # TypeScript 类型定义
│   │   └── exercise.ts    # Exercise/Plan/Record 类型
│   └── utils/             # 工具函数
│       ├── cloud.ts       # 云开发封装 (仅小程序)
│       ├── data.ts        # 数据加载/过滤
│       └── storage.ts     # 本地存储封装
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
