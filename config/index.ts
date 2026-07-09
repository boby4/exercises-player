import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import path from 'path'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig(async (merge) => {
  const isH5 = process.env.TARO_ENV === 'h5'

  // Only load UnoCSS for H5 builds
  const vitePlugins: any[] = []
  if (isH5) {
    // GIF assets now served from ExerciseDB CDN, no local public dir needed
    try {
      const UnoCSS = (await import('unocss/vite')).default
      vitePlugins.push(UnoCSS())
    } catch (e) {
      console.warn('UnoCSS not available:', e)
    }
  }

  const baseConfig: UserConfigExport = {
    projectName: 'exercises-player',
    date: '2024-1-1',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: isH5 ? 'dist' : `dist-${process.env.TARO_ENV}`,
    plugins: [
      '@tarojs/plugin-platform-weapp',
      '@tarojs/plugin-platform-h5',
      '@tarojs/plugin-framework-vue3',
    ],
    defineConstants: {},
    alias: {
      '@': path.resolve(__dirname, '..', 'src'),
      // For non-H5 builds, alias uno.css to empty file (H5 uses UnoCSS plugin)
      ...(isH5 ? {} : { 'uno.css': path.resolve(__dirname, '..', 'src/uno-empty.css') }),
    },
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'vue3',
    compiler: {
      type: 'vite',
      vitePlugins,
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024,
          },
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            maxRootSize: 40,
          },
        },
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
