你是一位拥有10年以上经验的全栈架构师。

现在请开发一个可以直接上线部署的健身动作库小程序。

=========================
项目名称
=========================

ExercisesPlayer（离线版）

仅供个人使用。

=========================
技术栈
=========================

必须使用：

Taro 4
Vue3
TypeScript
Pinia
UnoCSS
Vite

要求：

支持：

- 微信小程序
- H5
- Android
- iOS

保证所有端代码一致。

禁止使用 Uniapp。

=========================
数据来源
=========================

数据来源：

GitHub：

https://github.com/hasaneyldrm/exercises-dataset

请直接解析里面的数据。

要求：

所有 json 放到：

src/assets/data/

例如：

exercise.json

bodyParts.json

equipment.json

targetMuscles.json

全部本地读取。

不能联网。

=========================
GIF资源
=========================

把所有 GIF 下载到本地。

放到：

src/assets/gifs/

如果 GIF 数量过多：

请自动按照：

bodyPart

拆分：

例如：

/assets/gifs/chest/
/assets/gifs/back/
/assets/gifs/legs/
/assets/gifs/arms/

如果微信包大小超过限制：

必须使用：

微信分包。

例如：

package-chest
package-back
package-legs
package-arms

页面进入某分类时：

动态加载对应分包。

不得联网。

=========================
目录结构
=========================

src

assets

data

gifs

components

ExerciseCard

MuscleCard

SearchBar

FavoriteButton

Tag

pages

index

search

detail

favorites

plan

profile

store

utils

hooks

types

=========================
页面
=========================

首页

内容：

今日推荐

热门肌群

热门器械

最近训练

动作分类

搜索

支持：

BodyPart

Equipment

Target

Name

全部实时搜索。

动作详情

展示：

GIF

名称

目标肌肉

辅助肌肉

器械

动作步骤

注意事项

收藏

开始训练

收藏页面

本地收藏。

训练计划

可以创建：

Push

Pull

Leg

Upper

Lower

FullBody

可以自由添加动作。

保存本地。

=========================
数据存储
=========================

全部使用：

Taro Storage

包括：

收藏

训练记录

训练计划

最近浏览

无需数据库。

=========================
动作详情
=========================

详情页包括：

GIF

动作名称

BodyPart

Equipment

Target Muscle

Secondary Muscle

Instructions

训练提示

相关动作推荐

=========================
筛选
=========================

支持：

BodyPart

Equipment

Target

Difficulty（预留）

支持：

多条件组合筛选。

=========================
训练模式
=========================

点击：

开始训练

进入训练模式：

显示：

GIF

动作名称

倒计时

下一动作

上一动作

训练完成

可暂停。

=========================
计时器
=========================

支持：

20秒

30秒

40秒

45秒

60秒

90秒

120秒

自定义。

=========================
UI风格
=========================

整体风格：

Apple Fitness

Keep

Nike Training Club

结合。

颜色：

黑白灰

绿色点缀。

圆角：

20px

卡片阴影。

毛玻璃。

动画：

页面切换

Skeleton

Loading

=========================
首页
=========================

顶部：

搜索框

今日推荐

分类入口

BodyPart

Equipment

Target

热门动作

猜你喜欢

=========================
详情页
=========================

顶部：

GIF

下面：

动作介绍

步骤

目标肌群

辅助肌群

器械

注意事项

推荐动作

=========================
搜索
=========================

支持：

模糊搜索

拼音搜索（预留）

英文搜索

中文搜索（预留）

=========================
收藏
=========================

收藏：

本地保存。

支持：

排序

删除

搜索

=========================
训练记录
=========================

记录：

训练日期

动作数量

总时长

保存：

Storage。

=========================
性能优化
=========================

要求：

图片懒加载

GIF懒加载

分包

虚拟列表

按需加载

Tree Shaking

首屏<1.5秒

=========================
代码规范
=========================

必须：

Composition API

TypeScript

ESLint

Prettier

模块化

Hooks

Composable

禁止：

any

重复代码

=========================
输出要求
=========================

请完整输出：

① 项目目录

② 全部页面

③ 全部组件

④ Pinia

⑤ Hooks

⑥ Utils

⑦ Type

⑧ 数据解析

⑨ GIF读取

⑩ 微信分包配置

⑪ Taro配置

⑫ package.json

⑬ README

⑭ 部署说明

⑮ 打包微信

⑯ 打包H5

⑰ 打包Android

⑱ 打包iOS

保证：

npm install

即可运行。

不要省略代码。

不要输出伪代码。

所有代码必须完整可运行。