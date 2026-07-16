import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'uno.css'
import './app.scss'
import './styles/iconfont.css'
import { initCloud, testCloudWrite } from '@/utils/cloud'

// H5 rem scaling: match Taro runtime formula 20 * w / 375
if (process.env.TARO_ENV === 'h5') {
  const MAX_W = 500
  function recalcRoot() {
    const w = Math.min(document.documentElement.clientWidth, MAX_W)
    const x = (20 * w) / 375
    document.documentElement.style.fontSize =
      (x >= 40 ? 40 : x <= 20 ? 20 : x) + 'px'
  }
  recalcRoot()
  window.addEventListener('resize', recalcRoot)
}

const App = createApp({
  onLaunch() {
    initCloud()
    // Expose test function to console
    ;(globalThis as any).testCloud = testCloudWrite
  },
  onShow() {
    console.log('App onShow')
  },
})

const pinia = createPinia()
App.use(pinia)

export default App
