export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/search/index',
    'pages/favorites/index',
    'pages/plan/index',
    'pages/profile/index',
  ],
  subPackages: [
    {
      root: 'packageDetail',
      pages: [
        'pages/detail/index',
        'pages/training/index',
        'pages/planDetail/index',
      ],
    },
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'ExercisesPlayer',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#4CAF50',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tab/home.png',
        selectedIconPath: './assets/tab/home-active.png',
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索',
        iconPath: './assets/tab/search.png',
        selectedIconPath: './assets/tab/search-active.png',
      },
      {
        pagePath: 'pages/favorites/index',
        text: '收藏',
        iconPath: './assets/tab/heart.png',
        selectedIconPath: './assets/tab/heart-active.png',
      },
      {
        pagePath: 'pages/plan/index',
        text: '计划',
        iconPath: './assets/tab/plan.png',
        selectedIconPath: './assets/tab/plan-active.png',
      },
    ],
  },
})
