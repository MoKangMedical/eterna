const { getToken } = require('../../utils/auth');
const { request, uploadFile } = require('../../utils/request');

function formatTimelineItems(items = []) {
  const labelMap = {
    memory: '回忆',
    media: '素材',
    conversation: '对话',
    proactive: '主动联系',
    digital_human_build: '重建'
  };
  return items.map((item) => ({
    ...item,
    badge: labelMap[item.item_type] || item.item_type,
    displayTime: (item.created_at || '').replace('T', ' ').slice(0, 16)
  }));
}

Page({
  data: {
    loading: true,
    uploadBusy: false,
    errorMessage: '',
    lovedOnes: [],
    lovedOneId: '',
    lovedOneName: '',
    pickerIndex: 0,
    memoryDraft: '',
    timelineItems: []
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
        await this.loadTimeline(activeLovedOneId);
      }
    } catch (error) {
      this.setData({ loading: false, errorMessage: error.message || '加载纪念册失败' });
    }
  },

  async loadTimeline(lovedOneId) {
    const payload = await request({
      url: `/api/loved-ones/${lovedOneId}/timeline?limit=60`,
      method: 'GET'
    });
    this.setData({
      lovedOneName: payload.loved_one_name || '',
      timelineItems: formatTimelineItems(payload.items || [])
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
    this.loadTimeline(target.id);
  },

  updateMemoryDraft(event) {
    this.setData({ memoryDraft: event.detail.value });
  },

  async saveMemory() {
    const content = (this.data.memoryDraft || '').trim();
    if (!content || !this.data.lovedOneId) {
      return;
    }
    try {
      await request({
        url: '/api/memories',
        method: 'POST',
        data: {
          loved_one_id: this.data.lovedOneId,
          content,
          memory_type: 'story',
          importance: 8
        }
      });
      wx.showToast({ title: '回忆已保存', icon: 'success' });
      this.setData({ memoryDraft: '' });
      await this.bootstrapAndLoad(true);
    } catch (error) {
      wx.showToast({ title: error.message || '保存失败', icon: 'none' });
    }
  },

  async chooseAndUpload(event) {
    const kind = event.currentTarget.dataset.kind;
    if (!this.data.lovedOneId) {
      wx.showToast({ title: '请先选择亲人档案', icon: 'none' });
      return;
    }

    try {
      const filePath = await this.pickFile(kind);
      if (!filePath) {
        return;
      }
      this.setData({ uploadBusy: true });
      const routeMap = {
        voice: 'voice',
        photo: 'photo',
        video: 'video',
        model3d: 'model-3d'
      };
      await uploadFile({
        url: `/api/loved-ones/${this.data.lovedOneId}/${routeMap[kind]}`,
        filePath
      });
      wx.showToast({ title: '上传成功', icon: 'success' });
      await this.bootstrapAndLoad(true);
    } catch (error) {
      if (error && error.message !== 'cancelled') {
        wx.showToast({ title: error.message || '上传失败', icon: 'none' });
      }
    } finally {
      this.setData({ uploadBusy: false });
    }
  },

  pickFile(kind) {
    if (kind === 'photo') {
      return new Promise((resolve, reject) => {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          success(result) {
            resolve(result.tempFiles[0].tempFilePath);
          },
          fail(error) {
            reject(error.errMsg && error.errMsg.includes('cancel') ? new Error('cancelled') : error);
          }
        });
      });
    }

    if (kind === 'video') {
      return new Promise((resolve, reject) => {
        wx.chooseMedia({
          count: 1,
          mediaType: ['video'],
          success(result) {
            resolve(result.tempFiles[0].tempFilePath);
          },
          fail(error) {
            reject(error.errMsg && error.errMsg.includes('cancel') ? new Error('cancelled') : error);
          }
        });
      });
    }

    if (kind === 'voice') {
      return new Promise((resolve, reject) => {
        wx.chooseMessageFile({
          count: 1,
          type: 'file',
          extension: ['mp3', 'wav', 'm4a', 'aac'],
          success(result) {
            resolve(result.tempFiles[0].path);
          },
          fail(error) {
            reject(error.errMsg && error.errMsg.includes('cancel') ? new Error('cancelled') : error);
          }
        });
      });
    }

    return new Promise((resolve, reject) => {
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['glb', 'gltf', 'obj', 'fbx', 'usdz'],
        success(result) {
          resolve(result.tempFiles[0].path);
        },
        fail(error) {
          reject(error.errMsg && error.errMsg.includes('cancel') ? new Error('cancelled') : error);
        }
      });
    });
  }
});
