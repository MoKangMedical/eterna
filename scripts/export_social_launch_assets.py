#!/usr/bin/env python3
"""Export the social launch kit into operations-ready launch assets."""

from __future__ import annotations

import csv
import json
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlencode


ROOT = Path(__file__).resolve().parents[1]
KIT_PATH = ROOT / "creative" / "social-launch-kit-20260528.json"
CALENDAR_MD_PATH = ROOT / "docs" / "social-launch-calendar-20260528.md"
POSTING_CSV_PATH = ROOT / "docs" / "social-launch-posting-board-20260528.csv"
POSTING_JSONL_PATH = ROOT / "creative" / "social-launch-posting-board-20260528.jsonl"
DIGITAL_HUMAN_MD_PATH = ROOT / "docs" / "digital-human-promo-scripts-20260528.md"


def bullet_list(items: list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def numbered_lines(items: list[str]) -> str:
    return "\n".join(f"{index}. {item}" for index, item in enumerate(items, start=1))


def build_utm_url(base_url: str, source: str, campaign_id: str, content_id: str) -> str:
    query = urlencode(
        {
            "utm_source": source,
            "utm_medium": "social",
            "utm_campaign": campaign_id,
            "utm_content": content_id,
        }
    )
    return f"{base_url}?{query}"


def normalize_platform(value: str) -> str:
    return {
        "xiaohongshu": "小红书",
        "douyin": "抖音",
        "digital_human": "数字人",
    }.get(value, value)


def build_posting_rows(kit: dict) -> list[dict[str, str]]:
    campaign = kit.get("campaign", {})
    campaign_id = campaign.get("id", "eterna_launch")
    start = date.fromisoformat(campaign.get("start_date", "2026-06-01"))
    base_url = kit["landing_url"]
    rows: list[dict[str, str]] = []

    for index, post in enumerate(kit["xiaohongshu"]["posts"], start=1):
        content_id = f"XHS-{index:02d}"
        publish_date = start + timedelta(days=(index - 1) * 2)
        rows.append(
            {
                "content_id": content_id,
                "platform": "xiaohongshu",
                "publish_date": publish_date.isoformat(),
                "status": "draft_ready",
                "owner": "内容策划",
                "format": post["format"],
                "title": post["title"],
                "hook": post["hook"],
                "voiceover_or_body": " / ".join(post["outline"]),
                "shots_or_outline": " | ".join(post["outline"]),
                "cta": post["cta"],
                "compliance_label": kit["compliance_labels"][0],
                "primary_metric": "收藏率 / 搜索进站 / 私信咨询",
                "utm_url": build_utm_url(base_url, "xiaohongshu", campaign_id, content_id),
            }
        )

    for index, video in enumerate(kit["douyin"]["videos"], start=1):
        content_id = video["id"]
        publish_date = start + timedelta(days=index * 2 - 1)
        rows.append(
            {
                "content_id": content_id,
                "platform": "douyin",
                "publish_date": publish_date.isoformat(),
                "status": "draft_ready",
                "owner": "短视频剪辑",
                "format": f"{video['duration_seconds']} 秒短视频",
                "title": video["hook"],
                "hook": video["hook"],
                "voiceover_or_body": video["voiceover"],
                "shots_or_outline": " | ".join(video["shots"]),
                "cta": video["cta"],
                "compliance_label": video["label"],
                "primary_metric": "完播率 / 点击官网 / 留资",
                "utm_url": build_utm_url(base_url, "douyin", campaign_id, content_id),
            }
        )

    for index, topic in enumerate(kit["digital_human_promotion"]["video_series"], start=1):
        content_id = f"DH-{index:02d}"
        publish_date = start + timedelta(days=14 + index)
        rows.append(
            {
                "content_id": content_id,
                "platform": "digital_human",
                "publish_date": publish_date.isoformat(),
                "status": "script_ready",
                "owner": "数字人运营",
                "format": "数字人讲解短视频",
                "title": topic,
                "hook": f"{topic}，用 60 秒讲清楚。",
                "voiceover_or_body": build_digital_human_voiceover(topic, kit),
                "shots_or_outline": "念念引导员出镜 | 控制台录屏 | 功能要点字幕 | 合规片尾",
                "cta": "进入官网创建第一位亲人档案",
                "compliance_label": "AI 数字人讲解内容",
                "primary_metric": "主页访问 / 表单留资 / 控制台点击",
                "utm_url": build_utm_url(base_url, "digital_human", campaign_id, content_id),
            }
        )

    return sorted(rows, key=lambda row: (row["publish_date"], row["platform"], row["content_id"]))


def build_digital_human_voiceover(topic: str, kit: dict) -> str:
    return (
        f"大家好，我是{kit['digital_human_promotion']['avatar_name']}。"
        f"今天用一段很短的演示讲清楚：{topic}。"
        "念念会在获得授权后，把语音、照片、视频和回忆整理成数字家人控制台。"
        "请记住，这不是复活，也不是替代本人，而是让值得被保存的爱继续被听见、被看见。"
        "如果你也想为一位亲人建立档案，可以从一段 30 秒口述和三张照片开始。"
    )


def write_calendar_markdown(kit: dict, rows: list[dict[str, str]]) -> None:
    lines: list[str] = [
        f"# {kit['brand']} 社媒发布执行日历",
        "",
        f"版本：{kit['version']}",
        "",
        f"活动：{kit.get('campaign', {}).get('id', 'eterna_launch')}",
        "",
        f"落地页：{kit['landing_url']}",
        "",
        f"核心口号：{kit['core_message']}",
        "",
        "## 合规标识",
        "",
        bullet_list(kit["compliance_labels"]),
        "",
        "## 发布看板",
        "",
        "| 日期 | 平台 | 编号 | 标题/钩子 | 状态 | 负责人 | 核心指标 |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]

    for row in rows:
        lines.append(
            f"| {row['publish_date']} | {normalize_platform(row['platform'])} | {row['content_id']} | "
            f"{row['title']} | {row['status']} | {row['owner']} | {row['primary_metric']} |"
        )

    lines.extend(["", "## 小红书首批笔记", ""])
    for row in [item for item in rows if item["platform"] == "xiaohongshu"]:
        lines.extend(
            [
                f"### {row['content_id']} {row['title']}",
                "",
                f"- 发布日期：{row['publish_date']}",
                f"- 形式：{row['format']}",
                f"- 开头：{row['hook']}",
                f"- CTA：{row['cta']}",
                f"- UTM：{row['utm_url']}",
                f"- 合规标识：{row['compliance_label']}",
                "- 内容结构：",
                bullet_list(row["shots_or_outline"].split(" | ")),
                "",
            ]
        )

    lines.extend(["## 抖音首批短视频", ""])
    for row in [item for item in rows if item["platform"] == "douyin"]:
        lines.extend(
            [
                f"### {row['content_id']} {row['title']}",
                "",
                f"- 发布日期：{row['publish_date']}",
                f"- 形式：{row['format']}",
                f"- 旁白：{row['voiceover_or_body']}",
                f"- CTA：{row['cta']}",
                f"- UTM：{row['utm_url']}",
                f"- 标识：{row['compliance_label']}",
                "- 镜头：",
                bullet_list(row["shots_or_outline"].split(" | ")),
                "",
            ]
        )

    lines.extend(
        [
            "## 数字人宣传栏目",
            "",
            f"角色：{kit['digital_human_promotion']['avatar_name']}，{kit['digital_human_promotion']['role']}",
            "",
            "视觉规则：",
            bullet_list(kit["digital_human_promotion"]["visual_rules"]),
            "",
            "栏目：",
            bullet_list(kit["digital_human_promotion"]["video_series"]),
            "",
            "统一片尾：",
            "",
            f"> {kit['digital_human_promotion']['outro']}",
            "",
            "## 4 周执行节奏",
            "",
        ]
    )
    for item in kit["weekly_cadence"]:
        lines.extend(
            [
                f"### 第 {item['week']} 周：{item['goal']}",
                "",
                f"- 交付：{item['deliverables']}",
                f"- 指标：{item['metric']}",
                "",
            ]
        )

    CALENDAR_MD_PATH.parent.mkdir(parents=True, exist_ok=True)
    CALENDAR_MD_PATH.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def write_posting_board(rows: list[dict[str, str]]) -> None:
    POSTING_CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    POSTING_JSONL_PATH.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "content_id",
        "platform",
        "publish_date",
        "status",
        "owner",
        "format",
        "title",
        "hook",
        "voiceover_or_body",
        "shots_or_outline",
        "cta",
        "compliance_label",
        "primary_metric",
        "utm_url",
    ]
    with POSTING_CSV_PATH.open("w", encoding="utf-8-sig", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    with POSTING_JSONL_PATH.open("w", encoding="utf-8") as jsonl_file:
        for row in rows:
            jsonl_file.write(json.dumps(row, ensure_ascii=False) + "\n")


def write_digital_human_scripts(kit: dict, rows: list[dict[str, str]]) -> None:
    dh_rows = [item for item in rows if item["platform"] == "digital_human"]
    lines = [
        f"# {kit['brand']} 数字人宣传台本",
        "",
        f"角色：{kit['digital_human_promotion']['avatar_name']}",
        "",
        f"定位：{kit['digital_human_promotion']['role']}",
        "",
        "## 统一视觉规则",
        "",
        bullet_list(kit["digital_human_promotion"]["visual_rules"]),
        "",
    ]
    for row in dh_rows:
        lines.extend(
            [
                f"## {row['content_id']} {row['title']}",
                "",
                f"- 发布日期：{row['publish_date']}",
                f"- UTM：{row['utm_url']}",
                f"- CTA：{row['cta']}",
                f"- 合规标识：{row['compliance_label']}",
                "",
                "### 口播台本",
                "",
                row["voiceover_or_body"],
                "",
                "### 镜头顺序",
                "",
                numbered_lines(row["shots_or_outline"].split(" | ")),
                "",
                "### 统一片尾",
                "",
                kit["digital_human_promotion"]["outro"],
                "",
            ]
        )

    DIGITAL_HUMAN_MD_PATH.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    kit = json.loads(KIT_PATH.read_text(encoding="utf-8"))
    rows = build_posting_rows(kit)
    write_calendar_markdown(kit, rows)
    write_posting_board(rows)
    write_digital_human_scripts(kit, rows)
    print(CALENDAR_MD_PATH)
    print(POSTING_CSV_PATH)
    print(POSTING_JSONL_PATH)
    print(DIGITAL_HUMAN_MD_PATH)


if __name__ == "__main__":
    main()
