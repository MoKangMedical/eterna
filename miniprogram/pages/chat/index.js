const { getToken } = require('../../utils/auth');
const { request } = require('../../utils/request');

function flattenHistory(entries = []) {
  const items = [];
  entries.forEach((entry, index) => {
    items.push({
      id: `user-${index}-${entry.timestamp}`,
      role: 'user',
      text: entry.user_message,
      timestamp: entry.timestamp
    });
    items.push({
      id: `ai-${index}-${entry.timestamp}`,
      role: 'ai',
      text: entry.ai_response,
      timestamp: entry.timestamp,
      mode: entry.mode,
      audioUrl: entry.response_audio_url,
      videoUrl: entry.response_video_url
    });
  });
  return items;
}

Page({
  data: {
    loading: true,
    sending: false,
    errorMessage: '',
    lovedOnes: [],
    lovedOneId: '',
    pickerIndex: 0,
    draft: '',
    messages: [],
    modeIndex: 0,
    modeOptions: [
      { value: 'text', label: '文字' },
      { value: 'voice', label: '语音' },
      { value: 'video', label: '视频' }
    ]
  },

  onShow() {
    if (!getToken()) {
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.bootstrapAndLoad();
  },

  async bootstrapAndLoad(forceRefresh = false) {
    this.setData({ loading: true, errorMessage: '' });
    try {
      const app = getApp();
      const bootstrap = forceRefresh || !app.globalData.bootstrap
        ? await app.refreshBootstrap()
        : app.globalData.bootstrap;
      const lovedOnes = bootstrap.loved_ones || [];
      const activeLovedOneId = app.globalData.activeLovedOneId || (lovedOnes[0] && lovedOnes[0].id) || '';
      const pickerIndex = Math.max(lovedOnes.findIndex((item) => item.id === activeLovedOneId), 0);
      this.setData({
        lovedOnes,
        lovedOneId: activeLovedOneId,
        pickerIndex,
        loading: false
      });
      if (activeLovedOneId) {
        await this.loadHistory(activeLovedOneId);
      }
    } catch (error) {
      this.setData({ loading: false, errorMessage: error.message || '加载对话失败' });
    }
  },

  async loadHistory(lovedOneId) {
    const payload = await request({
      url: `/api/chat-history/${lovedOneId}?limit=20`,
      method: 'GET'
    });
    this.setData({
      messages: flattenHistory(payload.data || [])
    });
  },

  handleLovedOneChange(event) {
    const pickerIndex = Number(event.detail.value);
    const target = this.data.lovedOnes[pickerIndex];
    if (!target) {
      return;
    }
    const app = getApp();
    app.setActiveLovedOne(target.id);
    this.setData({
      pickerIndex,
      lovedOneId: target.id
    });
    this.loadHistory(target.id);
  },

  handleModeChange(event) {
    this.setData({ modeIndex: Number(event.detail.value) });
  },

  updateDraft(event) {
    this.setData({ draft: event.detail.value });
  },

  async sendMessage() {
    const message = (this.data.draft || '').trim();
    if (!message || !this.data.lovedOneId || this.data.sending) {
      return;
    }

    const selectedMode = this.data.modeOptions[this.data.modeIndex].value;
    this.setData({ sending: true, errorMessage: '' });
    try {
      const response = await request({
        url: '/api/chat',
        method: 'POST',
        data: {
          loved_one_id: this.data.lovedOneId,
          message,
          mode: selectedMode
        }
      });
      const optimistic = this.data.messages.concat([
        {
          id: `user-${Date.now()}`,
          role: 'user',
          text: message,
          timestamp: new Date().toISOString()
        },
        {
          id: `ai-${Date.now()}`,
          role: 'ai',
          text: response.response_text,
          timestamp: new Date().toISOString(),
          mode: response.interaction_mode,
          audioUrl: response.response_audio_url,
          videoUrl: response.response_video_url
        }
      ]);
      this.setData({
        draft: '',
        messages: optimistic
      });
    } catch (error) {
      this.setData({ errorMessage: error.message || '发送失败' });
    } finally {
      this.setData({ sending: false });
    }
  }
});
