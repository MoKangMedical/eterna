const env = require('./config/env');
const { getToken, loadBootstrap } = require('./utils/auth');
const { request } = require('./utils/request');

App({
  globalData: {
    remoteConfig: null,
    bootstrap: null,
    activeLovedOneId: '',
    language: env.DEFAULT_LANG
  },

  async onLaunch() {
    await this.loadRemoteConfig();
    if (getToken()) {
      try {
        await this.refreshBootstrap();
      } catch (error) {
        console.warn('bootstrap load failed on launch', error);
      }
    }
  },

  async loadRemoteConfig() {
    try {
      const config = await request({
        url: '/api/miniprogram/config',
        method: 'GET',
        skipAuth: true
      });
      this.globalData.remoteConfig = config;
      return config;
    } catch (error) {
      console.warn('remote config unavailable, fallback to local env', error);
      return null;
    }
  },

  async refreshBootstrap() {
    const bootstrap = await loadBootstrap();
    this.globalData.bootstrap = bootstrap;
    if (!this.globalData.activeLovedOneId && bootstrap.loved_ones && bootstrap.loved_ones.length) {
      this.globalData.activeLovedOneId = bootstrap.loved_ones[0].id;
    }
    return bootstrap;
  },

  setActiveLovedOne(lovedOneId) {
    this.globalData.activeLovedOneId = lovedOneId || '';
  },

  clearSession() {
    this.globalData.bootstrap = null;
    this.globalData.activeLovedOneId = '';
  }
});
