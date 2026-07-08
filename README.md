# ExercisesPlayer - 离线健身动作库

基于 [ExerciseDB](https://exercisedb.io/) 数据集构建的离线健身动作库应用，支持多端（H5 / 微信小程序）运行。

## ✨ 功能特性

### 🏠 首页
- 每日推荐动作
- 按身体部位 / 器械分类浏览
- 统计信息快速跳转

### 🔍 搜索
- 关键词实时搜索
- 按身体部位、器械、目标肌肉多维度筛选
- 结果网格/列表视图切换

### ❤️ 收藏
- 一键收藏喜欢的动作
- 收藏列表快速查看

### 📋 训练计划
- 创建自定义训练计划（Push / Pull / Leg / Upper / Lower / Full Body）
- 弹窗式添加/管理动作（搜索 + 多选 + GIF 缩略图预览）
- 计划完成状态追踪（训练次数统计）
- 计划详情页（动作列表、移除、开始训练）

### 🏋️ 训练模式
- 倒计时训练计时器
- GIF 动作演示图
- 动作缩略图导航条，支持快速切换
- 训练记录自动保存

### 👤 个人中心
- 训练历史记录
- 训练统计数据

## 🛠 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Taro 4.2.0 + Vue 3 |
| 语言 | TypeScript |
| 状态管理 | Pinia |
| 构建工具 | Vite 4 |
| CSS 方案 | UnoCSS + SCSS |
| 数据源 | ExerciseDB（离线 JSON） |

## 📁 项目结构

```
exercises-player/
├── src/
│   ├── assets/
│   │   ├── data/exercises.json   # ExerciseDB 离线数据集
│   │   └── tab/                  # TabBar 图标
│   ├── components/               # 公共组件
│   │   ├── ExerciseCard/         # 动作卡片
│   │   ├── FavoriteButton/       # 收藏按钮
│   │   ├── MuscleCard/           # 肌肉部位卡片
│   │   ├── SearchBar/            # 搜索栏
│   │   └── Tag/                  # 标签组件
│   ├── hooks/                    # 组合式函数
│   │   ├── useSearch.ts          # 搜索逻辑
│   │   └── useTimer.ts           # 计时器逻辑
│   ├── pages/                    # 主包页面（TabBar）
│   │   ├── index/                # 首页
│   │   ├── search/               # 搜索页
│   │   ├── favorites/            # 收藏页
│   │   ├── plan/                 # 计划页
│   │   └── profile/              # 个人中心
│   ├── packageDetail/            # 分包页面
│   │   └── pages/
│   │       ├── detail/           # 动作详情页
│   │       ├── training/         # 训练模式页
│   │       └── planDetail/       # 计划详情页
│   ├── store/                    # Pinia 状态管理
│   │   ├── exercise.ts           # 动作数据
│   │   ├── favorite.ts           # 收藏
│   │   ├── plan.ts               # 训练计划
│   │   └── record.ts             # 训练记录
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 工具函数
│   │   ├── data.ts               # 数据查询
│   │   └── storage.ts            # 本地存储
│   ├── app.config.ts             # Taro 应用配置
│   ├── app.scss                  # 全局样式
│   └── app.ts                    # 应用入口
├── public/
│   └── gifs/                     # 本地 GIF 资源（可选）
├── gen-tab-icons.js              # TabBar 图标生成脚本
└── package.json
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:weapp
```

### 构建

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:weapp
```

### 生成 TabBar 图标

```bash
node gen-tab-icons.js
```

## 📊 数据来源

动作数据来自 [ExerciseDB](https://exercisedb.io/)，包含：

- **3000+** 健身动作
- 支持 **6 种语言** 指令说明（含中文）
- 身体部位、目标肌肉、器械类型等多维度分类
- GIF 动画演示（可选本地化）

## 📱 页面预览

| 首页 | 搜索 | 计划 | 训练 |
|:---:|:---:|:---:|:---:|
| 推荐动作 + 分类浏览 | 多维筛选 | 计划管理 + 状态 | 计时训练 + GIF |

## 📝 注意事项

- 首次运行前请确保已安装依赖
- GIF 资源可通过 `download-gifs.js` 脚本批量下载到本地
- Taro 新增子包页面后需重启开发服务器
- `iconPath` 与 `selectedIconPath` 必须指向不同文件

## 📄 License

MIT
