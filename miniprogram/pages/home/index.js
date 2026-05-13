const { getToken } = require('../../utils/auth');

function formatLovedOnes(items = []) {
  return items.map((item) => ({
    ...item,
    modeText: (item.available_modes || []).join(' / ') || 'text'
  }));
}

Page({
  data: {
    loading: true,
    errorMessage: '',
    user: null,
    stats: null,
    lovedOnes: [],
    featureFlags: {},
    miniprogram: null
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
        stats: bootstrap.stats,
        lovedOnes: formatLovedOnes(bootstrap.loved_ones || []),
        featureFlags: bootstrap.feature_flags || {},
        miniprogram: bootstrap.miniprogram || null,
        loading: false
      });
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: error.message || '加载首页失败'
      });
    }
  },

  refreshPage() {
    this.loadPage(true);
  },

  openArchive(event) {
    const lovedOneId = event.currentTarget.dataset.id;
    const app = getApp();
    app.setActiveLovedOne(lovedOneId);
    wx.switchTab({ url: '/pages/archive/index' });
  },

  openChat(event) {
    const lovedOneId = event.currentTarget.dataset.id;
    const app = getApp();
    app.setActiveLovedOne(lovedOneId);
    wx.switchTab({ url: '/pages/chat/index' });
  }
});
