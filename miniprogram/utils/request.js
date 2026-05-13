const env = require('../config/env');

function resolveBaseUrl() {
  try {
    const app = getApp();
    const dynamicBase = app && app.globalData && app.globalData.remoteConfig && app.globalData.remoteConfig.api_base;
    if (dynamicBase) {
      return dynamicBase.replace(/\/$/, '');
    }
  } catch (error) {
    console.warn('resolveBaseUrl fallback', error);
  }
  return env.BASE_URL.replace(/\/$/, '');
}

function extractErrorMessage(payload, statusCode) {
  if (payload && payload.error && payload.error.message) {
    return payload.error.message;
  }
  if (payload && payload.detail) {
    return payload.detail;
  }
  return `请求失败 (${statusCode})`;
}

function buildHeaders(extraHeader = {}, skipAuth = false) {
  const headers = Object.assign({}, extraHeader);
  if (!skipAuth) {
    const token = wx.getStorageSync(env.TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

function request({ url, method = 'GET', data, header = {}, skipAuth = false }) {
  return new Promise((resolve, reject) => {
    const headers = buildHeaders(header, skipAuth);
    if (!headers['Content-Type'] && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    wx.request({
      url: `${resolveBaseUrl()}${url}`,
      method,
      data,
      header: headers,
      success(response) {
        const payload = response.data || {};
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(payload);
          return;
        }
        reject(new Error(extractErrorMessage(payload, response.statusCode)));
      },
      fail(error) {
        reject(new Error(error.errMsg || '网络请求失败'));
      }
    });
  });
}

function uploadFile({ url, filePath, name = 'file', formData = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${resolveBaseUrl()}${url}`,
      filePath,
      name,
      formData,
      header: buildHeaders(header, false),
      success(response) {
        let payload = {};
        try {
          payload = JSON.parse(response.data || '{}');
        } catch (error) {
          reject(new Error('上传响应无法解析'));
          return;
        }
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(payload);
          return;
        }
        reject(new Error(extractErrorMessage(payload, response.statusCode)));
      },
      fail(error) {
        reject(new Error(error.errMsg || '上传失败'));
      }
    });
  });
}

module.exports = {
  request,
  uploadFile,
  resolveBaseUrl
};
