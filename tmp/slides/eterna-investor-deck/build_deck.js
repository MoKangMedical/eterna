"use strict";

const path = require("path");
const fs = require("fs");
const PptxGenJS = require("pptxgenjs");
const { calcTextBox, autoFontSize } = require("./pptxgenjs_helpers/text");
const { imageSizingCrop, imageSizingContain } = require("./pptxgenjs_helpers/image");
const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");
const { safeOuterShadow } = require("./pptxgenjs_helpers/util");

const ROOT = path.resolve(__dirname, "../../..");
const OUTPUT_DIR = path.join(ROOT, "output", "slides");
const OUT_PPTX = path.join(OUTPUT_DIR, "eterna-investor-deck-10p.pptx");
const OUT_JS = path.join(OUTPUT_DIR, "eterna-investor-deck-10p.js");
const POSTER = path.join(ROOT, "frontend", "assets", "eterna-demo-v2-poster.jpg");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "念念 Eterna";
pptx.subject = "Investor Deck";
pptx.title = "念念 Eterna 投资人 10 页路演版";
pptx.lang = "zh-CN";
const PPT_FONT = "Arial Unicode MS";

pptx.theme = {
  headFontFace: PPT_FONT,
  bodyFontFace: PPT_FONT,
  lang: "zh-CN",
};

const W = 13.333;
const H = 7.5;

const COLORS = {
  bg: "08111F",
  bg2: "0D1729",
  panel: "122136",
  panel2: "17263D",
  line: "28425F",
  text: "F6F4F1",
  muted: "B6C0CC",
  muted2: "8EA0B3",
  primary: "F3C4A1",
  primaryStrong: "F1A97B",
  teal: "8ED6D1",
  green: "95E0BA",
  red: "FF9696",
  white: "FFFFFF",
  darkText: "1A120D",
};

const FONTS = {
  head: PPT_FONT,
  body: PPT_FONT,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function addBg(slide, accent = "primary") {
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    line: { color: COLORS.bg, transparency: 100 },
    fill: { color: COLORS.bg },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -1.2,
    y: -0.6,
    w: 4.2,
    h: 2.8,
    line: { color: COLORS.primary, transparency: 100 },
    fill: { color: accent === "primary" ? COLORS.primaryStrong : COLORS.teal, transparency: 82 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10.2,
    y: 4.5,
    w: 3.5,
    h: 2.6,
    line: { color: COLORS.teal, transparency: 100 },
    fill: { color: accent === "primary" ? COLORS.teal : COLORS.primaryStrong, transparency: 84 },
  });
}

function addHeader(slide, eyebrow, title, subtitle = "") {
  slide.addText(eyebrow, {
    x: 0.62,
    y: 0.36,
    w: 2.7,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 9,
    color: COLORS.primary,
    bold: true,
    charSpace: 1.3,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.62,
    y: 0.68,
    w: 0.42,
    h: 0,
    line: { color: COLORS.primary, width: 1.25 },
  });
  const titleOpts = autoFontSize(title, FONTS.head, {
    x: 0.62,
    y: 0.86,
    w: 7.2,
    h: 0.7,
    fontSize: 25,
    minFontSize: 20,
    maxFontSize: 25,
    margin: 0,
  });
  slide.addText(title, {
    ...titleOpts,
    fontFace: FONTS.head,
    color: COLORS.text,
    bold: true,
    margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.62,
      y: 1.58,
      w: 6.5,
      h: 0.5,
      fontFace: FONTS.body,
      fontSize: 10.5,
      color: COLORS.muted,
      margin: 0,
      breakLine: false,
    });
  }
}

function addFooter(slide, page, tag = "Confidential") {
  slide.addShape(pptx.ShapeType.line, {
    x: 0.62,
    y: 7.02,
    w: 12.08,
    h: 0,
    line: { color: COLORS.line, width: 0.9, transparency: 15 },
  });
  slide.addText(`念念 Eterna | ${tag}`, {
    x: 0.62,
    y: 7.08,
    w: 3.8,
    h: 0.2,
    fontFace: FONTS.body,
    fontSize: 8.5,
    color: COLORS.muted2,
    margin: 0,
  });
  slide.addText(String(page), {
    x: 12.2,
    y: 7.04,
    w: 0.5,
    h: 0.2,
    fontFace: FONTS.head,
    fontSize: 8.5,
    color: COLORS.muted2,
    align: "right",
    margin: 0,
  });
}

function addCard(slide, x, y, w, h, fill = COLORS.panel, line = COLORS.line) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.12,
    fill: { color: fill, transparency: 3 },
    line: { color: line, transparency: 35, width: 1 },
    shadow: safeOuterShadow("000000", 0.18, 45, 2, 1),
  });
}

function addStat(slide, x, y, w, h, value, label, accent = COLORS.primary) {
  addCard(slide, x, y, w, h, COLORS.panel2);
  slide.addText(String(value), {
    x: x + 0.18,
    y: y + 0.16,
    w: w - 0.36,
    h: 0.38,
    fontFace: FONTS.head,
    fontSize: 22,
    bold: true,
    color: accent,
    margin: 0,
  });
  slide.addText(label, {
    x: x + 0.18,
    y: y + 0.62,
    w: w - 0.36,
    h: 0.35,
    fontFace: FONTS.body,
    fontSize: 9.5,
    color: COLORS.muted,
    margin: 0,
  });
}

function addBulletLines(slide, items, x, y, w, opts = {}) {
  const bulletColor = opts.bulletColor || COLORS.primary;
  const textColor = opts.textColor || COLORS.text;
  const fontSize = opts.fontSize || 11;
  const gapY = opts.gapY || 0.38;
  const circleSize = 0.08;
  items.forEach((item, idx) => {
    const yy = y + idx * gapY;
    slide.addShape(pptx.ShapeType.ellipse, {
      x,
      y: yy + 0.11,
      w: circleSize,
      h: circleSize,
      line: { color: bulletColor, transparency: 100 },
      fill: { color: bulletColor },
    });
    const box = calcTextBox(fontSize, {
      text: item,
      w: w - 0.18,
      fontFace: FONTS.body,
      margin: 0,
    });
    slide.addText(item, {
      x: x + 0.14,
      y: yy,
      w: w - 0.14,
      h: Math.max(0.24, box.h),
      fontFace: FONTS.body,
      fontSize,
      color: textColor,
      margin: 0,
      breakLine: false,
    });
  });
}

function addPill(slide, x, y, w, text, fill, textColor = COLORS.darkText) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.28,
    rectRadius: 0.1,
    line: { color: fill, transparency: 100 },
    fill: { color: fill },
  });
  slide.addText(text, {
    x,
    y: y + 0.05,
    w,
    h: 0.16,
    align: "center",
    fontFace: FONTS.body,
    fontSize: 8.5,
    bold: true,
    color: textColor,
    margin: 0,
  });
}

function addFlowNode(slide, x, y, w, h, title, body, accent, step) {
  addCard(slide, x, y, w, h, COLORS.panel2);
  addPill(slide, x + 0.16, y + 0.16, 0.78, `0${step}`, accent);
  slide.addText(title, {
    x: x + 0.16,
    y: y + 0.52,
    w: w - 0.32,
    h: 0.36,
    fontFace: FONTS.head,
    fontSize: 13.5,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  const box = calcTextBox(10, { text: body, w: w - 0.32, fontFace: FONTS.body, margin: 0 });
  slide.addText(body, {
    x: x + 0.16,
    y: y + 0.94,
    w: w - 0.32,
    h: box.h,
    fontFace: FONTS.body,
    fontSize: 10,
    color: COLORS.muted,
    margin: 0,
  });
}

function finalize(slide) {
  const filteredObjects = (slide._slideObjects || []).filter((obj) =>
    ["text", "image", "chart", "media", "line"].includes(obj.type)
  );
  const auditSlide = { ...slide, _slideObjects: filteredObjects };
  warnIfSlideHasOverlaps(auditSlide, pptx, { muteContainment: true, ignoreLines: true });
  warnIfSlideElementsOutOfBounds(auditSlide, pptx);
}

function slide1() {
  const slide = pptx.addSlide();
  addBg(slide, "primary");
  slide.addText("AI 亲人数字延续与家庭纪念服务", {
    x: 0.74,
    y: 0.52,
    w: 4.1,
    h: 0.24,
    fontFace: FONTS.body,
    fontSize: 10,
    color: COLORS.primary,
    margin: 0,
    bold: true,
  });

  const titleFit = autoFontSize("念念 Eterna", FONTS.head, {
    x: 0.74,
    y: 1.02,
    w: 5.4,
    h: 0.9,
    fontSize: 28,
    minFontSize: 22,
    maxFontSize: 30,
    margin: 0,
  });
  slide.addText("念念 Eterna", {
    ...titleFit,
    fontFace: FONTS.head,
    color: COLORS.text,
    bold: true,
    margin: 0,
  });

  const body = "把亲人的声音、记忆、面容和熟悉的关心方式，沉淀为一个可持续维护、会主动回应、可长期订阅的家庭数字陪伴服务。";
  const bodyBox = calcTextBox(12.5, { text: body, w: 4.8, fontFace: FONTS.body, margin: 0 });
  slide.addText(body, {
    x: 0.74,
    y: 2.0,
    w: 4.9,
    h: bodyBox.h,
    fontFace: FONTS.body,
    fontSize: 12.5,
    color: COLORS.muted,
    margin: 0,
  });

  addCard(slide, 0.74, 3.1, 4.85, 2.18, COLORS.panel2);
  slide.addText("投资判断", {
    x: 0.94,
    y: 3.3,
    w: 1.2,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 11,
    color: COLORS.primary,
    bold: true,
    margin: 0,
  });
  addBulletLines(
    slide,
    [
      "情感纪念赛道具备高信任门槛，适合年付订阅与家庭账户。",
      "项目已完成产品、收费与部署底座，进入小规模试运营窗口。",
      "若率先跑通“主动联系 + 付费留存”，可形成差异化壁垒。",
    ],
    1.0,
    3.68,
    4.25,
    { fontSize: 11, gapY: 0.48 }
  );

  slide.addImage({
    path: POSTER,
    ...imageSizingCrop(POSTER, 6.45, 0.58, 6.15, 5.95),
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.45,
    y: 0.58,
    w: 6.15,
    h: 5.95,
    rectRadius: 0.18,
    fill: { color: COLORS.bg, transparency: 100 },
    line: { color: COLORS.primary, transparency: 65, width: 1.2 },
  });

  addStat(slide, 6.8, 5.78, 1.72, 0.92, "B2C", "首阶段模式", COLORS.primary);
  addStat(slide, 8.7, 5.78, 1.9, 0.92, "¥800万-1,200万", "建议融资额", COLORS.teal);
  addStat(slide, 10.83, 5.78, 1.42, 0.92, "18个月", "验证周期", COLORS.green);
  addFooter(slide, 1, "Investor Preview");
  finalize(slide);
}

function slide2() {
  const slide = pptx.addSlide();
  addBg(slide, "teal");
  addHeader(
    slide,
    "Problem & Market",
    "用户缺的不是一个更聪明的 AI，而是一个更像亲人的回应入口",
    "需求本质是纪念、陪伴和传承三种家庭需求的叠加。"
  );

  const cards = [
    {
      title: "关系断点",
      body: "失去亲人之后，最痛的不是信息缺失，而是“再也没有那个熟悉的回应”。",
      accent: COLORS.primary,
    },
    {
      title: "工具割裂",
      body: "市场上已有语音克隆、照片动图和聊天机器人，但仍停留在单点工具层。",
      accent: COLORS.teal,
    },
    {
      title: "服务空白",
      body: "用户真正需要的是一项会长期陪伴、而非一次性生成的家庭纪念服务。",
      accent: COLORS.green,
    },
  ];

  cards.forEach((card, idx) => {
    const x = 0.74 + idx * 4.1;
    addCard(slide, x, 2.0, 3.62, 1.95, idx === 1 ? COLORS.panel2 : COLORS.panel);
    addPill(slide, x + 0.18, 2.2, 0.92, card.title, card.accent);
    slide.addText(card.body, {
      x: x + 0.18,
      y: 2.64,
      w: 3.2,
      h: 0.92,
      fontFace: FONTS.body,
      fontSize: 11,
      color: COLORS.text,
      margin: 0,
    });
  });

  slide.addText("市场口径采用自下而上的管理假设", {
    x: 0.74,
    y: 4.45,
    w: 3.5,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addStat(slide, 0.74, 4.8, 2.9, 1.25, "3,000万户", "TAM：具备纪念/陪伴/数字资产需求且可支付的家庭", COLORS.primary);
  addStat(slide, 3.92, 4.8, 2.9, 1.25, "300万户", "SAM：未来 3 年通过内容、私域、合作能触达的家庭", COLORS.teal);
  addStat(slide, 7.1, 4.8, 2.9, 1.25, "4.5万户", "SOM：3 年内争取到的付费家庭目标", COLORS.green);
  addCard(slide, 10.28, 4.8, 2.35, 1.25, COLORS.panel2);
  slide.addText("判断", {
    x: 10.5,
    y: 5.0,
    w: 0.8,
    h: 0.22,
    fontFace: FONTS.head,
    fontSize: 11,
    bold: true,
    color: COLORS.primary,
    margin: 0,
  });
  slide.addText("这是一个不需要亿级 DAU，也能成立的高价值订阅赛道。", {
    x: 10.5,
    y: 5.34,
    w: 1.9,
    h: 0.56,
    fontFace: FONTS.body,
    fontSize: 10.5,
    color: COLORS.text,
    margin: 0,
  });
  addFooter(slide, 2);
  finalize(slide);
}

function slide3() {
  const slide = pptx.addSlide();
  addBg(slide, "primary");
  addHeader(
    slide,
    "Product Flow",
    "念念的核心不是单点生成，而是把思念变成一条可反复回来的服务链路",
    "流程越完整，用户资料越多，数字分身越像，切换成本越高。"
  );

  addFlowNode(slide, 0.74, 2.05, 2.72, 1.9, "建档", "创建亲人档案，沉淀名字、关系、口头禅和关键回忆。", COLORS.primary, 1);
  addFlowNode(slide, 3.62, 2.05, 2.72, 1.9, "补素材", "上传语音、照片、视频，让声音、面容和神态逐步被还原。", COLORS.teal, 2);
  addFlowNode(slide, 6.5, 2.05, 2.72, 1.9, "对话陪伴", "根据素材完整度自动切换文字、语音、视频互动方式。", COLORS.green, 3);
  addFlowNode(slide, 9.38, 2.05, 2.72, 1.9, "主动联系", "在生日、节日和普通日常中主动问候，形成长期留存。", COLORS.primaryStrong, 4);

  [3.26, 6.14, 9.02].forEach((x) => {
    slide.addShape(pptx.ShapeType.chevron, {
      x,
      y: 2.7,
      w: 0.24,
      h: 0.44,
      line: { color: COLORS.primary, transparency: 100 },
      fill: { color: COLORS.primary },
    });
  });

  addCard(slide, 0.74, 4.46, 5.95, 1.82, COLORS.panel2);
  slide.addText("四层产品方法论", {
    x: 0.96,
    y: 4.68,
    w: 1.5,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(
    slide,
    [
      "记忆 Harness：把回忆、照片、语音、口头禅沉淀为人格底稿。",
      "互动 Harness：根据素材完整度动态开放文字、语音、视频模式。",
      "生命周期 Harness：把纪念从一次性行为升级为持续陪伴。",
      "传承 Harness：从个体纪念升级为家庭级数字资产。",
    ],
    1.02,
    5.08,
    5.4,
    { fontSize: 10.5, gapY: 0.33 }
  );

  addCard(slide, 6.96, 4.46, 5.63, 1.82, COLORS.panel);
  slide.addText("对投资人的含义", {
    x: 7.18,
    y: 4.68,
    w: 1.7,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(
    slide,
    [
      "真正的护城河不只是模型，而是流程、数据和信任三者叠加。",
      "随着档案、素材和主动联系累积，用户价值会持续上升。",
      "这更接近“家庭长期服务”，而不是一次性 AI 工具。",
    ],
    7.22,
    5.08,
    5.0,
    { fontSize: 10.5, gapY: 0.38, bulletColor: COLORS.teal }
  );
  addFooter(slide, 3);
  finalize(slide);
}

function slide4() {
  const slide = pptx.addSlide();
  addBg(slide, "teal");
  addHeader(
    slide,
    "Product Readiness",
    "项目已完成产品、收费和部署底座，当前处于“可试运营、未规模冷启动”的阶段",
    "这不是概念型项目，而是一个已经具备基础运营条件的早期产品。"
  );

  slide.addImage({
    path: POSTER,
    ...imageSizingContain(POSTER, 0.82, 1.98, 4.55, 4.45),
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.82,
    y: 1.98,
    w: 4.55,
    h: 4.45,
    rectRadius: 0.18,
    line: { color: COLORS.teal, width: 1, transparency: 30 },
    fill: { color: COLORS.bg, transparency: 100 },
  });

  addCard(slide, 5.72, 1.95, 6.85, 4.45, COLORS.panel2);
  slide.addText("代码库已体现的能力", {
    x: 5.96,
    y: 2.18,
    w: 2.1,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(
    slide,
    [
      "账号体系：注册、登录、会话管理。",
      "亲人档案：创建、查看、删除、权限隔离。",
      "回忆库：新增、查看、删除共同回忆。",
      "素材库：语音、照片、视频上传与基础分析。",
      "互动：文字、语音、视频三类模式编排。",
      "主动联系：每日/每周节奏、手动触发、电话桥接接口。",
      "收费：套餐体系、Stripe Checkout、Portal、Webhook 同步。",
      "部署：生产域名、systemd、Nginx、环境变量说明。",
    ],
    6.0,
    2.58,
    6.1,
    { fontSize: 10.4, gapY: 0.34, bulletColor: COLORS.green }
  );

  addStat(slide, 0.82, 6.02, 2.75, 0.88, "Ready for Trial", "适合进入小规模验证", COLORS.primary);
  addStat(slide, 3.74, 6.02, 3.05, 0.88, "0", "本地数据库真实用户数", COLORS.red);
  addStat(slide, 6.96, 6.02, 2.72, 0.88, "Next", "补齐授权与真实运营数据", COLORS.teal);
  addStat(slide, 9.86, 6.02, 2.72, 0.88, "Gap", "实时视频与合规流程需强化", COLORS.green);
  addFooter(slide, 4);
  finalize(slide);
}

function slide5() {
  const slide = pptx.addSlide();
  addBg(slide, "primary");
  addHeader(
    slide,
    "Business Model",
    "最清晰、最容易验证的收入模式，是围绕“陪伴深度”设计的家庭年度订阅",
    "建议先跑通年付订阅，再叠加增值服务和渠道合作。"
  );

  const plans = [
    { code: "Seed", name: "思念种子", price: "¥99", items: ["文字对话", "声音风格建模", "1 位亲人"], accent: COLORS.primary, featured: false },
    { code: "Tree", name: "思念之树", price: "¥299", items: ["多位亲人", "更多记忆容量", "生日提醒"], accent: COLORS.teal, featured: false },
    { code: "Garden", name: "思念花园", price: "¥599", items: ["视频陪伴", "完整纪念能力", "优先体验"], accent: COLORS.green, featured: true },
    { code: "Family", name: "思念家族", price: "¥999", items: ["家族传承", "高容量", "定制化服务"], accent: COLORS.primaryStrong, featured: false },
  ];

  plans.forEach((plan, idx) => {
    const x = 0.74 + idx * 3.07;
    addCard(slide, x, 1.96, 2.78, 3.15, plan.featured ? COLORS.panel2 : COLORS.panel);
    addPill(slide, x + 0.16, 2.16, 0.82, plan.code, plan.accent);
    slide.addText(plan.name, {
      x: x + 0.16,
      y: 2.52,
      w: 1.6,
      h: 0.28,
      fontFace: FONTS.head,
      fontSize: 13,
      bold: true,
      color: COLORS.text,
      margin: 0,
    });
    slide.addText(`${plan.price}/年`, {
      x: x + 0.16,
      y: 2.88,
      w: 1.5,
      h: 0.32,
      fontFace: FONTS.head,
      fontSize: 20,
      bold: true,
      color: plan.accent,
      margin: 0,
    });
    addBulletLines(slide, plan.items, x + 0.16, 3.42, 2.3, {
      fontSize: 10.2,
      gapY: 0.34,
      bulletColor: plan.accent,
    });
    if (plan.featured) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 1.48,
        y: 2.15,
        w: 1.02,
        h: 0.28,
        rectRadius: 0.08,
        line: { color: COLORS.primary, transparency: 100 },
        fill: { color: COLORS.primary },
      });
      slide.addText("主推", {
        x: x + 1.48,
        y: 2.21,
        w: 1.02,
        h: 0.14,
        fontFace: FONTS.body,
        fontSize: 8.5,
        align: "center",
        bold: true,
        color: COLORS.darkText,
        margin: 0,
      });
    }
  });

  addCard(slide, 0.74, 5.42, 5.9, 1.2, COLORS.panel2);
  slide.addText("收入逻辑", {
    x: 0.98,
    y: 5.66,
    w: 1.1,
    h: 0.22,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "早期只盯住家庭年付订阅，降低模式复杂度。",
    "价格锚点不是 SaaS 工具，而是家庭情感服务。",
    "用户购买的是纪念深度、陪伴深度和长期保存权。"
  ], 1.02, 6.02, 5.3, { fontSize: 10.4, gapY: 0.28, bulletColor: COLORS.primary });

  addCard(slide, 6.9, 5.42, 5.68, 1.2, COLORS.panel);
  slide.addText("中期扩展", {
    x: 7.14,
    y: 5.66,
    w: 1.1,
    h: 0.22,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "增值服务：声音纪念册、回忆影像、照片修复。",
    "渠道合作：纪念服务、家庭影像、养老与心理支持机构。"
  ], 7.18, 6.02, 5.1, { fontSize: 10.4, gapY: 0.34, bulletColor: COLORS.teal });
  addFooter(slide, 5);
  finalize(slide);
}

function slide6() {
  const slide = pptx.addSlide();
  addBg(slide, "teal");
  addHeader(
    slide,
    "Go To Market",
    "这不是适合粗放投流的项目，更适合用内容教育、真实故事和高意愿场景拿下第一批家庭",
    "核心打法是：高质量种子用户 -> 真实付费验证 -> 主动联系提升留存。"
  );

  addCard(slide, 0.74, 2.0, 5.55, 4.78, COLORS.panel2);
  slide.addText("三阶段增长路线", {
    x: 1.0,
    y: 2.24,
    w: 1.6,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });

  const phases = [
    ["验证需求", "品牌短片、产品故事页、用户访谈，先看用户是否愿意创建第一位亲人档案。", COLORS.primary],
    ["验证付费", "重点观察语音上传、回忆补齐和付费升级三类动作是否成立。", COLORS.teal],
    ["验证留存", "重点看主动联系是否能显著提升 30 天回访与续费。", COLORS.green],
  ];
  phases.forEach((phase, idx) => {
    const y = 2.76 + idx * 1.22;
    slide.addShape(pptx.ShapeType.line, {
      x: 1.16,
      y,
      w: 0,
      h: idx === phases.length - 1 ? 0.26 : 0.94,
      line: { color: COLORS.line, width: 1.2 },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 1.02,
      y: y + 0.02,
      w: 0.28,
      h: 0.28,
      fill: { color: phase[2] },
      line: { color: phase[2], transparency: 100 },
    });
    slide.addText(phase[0], {
      x: 1.5,
      y,
      w: 1.2,
      h: 0.22,
      fontFace: FONTS.head,
      fontSize: 12,
      bold: true,
      color: COLORS.text,
      margin: 0,
    });
    slide.addText(phase[1], {
      x: 1.5,
      y: y + 0.34,
      w: 4.25,
      h: 0.5,
      fontFace: FONTS.body,
      fontSize: 10.4,
      color: COLORS.muted,
      margin: 0,
    });
  });

  addCard(slide, 6.58, 2.0, 6.0, 2.2, COLORS.panel);
  slide.addText("推荐渠道组合", {
    x: 6.84,
    y: 2.24,
    w: 1.6,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "内容渠道：小红书、视频号、公众号、短视频平台。",
    "私域与口碑：家庭群、老用户推荐、微信社群。",
    "合作渠道：纪念服务、家族影像、家庭服务与心理支持合作方。"
  ], 6.86, 2.7, 5.35, { fontSize: 10.4, gapY: 0.42, bulletColor: COLORS.primary });

  addCard(slide, 6.58, 4.52, 6.0, 2.26, COLORS.panel2);
  slide.addText("经营上必须盯住的漏斗", {
    x: 6.84,
    y: 4.76,
    w: 2.0,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "访问 -> 建第一位亲人档案",
    "建档 -> 补至少 3 条回忆",
    "建档 -> 上传至少 1 段语音",
    "互动 -> 开通付费 -> 开启主动联系 -> 续费"
  ], 6.86, 5.18, 5.3, { fontSize: 10.4, gapY: 0.34, bulletColor: COLORS.green });
  addFooter(slide, 6);
  finalize(slide);
}

function slide7() {
  const slide = pptx.addSlide();
  addBg(slide, "primary");
  addHeader(
    slide,
    "Competition & Moat",
    "念念的竞争对手不是某一个模型，而是三类替代方案：通用 AI、单点生成工具、静态纪念服务",
    "胜负手在于：谁能成为家庭长期信任的“回应入口”。"
  );

  addCard(slide, 0.74, 2.0, 6.1, 4.72, COLORS.panel2);
  slide.addText("竞争定位矩阵", {
    x: 1.0,
    y: 2.24,
    w: 1.6,
    h: 0.22,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 1.5,
    y: 5.92,
    w: 4.55,
    h: 0,
    line: { color: COLORS.line, width: 1.4 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 1.5,
    y: 2.8,
    w: 0,
    h: 3.12,
    line: { color: COLORS.line, width: 1.4 },
  });
  slide.addText("长期服务", {
    x: 1.1,
    y: 2.86,
    w: 0.8,
    h: 0.22,
    rotate: 270,
    fontFace: FONTS.body,
    fontSize: 9,
    color: COLORS.muted,
    margin: 0,
  });
  slide.addText("一次性生成", {
    x: 1.06,
    y: 5.15,
    w: 0.9,
    h: 0.22,
    rotate: 270,
    fontFace: FONTS.body,
    fontSize: 9,
    color: COLORS.muted,
    margin: 0,
  });
  slide.addText("单点工具", {
    x: 2.18,
    y: 6.08,
    w: 1.0,
    h: 0.18,
    fontFace: FONTS.body,
    fontSize: 9,
    color: COLORS.muted,
    margin: 0,
  });
  slide.addText("平台化服务", {
    x: 4.84,
    y: 6.08,
    w: 1.1,
    h: 0.18,
    fontFace: FONTS.body,
    fontSize: 9,
    color: COLORS.muted,
    margin: 0,
  });

  const dots = [
    { x: 2.4, y: 4.9, label: "单点生成工具", color: COLORS.muted2 },
    { x: 3.1, y: 3.8, label: "通用 AI 聊天", color: COLORS.teal },
    { x: 4.1, y: 5.05, label: "静态纪念服务", color: COLORS.primaryStrong },
    { x: 5.15, y: 3.18, label: "念念 Eterna", color: COLORS.primary },
  ];
  dots.forEach((dot) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: dot.x,
      y: dot.y,
      w: dot.label === "念念 Eterna" ? 0.32 : 0.24,
      h: dot.label === "念念 Eterna" ? 0.32 : 0.24,
      fill: { color: dot.color },
      line: { color: dot.color, transparency: 100 },
      shadow: safeOuterShadow("000000", 0.2, 45, 1, 1),
    });
    slide.addText(dot.label, {
      x: dot.x + 0.3,
      y: dot.y + (dot.label === "念念 Eterna" ? 0.02 : -0.02),
      w: 1.4,
      h: 0.2,
      fontFace: FONTS.body,
      fontSize: dot.label === "念念 Eterna" ? 10.5 : 9.5,
      color: dot.label === "念念 Eterna" ? COLORS.text : COLORS.muted,
      bold: dot.label === "念念 Eterna",
      margin: 0,
    });
  });

  addCard(slide, 7.1, 2.0, 5.5, 4.72, COLORS.panel);
  slide.addText("护城河不在模型本身，而在三层叠加", {
    x: 7.36,
    y: 2.24,
    w: 3.5,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "流程护城河：建档、补素材、互动、主动联系形成完整闭环。",
    "数据护城河：回忆、语音、照片、视频与聊天历史具家庭私密性。",
    "信任护城河：只要品牌始终克制、可信，就更适合进入家庭情绪空间。",
    "经营护城河：年付订阅 + 高留存 + 口碑传播，更适合低频高质量增长。"
  ], 7.38, 2.78, 4.86, { fontSize: 10.6, gapY: 0.52, bulletColor: COLORS.primary });
  addFooter(slide, 7);
  finalize(slide);
}

function slide8() {
  const slide = pptx.addSlide();
  addBg(slide, "teal");
  addHeader(
    slide,
    "Financial Outlook",
    "在不追求极端规模的前提下，只要跑通年付订阅、付费升级和留存，业务就能形成健康单位经济",
    "以下均为经营假设，不代表已实现的历史收入。"
  );

  addCard(slide, 0.74, 1.98, 6.75, 4.82, COLORS.panel2);
  slide.addText("三年总收入预测（万元）", {
    x: 1.0,
    y: 2.22,
    w: 2.1,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "总收入",
        labels: ["Y1", "Y2", "Y3"],
        values: [100.3, 534.8, 2230.5],
      },
    ],
    {
      x: 1.0,
      y: 2.62,
      w: 5.95,
      h: 3.42,
      catAxisLabelFontFace: FONTS.body,
      catAxisLabelFontSize: 9,
      valAxisLabelFontFace: FONTS.body,
      valAxisLabelFontSize: 9,
      valAxisMinVal: 0,
      valGridLine: { color: COLORS.line, transparency: 50 },
      showLegend: false,
      showTitle: false,
      chartColors: [COLORS.primary],
      showValue: true,
      dataLabelColor: COLORS.text,
      dataLabelPosition: "outEnd",
      dataLabelFormatCode: "0.0",
      showCatName: false,
      showValAxisTitle: false,
      showSerName: false,
      showValueLabel: true,
      border: { color: COLORS.line, transparency: 100 },
    }
  );

  addCard(slide, 7.74, 1.98, 4.84, 2.28, COLORS.panel);
  slide.addText("关键经营假设", {
    x: 7.98,
    y: 2.22,
    w: 1.7,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "以年付订阅为主。",
    "套餐结构逐步向中高档迁移。",
    "增值服务从 Y2 开始贡献明显收入。"
  ], 8.0, 2.66, 4.2, { fontSize: 10.2, gapY: 0.38, bulletColor: COLORS.teal });

  addCard(slide, 7.74, 4.54, 4.84, 2.26, COLORS.panel2);
  slide.addText("单位经济目标", {
    x: 7.98,
    y: 4.78,
    w: 1.7,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "CAC 回收周期：9-12 个月。",
    "首年续费率目标：55%-65%。",
    "主动联系开启用户留存提升：15%-25%。",
    "Y3 综合毛利率目标：72% 以上。"
  ], 8.0, 5.22, 4.3, { fontSize: 10.2, gapY: 0.32, bulletColor: COLORS.green });

  addFooter(slide, 8);
  finalize(slide);
}

function slide9() {
  const slide = pptx.addSlide();
  addBg(slide, "primary");
  addHeader(
    slide,
    "Roadmap & Use Of Funds",
    "未来 18 个月，最关键的不是扩很多功能，而是把主链条跑通：建档 - 互动 - 主动联系 - 付费续费",
    "融资用途应优先服务于 PMF，而不是过早追求多线扩张。"
  );

  addCard(slide, 0.74, 2.0, 7.28, 4.8, COLORS.panel2);
  slide.addText("18 个月路线图", {
    x: 0.98,
    y: 2.24,
    w: 1.5,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });

  const roadmap = [
    {
      label: "0-3 个月",
      color: COLORS.primary,
      points: ["打通支付真实环境与订阅回写", "补齐授权、隐私与删除/冻结机制", "完成 30-50 个种子家庭访谈与内测"],
    },
    {
      label: "3-9 个月",
      color: COLORS.teal,
      points: ["获得 1,000-3,000 个注册家庭", "验证 300-800 个付费家庭", "验证主动联系对留存的提升"],
    },
    {
      label: "9-18 个月",
      color: COLORS.green,
      points: ["扩展家族传承与多人协作", "拓展到小程序或原生 App", "建立合作渠道销售模型"],
    },
  ];

  roadmap.forEach((phase, idx) => {
    const x = 1.04 + idx * 2.18;
    slide.addShape(pptx.ShapeType.line, {
      x: x + 0.64,
      y: 2.92,
      w: idx === roadmap.length - 1 ? 0 : 1.54,
      h: 0,
      line: { color: COLORS.line, width: 2 },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.48,
      y: 2.78,
      w: 0.32,
      h: 0.32,
      fill: { color: phase.color },
      line: { color: phase.color, transparency: 100 },
    });
    slide.addText(phase.label, {
      x,
      y: 3.26,
      w: 1.3,
      h: 0.22,
      align: "center",
      fontFace: FONTS.head,
      fontSize: 11.5,
      bold: true,
      color: COLORS.text,
      margin: 0,
    });
    addBulletLines(slide, phase.points, x, 3.72, 1.88, {
      fontSize: 9.7,
      gapY: 0.42,
      bulletColor: phase.color,
    });
  });

  addCard(slide, 8.3, 2.0, 4.28, 4.8, COLORS.panel);
  slide.addText("建议资金用途", {
    x: 8.54,
    y: 2.24,
    w: 1.6,
    h: 0.24,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });

  const funds = [
    ["产品与 AI 工程", 35, COLORS.primary],
    ["增长与内容运营", 25, COLORS.teal],
    ["合规与安全", 20, COLORS.green],
    ["用户成功与服务", 10, COLORS.primaryStrong],
    ["管理与预备金", 10, COLORS.muted2],
  ];
  let barY = 2.84;
  funds.forEach(([label, pct, color]) => {
    slide.addText(label, {
      x: 8.56,
      y: barY,
      w: 1.75,
      h: 0.18,
      fontFace: FONTS.body,
      fontSize: 9.5,
      color: COLORS.muted,
      margin: 0,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.56,
      y: barY + 0.24,
      w: 2.88,
      h: 0.18,
      rectRadius: 0.05,
      line: { color: COLORS.line, transparency: 100 },
      fill: { color: COLORS.line, transparency: 50 },
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.56,
      y: barY + 0.24,
      w: 2.88 * (pct / 100),
      h: 0.18,
      rectRadius: 0.05,
      line: { color, transparency: 100 },
      fill: { color },
    });
    slide.addText(`${pct}%`, {
      x: 11.62,
      y: barY + 0.12,
      w: 0.58,
      h: 0.18,
      fontFace: FONTS.head,
      fontSize: 9.5,
      bold: true,
      color: COLORS.text,
      margin: 0,
      align: "right",
    });
    barY += 0.74;
  });
  addFooter(slide, 9);
  finalize(slide);
}

function slide10() {
  const slide = pptx.addSlide();
  addBg(slide, "teal");
  addHeader(
    slide,
    "The Ask",
    "建议发起 800 万至 1,200 万元种子前/种子轮融资，用 18 个月完成 PMF 与首批付费家庭验证",
    "投资的核心逻辑是：用一轮资金，把“可被相信的情感科技服务”从产品原型推进到经营验证。"
  );

  addCard(slide, 0.74, 2.08, 3.48, 2.24, COLORS.panel2);
  slide.addText("融资建议", {
    x: 0.98,
    y: 2.34,
    w: 1.2,
    h: 0.22,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addText("¥800万-1,200万", {
    x: 0.98,
    y: 2.76,
    w: 2.2,
    h: 0.42,
    fontFace: FONTS.head,
    fontSize: 24,
    bold: true,
    color: COLORS.primary,
    margin: 0,
  });
  slide.addText("种子前 / 种子轮", {
    x: 0.98,
    y: 3.28,
    w: 1.8,
    h: 0.22,
    fontFace: FONTS.body,
    fontSize: 11,
    color: COLORS.muted,
    margin: 0,
  });

  addCard(slide, 4.5, 2.08, 3.92, 2.24, COLORS.panel);
  slide.addText("18 个月验收标准", {
    x: 4.76,
    y: 2.34,
    w: 1.8,
    h: 0.22,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "完成合规基础闭环",
    "建立稳定试运营产品",
    "获得首批真实付费家庭",
    "验证主动联系提升留存"
  ], 4.78, 2.76, 3.3, { fontSize: 10.5, gapY: 0.34, bulletColor: COLORS.teal });

  addCard(slide, 8.68, 2.08, 3.9, 2.24, COLORS.panel2);
  slide.addText("为什么现在投", {
    x: 8.94,
    y: 2.34,
    w: 1.5,
    h: 0.22,
    fontFace: FONTS.head,
    fontSize: 12,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  addBulletLines(slide, [
    "技术可用性已到达第一代产品门槛",
    "情感陪伴正从泛 AI 走向垂直场景",
    "家庭级信任入口一旦建立，壁垒远高于通用工具"
  ], 8.96, 2.76, 3.24, { fontSize: 10.2, gapY: 0.38, bulletColor: COLORS.green });

  addCard(slide, 0.74, 4.76, 11.84, 1.36, COLORS.panel);
  const closeText = "念念不是“复活亲人”的噱头产品，而是一个让纪念回到日常、让关系在数字时代被温和延续的长期服务。";
  slide.addText(closeText, {
    x: 1.06,
    y: 5.04,
    w: 11.2,
    h: 0.42,
    fontFace: FONTS.body,
    fontSize: 14,
    bold: true,
    color: COLORS.text,
    align: "center",
    margin: 0,
  });
  slide.addText("Contact | 念念 Eterna 项目组 | 2026-04-09", {
    x: 0.74,
    y: 6.42,
    w: 11.84,
    h: 0.2,
    fontFace: FONTS.body,
    fontSize: 9,
    color: COLORS.muted2,
    align: "center",
    margin: 0,
  });
  addFooter(slide, 10, "Funding Ask");
  finalize(slide);
}

async function main() {
  slide1();
  slide2();
  slide3();
  slide4();
  slide5();
  slide6();
  slide7();
  slide8();
  slide9();
  slide10();

  await pptx.writeFile({ fileName: OUT_PPTX });
  fs.copyFileSync(__filename, OUT_JS);
  console.log(`Wrote ${OUT_PPTX}`);
  console.log(`Copied source to ${OUT_JS}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
