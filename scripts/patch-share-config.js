/**
 * 构建后脚本：为所有页面 JSON 添加分享配置
 * 微信小程序需要在页面 JSON 中设置 enableShareAppMessage/enableShareTimeline
 */
const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'dist-weapp')

const pages = [
  'pages/index/index.json',
  'pages/search/index.json',
  'pages/favorites/index.json',
  'pages/plan/index.json',
  'pages/profile/index.json',
  'packageDetail/pages/detail/index.json',
  'packageDetail/pages/training/index.json',
  'packageDetail/pages/planDetail/index.json',
  'packageDetail/pages/calculator/index.json',
]

let updated = 0
pages.forEach((p) => {
  const filePath = path.join(distDir, p)
  if (!fs.existsSync(filePath)) return
  const config = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  config.enableShareAppMessage = true
  config.enableShareTimeline = true
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
  updated++
})

console.log(`[patch-share-config] Updated ${updated} page configs`)
