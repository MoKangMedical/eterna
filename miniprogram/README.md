# 念念 Eterna 微信小程序骨架

这个目录是一个可直接在微信开发者工具中打开的原生小程序项目。

## 当前已接通

- 账号登录：复用 `/api/auth/login`
- 工作台聚合：复用 `/api/client/bootstrap`
- 纪念册时间线：复用 `/api/loved-ones/{id}/timeline`
- 回忆保存：复用 `/api/memories`
- 素材上传：复用 `/api/loved-ones/{id}/voice|photo|video|model-3d`
- 对话陪伴：复用 `/api/chat` 与 `/api/chat-history/{id}`

## 当前未做

- 微信 `code2Session` 登录
- 订阅消息推送
- 微信支付 / 正式支付链路
- 审核版隐私协议页与用户协议页

## 本地打开方式

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录指向这个 `miniprogram/` 文件夹。
4. `AppID` 先用测试号或替换 `project.config.json` 里的 `appid`。
5. 在 `config/env.js` 或服务端 `/api/miniprogram/config` 中确认 API 域名。

## 建议的下一阶段

1. 接微信登录，替换当前邮箱密码登录入口。
2. 接微信订阅消息，把“主动联系”映射成订阅消息提醒。
3. 接正式支付链路，并对套餐能力做小程序端 gating。
