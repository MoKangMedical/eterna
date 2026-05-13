const env = require('../config/env');
const { request } = require('./request');

function getToken() {
  return wx.getStorageSync(env.TOKEN_KEY) || '';
}

function setToken(token) {
  wx.setStorageSync(env.TOKEN_KEY, token || '');
}

function clearToken() {
  wx.removeStorageSync(env.TOKEN_KEY);
}

async function login(email, password) {
  const payload = await request({
    url: '/api/auth/login',
    method: 'POST',
    data: { email, password }
  });
  if (payload.token) {
    setToken(payload.token);
  }
  return payload;
}

async function register(data) {
  const payload = await request({
    url: '/api/auth/register',
    method: 'POST',
    data
  });
  if (payload.token) {
    setToken(payload.token);
  }
  return payload;
}

async function logout() {
  try {
    await request({
      url: '/api/auth/logout',
      method: 'POST'
    });
  } finally {
    clearToken();
  }
}

async function loadBootstrap() {
  return request({
    url: '/api/client/bootstrap',
    method: 'GET'
  });
}

module.exports = {
  clearToken,
  getToken,
  login,
  logout,
  register,
  loadBootstrap,
  setToken
};
