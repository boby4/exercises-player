import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'uno.css'
import './app.scss'

const App = createApp({
  onShow() {
    console.log('App onShow')
  },
})

const pinia = createPinia()
App.use(pinia)

export default App
