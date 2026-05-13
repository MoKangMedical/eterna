const { getToken, logout } = require('../../utils/auth');

Page({
  data: {
    loading: true,
    user: null,
    subscription: null,
    stats: null,
    featureFlags: {},
    miniprogram: null,
    bridge: null,
    errorMessage: ''
  },

  onShow() {
    if (!getToken()) {
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.loadPage();
  },

  async loadPage(forceRefresh = false) {
    this.setData({ loading: true, errorMessage: '' });
    try {
      const app = getApp();
      const bootstrap = forceRefresh || !app.globalData.bootstrap
        ? await app.refreshBootstrap()
        : app.globalData.bootstrap;
      this.setData({
        user: bootstrap.user,
        subscription: bootstrap.subscription,
        stats: bootstrap.stats,
        featureFlags: bootstrap.feature_flags || {},
        miniprogram: bootstrap.miniprogram || null,
        bridge: bootstrap.bridge || null,
        loading: false
      });
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: error.message || '加载个人页失败'
      });
    }
  },

  refreshPage() {
    this.loadPage(true);
  },

  async handleLogout() {
    try {
      await logout();
    } finally {
      const app = getApp();
      app.clearSession();
      wx.reLaunch({ url: '/pages/login/index' });
    }
  }
});
