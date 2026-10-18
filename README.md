# ToKnow

> ToKnow —— to know knowledge, to know yourself.

面向 2027 华中科技大学电气工程硕士考研的个人学习系统。名字有两层意思：既是你对知识的了解，也是你对自己的了解；应用本身也在持续了解你。P0 只做一件事：每天给你一条主线，并把完成情况记下来。

## 当前范围（P0）

- 首次引导：称呼、考试日期、每日可用时间、四科自评
- 目标树种子：数学一、英语一、政治、825 电气科学基础（电路 70 / 电磁场 40 / 电机 40）
- 规则版今日计划：一条主线 + 最多两条配套
- 任务完成与掌握度弱证据更新
- 每日打卡：睡眠、精力、心情、专注、一句话记录
- 日历：月网格、日详情、手动新建任务、拖拽改期、勾选完成、打卡标记
- 知识树查看：科目 → 模块 → 章节
- 本地备份：SQLite 副本 + JSON 导出

P0 **不包含**：AI、使用记录采集、做题工作台、错题、复习卡。这些在 P1–P3。

## 环境

- Node.js ≥ 22.12.0
- npm ≥ 10.8
- Windows 11（其他平台未验证）

## 开发

```bash
npm install
npm run dev
```

## 测试与类型检查

```bash
npm test
npm run typecheck
```

## 数据位置

Windows：`%APPDATA%/toknow/toknow.db`
备份：`%APPDATA%/toknow/backups/`

所有数据仅保存在本机，P0 不发起任何网络请求。

## 备份与隐私

在应用右上角齿轮进入「设置」，点击「导出备份」会同时生成两个文件：

- `.db`：完整的 SQLite 副本，包含每日打卡的一句话记录原文，仅供用户自己保管。
- `.json`：可读导出，其中每条 `dailyLogs[].note` 一律为 `null`，只保留睡眠、精力、心情、专注等数值字段。

也就是说，日记原文只留在本机的 `.db` 副本里，不会进入默认的 JSON 导出。P0 的规划器与 AI 边界同样不读取日记原文。

## 文档

- 设计：`docs/superpowers/specs/2026-10-18-personal-study-system-design.md`
- P0 计划：`docs/superpowers/plans/2026-10-18-mainline-p0.md`
- 开发日志：`docs/DEVLOG.md`（接手项目先读这里）
