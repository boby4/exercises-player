import Taro from '@tarojs/taro'

interface ShareOptions {
  title: string
  path: string
  imageUrl?: string
}

/**
 * 微信小程序分享 hook
 * 在页面 setup 中调用，自动注册 onShareAppMessage 和 onShareTimeline
 */
export function useShare(options: ShareOptions | (() => ShareOptions)) {
  const getOptions = typeof options === 'function' ? options : () => options

  // 转发给朋友
  Taro.useShareAppMessage(() => {
    const opts = getOptions()
    return {
      title: opts.title,
      path: opts.path,
      imageUrl: opts.imageUrl,
    }
  })

  // 分享到朋友圈
  Taro.useShareTimeline(() => {
    const opts = getOptions()
    return {
      title: opts.title,
      query: opts.path.split('?')[1] || '',
      imageUrl: opts.imageUrl,
    }
  })
}

/**
 * 手动触发分享（小程序中引导用户点击右上角菜单分享）
 * 可用于显示提示 toast
 */
export function showShareTip(): void {
  Taro.showModal({
    title: '分享',
    content: '请点击右上角「···」按钮进行分享',
    showCancel: false,
  })
}
