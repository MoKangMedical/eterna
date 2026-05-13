# 念念 Eterna 归档合并说明

日期：2026-05-13

## 当前唯一主目录

- 主开发目录：`/Users/apple/Desktop/OPC/念念-Eterna`
- 这个目录是当前唯一生效的代码、前端、后端、小程序和部署配置来源。

## 历史目录处理

- 旧目录 `cloud-memorial` 已不再作为活跃开发目录使用。
- 它的历史快照会被移动到 `OPC/archives/cloud-memorial-legacy-20260429`。

## 本次比对结果

旧目录与当前主目录相比，真正存在内容分叉的文件只有：

- `.env.example`
- `.gitignore`
- `README.md`
- `api/app.py`
- `frontend/index.html`

其他业务文件、演示资产、部署文件和脚本名称已经对齐，主目录中也都已保留。

## 冲突决议

1. `api/app.py`
   当前主目录版本为准，因为它已经包含：
   - DeepSeek / ComfyUI 新链路
   - 数字人控制台与主动联系
   - 微信小程序聚合接口

2. `frontend/index.html`
   当前主目录版本为准，因为它已经包含：
   - 最新的纪念册视觉
   - 数字人控制台
   - 双语和工作台交互

3. `.env.example`
   以当前主目录版本为准，并把旧目录里仍然有效的配置项补回：
   - `DATA_DIR`
   - `ADMIN_EMAILS`
   - `OUTBOUND_CALL_WEBHOOK_URL`
   - `OUTBOUND_CALL_WEBHOOK_TOKEN`
   - `PHONE_CALL_MAX_TURNS`
   - `DEFAULT_TIMEZONE`
   - `PROACTIVE_POLL_SECONDS`

4. `README.md`
   当前主目录版本为准，并补充归档说明入口。

5. `.gitignore`
   当前主目录版本为准，因为覆盖范围更完整。

## 结论

后续只从 `念念-Eterna` 继续开发。

旧项目会作为历史快照保留，不再和主目录并行演进，这样可以避免：

- 两套 `api/app.py` 分叉
- 两套 `frontend/index.html` 分叉
- 两套配置样例不一致
- 部署时误用旧目录
