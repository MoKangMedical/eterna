const { getToken, login } = require('../../utils/auth');

Page({
  data: {
    email: '',
    password: '',
    loading: false,
    errorMessage: ''
  },

  onShow() {
    if (getToken()) {
      wx.switchTab({ url: '/pages/home/index' });
    }
  },

  handleEmailInput(event) {
    this.setData({ email: event.detail.value.trim(), errorMessage: '' });
  },

  handlePasswordInput(event) {
    this.setData({ password: event.detail.value, errorMessage: '' });
  },

  async submitLogin() {
    const { email, password } = this.data;
    if (!email || !password) {
      this.setData({ errorMessage: '请输入邮箱和密码' });
      return;
    }

    this.setData({ loading: true, errorMessage: '' });
    try {
      const app = getApp();
      await login(email, password);
      await app.refreshBootstrap();
      wx.showToast({ title: '已登录', icon: 'success' });
      wx.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      this.setData({ errorMessage: error.message || '登录失败' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
