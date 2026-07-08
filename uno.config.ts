import { defineConfig, presetUno } from 'unocss'
import presetWeapp from 'unocss-preset-weapp'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  presets: [
    presetWeapp({
      platform: 'taro',
    }),
    presetUno(),
  ],
  transformers: [
    transformerDirectives(),
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'text-primary': 'text-[#4CAF50]',
    'bg-primary': 'bg-[#4CAF50]',
    'card-base': 'rounded-[20px] bg-white shadow-md p-4',
    'glass-effect': 'backdrop-blur-md bg-white/80',
  },
  theme: {
    colors: {
      primary: '#4CAF50',
      'primary-dark': '#388E3C',
      'primary-light': '#81C784',
      dark: '#1a1a1a',
      'dark-2': '#2d2d2d',
      gray: '#f5f5f5',
      'gray-2': '#e0e0e0',
      'gray-3': '#9e9e9e',
    },
    borderRadius: {
      card: '20px',
      btn: '12px',
    },
  },
})
