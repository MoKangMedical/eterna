# GitHub 功能差异评估

日期：2026-05-13

## 检查范围

- 当前主项目：`/Users/apple/Desktop/OPC/念念-Eterna`
- 当前远端仓库：`MoKangMedical/eterna`
- 历史归档仓库：`/Users/apple/Desktop/OPC/archives/cloud-memorial-legacy-20260429`
- 历史远端仓库：`MoKangMedical/cloud-memorial`

## 结论

当前 `eterna` 远端 `main` 和本地主分支提交一致，但本地工作区已经有一批未提交的新功能：

- 微信小程序骨架
- 小程序聚合接口
- 归档合并说明
- `.env.example` 配置补齐

这些功能还没有进入 GitHub。当前最主要的风险不是 GitHub 有更多新功能，而是本地新功能尚未提交和推送。

## 当前 `eterna` 仓库

远端分支：

- `main`
- `gh-pages`
- `add-workflows`

评估：

- `main`：与本地已提交 HEAD 相同。
- `gh-pages`：GitHub Pages 发布内容，不是业务功能来源。
- `add-workflows`：只包含静态 `docs/` 页面和演示视频资产，没有后端、主前端、小程序或数据库能力；不建议合并进主代码。

## 历史 `cloud-memorial` 仓库

远端分支：

- `main`
- `dependabot/pip/fastapi-0.135.3`
- `dependabot/pip/httpx-0.28.1`
- `dependabot/pip/python-multipart-0.0.26`
- `dependabot/pip/stripe-15.0.1`
- `dependabot/pip/uvicorn-0.44.0`

评估：

- `main`：比当前主项目旧，已经归档，不应作为活跃开发来源。
- dependabot 分支：只改 `requirements.txt`，是依赖升级，不是业务功能。
- 旧仓库存在一条未进入 `main` 的功能线，关键提交为 `290fc10 feat: 批量完善内容+UI+商业闭环`。

## 旧功能线 `290fc10` 的价值

这个提交包含较大的模块化拆分：

- `api/main.py`
- `api/app_helpers.py`
- `api/routers/*`
- `api/voice_clone.py`
- `api/ai_engine.py`
- `api/enhanced_chat.py`
- `api/proactive.py`
- `src/*`
- `data/*`
- `templates/memorial-page.html`
- `frontend/css/main.css`
- `frontend/js/app.js`
- `frontend/js/memorial.js`

值得考虑迁入的功能：

- 独立语音克隆接口：`/api/voice-clone/create`、`/api/voice-clone/synthesize`、`/api/voice-clone/list`、`/api/voice-clone/{voice_id}`
- 纪念服务素材：蜡烛、鲜花、祈福、故事提示、节日、哀伤资源等 `data/*.json`
- 纪念服务模块：`src/candle_service.py`、`src/flower_service.py`、`src/grief_counseling.py`、`src/family_tree.py`、`src/photo_album.py`、`src/story_teller.py`
- 模块化后端结构：`routers/` 和 `app_helpers.py`

不建议直接整包合并的原因：

- 当前主项目已经在 `api/app.py` 中包含更新的 DeepSeek、ComfyUI、电话桥接、数字人控制台、小程序接口。
- 旧功能线会把 `api/app.py` 大幅替换成旧结构，直接合并会覆盖现有业务链路。
- 旧前端拆分版本会覆盖当前更完整的纪念册视觉和控制台。
- 旧功能线里存在重复路由和过渡性代码，需要逐项清理后才能进入主项目。

## 建议顺序

1. 先把当前本地工作区清理、提交并推送到 `MoKangMedical/eterna`。
2. 单独建一个迁移分支，从 `290fc10` 中择优迁入语音克隆接口和纪念服务数据。
3. 暂缓整体模块化重构，等现有单体 API 有稳定测试后再拆 `routers/`。
4. 依赖升级单独做，优先升级 `python-multipart`、`httpx`、`stripe`，每次升级后跑后端和视频链路回归。
5. 处理 GitHub 远端 URL 中明文 token 的安全问题，改用 GitHub CLI、credential helper 或 SSH。

## 最终判断

GitHub 上确实存在一些可回收能力，但它们主要在历史仓库的旧功能线中，不在当前 `eterna/main`。

最值得回收的是语音克隆和纪念服务模块；最不应该直接合并的是旧的整套前端和模块化后端替换。
