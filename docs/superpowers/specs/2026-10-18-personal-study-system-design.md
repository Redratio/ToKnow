# ToKnow 个人学习系统 —— 设计文档

> **产品名（暂定）：ToKnow**。含义有两层：to know knowledge（对知识的了解）与 to know yourself（对自己的了解）；应用本身也在持续了解用户。文档中的“主线”是产品内的**每日唯一主线**机制，不是产品名。

- 日期：2026-10-18
- 状态：已评审通过（2026-10-18）
- 目标用户：备考华中科技大学电气工程学硕的单一用户（可扩展为多学习目标）
- 第一使用周期：2026 年 10 月 — 2026 年 12 月下旬初试

---

## 1. 背景与目标

用户需要一个**高度个人化、强导向、功能联动**的学习软件，同时承担两种角色：

1. **规划器**：知道考什么、还剩多少天、用户会什么/不会什么，每天给出唯一主线。
2. **知识来源**：错题总结、精选题、视频/文章总结、英语作文批改、专业课答疑。

软件还要：

- 自动采集本机使用记录（前台窗口、浏览器历史、学习内容识别）。
- 支持用户用自然语言记录“做了什么”，形成日历/时间轴，用于自我认知而非直接决策。
- 通过长期记录理解用户的能力、行为与状态，并做出可解释的应变。
- 框架稳定，能力可插拔；界面强大但不繁杂。

### 1.1 产品主张

这五条是所有功能取舍的准绳，任何新功能都必须至少强化其中一条，且不能破坏其余四条：

1. **强针对性**：只围绕用户的目标、考纲、薄弱点与时间预算，不做通用效率工具。
2. **强导向**：每天给出唯一主线，推荐可解释、可覆盖、可回滚，而不是把选择丢回给用户。
3. **深度了解**：知识状态、学习策略、动力状态、生理状态四层画像，证据优先于自评，且用户可见可纠正。
4. **人性化且可行**：低摩擦、不羞辱、可关闭、离线可用；不追求停留时长，不制造焦虑。
5. **科学基础**：检索练习、间隔、交错、反馈、元认知校准，以及自我决定理论、时间动机理论、执行意图等有证据的机制；对证据弱的做法明确说不。

### 1.2 非目标（第一版明确不做）

- 拍照/手写 OCR 录入（用户明确认为化简为繁）。
- 云端账号、多端同步（仅预留数据结构与同步出口）。
- 社交、排行榜、多人协作。
- 手机端原生 App。
- 自动抓取付费/受版权保护的题库内容。
- 用单条日记记录直接触发计划变更。

---

## 2. 考试事实（已联网核实）

### 2.1 初试科目

华中科技大学电气与电子工程学院电气工程学硕（080800）：

| 科目 | 代码 | 说明 |
|---|---|---|
| 思想政治理论 | 101 | 全国统考 |
| 英语（一） | 201 | 全国统考 |
| 数学（一） | 301 | 全国统考 |
| 电气科学基础 | 825 | 学校自命题，150 分 |

> 专硕（085801）部分方向为英二/数二，不适用于本用户。每年目录可能调整，以研招网与学院最新公告为准。

### 2.2 825 结构

- 总分 150 分，闭卷笔试 180 分钟。
- 三个模块：**电路理论 70 分 + 电磁场 40 分 + 电机学 40 分**。
- 题型以分析计算题为主，重视推导过程与数值求解。
- 2026 大纲在电机学模块的“直流电机”“变压器”部分有微调。

### 2.3 主干参考书

- 电路：颜秋容《电路理论·基础篇/高级篇》（第二版）；邱关源《电路》（第六版）补充题目；华科电路理论 MOOC。
- 电磁场：叶齐政、陈德智《电磁场》；冯慈璋/马西奎《工程电磁场导论》等作对照。
- 电机学：辜承林《电机学》（第四版）；熊永前《学习指导与习题解答》为主，其余教材对照。

### 2.4 目标树种子

目标树按“科目 → 模块 → 章节 → 知识点”四级生成：

- 数学一：高数、线代、概率论（按最新考试大纲章节）。
- 英语一：词汇、长难句、阅读、新题型、翻译、完形、写作。
- 政治：马原、毛中特、史纲、思修法基、时政。
- 825：电路（70）、电磁场（40）、电机（40）。

目标树是**带版本号的种子数据**，大纲变化时增量更新，不覆盖用户记录。

---

## 3. 设计原则

### 3.1 学习科学依据

| 原则 | 证据要点 | 产品落地 |
|---|---|---|
| 检索练习 | Dunlosky et al. (2013) 高效用；测试效应 d≈0.74 | 每个学习产物默认附带自测；任务类型优先“做题/回忆”而非“重看” |
| 间隔练习 | 间隔效应 d≈0.60；分散优于集中 | 复习队列按间隔调度，考前按剩余天数压缩 |
| 交错练习 | 元分析 g≈0.42；先分块后交错 | 数学题型混排；825 三模块轮转；新知识点先集中入门 |
| 反馈 | 测试必须带反馈，否则错误会固化为高置信误解 | 错题解析即时给出错因与正确解法 |
| 自我解释 | 中高效益 | AI 先问“你为什么这么想”，再给解析 |
| 元认知校准 | 学生常高估掌握度 | 任务前预测难度/正确率，任务后对比 |
| 刻意练习 | 在能力边缘练习，针对薄弱点 | 掌握度 2–3 的节点优先，而非已会或完全不会 |
| 掌握学习 | 达到阈值再进阶 | 前置节点未达标时提示风险，但允许用户强制跳过 |
| 理想难度 | 适度困难促进长期保持 | 提示阶梯：先提示→再步骤→最后答案 |

### 3.2 人性化与界面原则

- **一个主界面只做一件事**：默认页是“今日主线”，不是仪表盘。
- **每天最多 1 条主线 + 2–4 条辅助任务**，避免任务过载。
- **渐进披露**：首页只显示“现在做什么”，细节点开才出现。
- **不羞辱**：未完成不用红色警报；连续中断不归零；不用惩罚性 streak。
- **低摩擦**：记录一句话、打卡 30 秒、开始学习一次点击。
- **可解释**：每个推荐任务都能展开“为什么是它”。
- **用户掌控**：AI 只提议，采纳/编辑/丢弃由用户决定。
- **离线优先**：除 AI 与联网检索外，全部功能离线可用。

### 3.3 竞品取舍

| 参考项目 | 吸收 | 舍弃/规避 |
|---|---|---|
| Anki | SM-2 思路、间隔复习、检索卡 | 复杂牌组管理、沉重每日复习负担、陈旧界面 |
| Forest | 一键专注、轻量计时 | 游戏化依赖、无法覆盖电脑端、 novelty 衰减 |
| Sunsama | 早晨规划 + 晚间收尾的轻仪式 | 强制仪式、订阅成本、任务搬运负担 |
| Motion / Reclaim | 自动重排、保护专注块 | 黑箱排程、过度自动、用户不信任 |
| RescueTime / ActivityWatch | 本地优先、事件+心跳、采集与存储解耦 | 只统计不行动、隐私顾虑 |
| Notion / Obsidian | 知识库、双向链接、模板 | 空白页负担、配置成本 |
| Clew / NeuraLearn | 知识点 DAG、掌握度、路线图 | AI 生成前置依赖的幻觉、图谱不可控 |
| Khanmigo | 苏格拉底式提示、不直接给答案 | 过度绕弯导致挫败，需保留“直接看解析” |
| 番茄 ToDo / YPT | 低成本开始、学习时长可视 | 社交压力、以时长论英雄 |

---

### 3.4 用户数据分层与画像隔离

产品要“懂用户”，但不能把所有数据混成一个黑箱。用户相关数据分四层，每层有自己的写入来源、访问用途与隔离规则：

| 层 | 内容 | 典型来源 | 规划器 | AI | 界面 | 导出 |
|---|---|---|---|---|---|---|
| 知识层 | 目标树、节点状态、证据、做题表现 | 教材、真题、任务 | 完整 | 完整 | 完整 | 完整 |
| 行为层 | 前台窗口、时长、浏览记录、任务启动/切换 | 自动采集、任务事件 | 只用聚合 | 只用聚合 | 完整 | 默认脱敏 |
| 反思层 | 日记原文、一句话记录、自由文本 | 用户主动输入 | 禁止 | 禁止 | 完整 | 默认不含 |
| 画像层 | 特质、习惯、行为模式、知识画像快照 | 上述三层的派生 | 仅用户确认项 | 仅用户确认项 | 完整+来源 | 带来源与置信度 |

三条硬规则：

1. **派生数据必须有来源、置信度、样本量与时间窗。** 单个事件不能写成“用户就是这样的人”；低于最小样本量时标记 `insufficient_evidence`，只展示不断言。
2. **画像只用于“建议”，不用于“定罪”。** 任何画像结论都可由用户查看、纠正、删除；用户纠正后的版本优先于模型推断。
3. **隔离靠代码边界，不靠自觉。** 访问策略是纯函数 + Repository 分层；规划器只能拿到聚合接口，不能 import 原始事件/日记仓库。敏感域后续可拆到独立 SQLite 附件文件或字段级加密。

### 3.5 结构优先，AI 自然融入

AI 是产品主题之一，但不能成为用户必须主动去找的另一个目的地。正确的状态是：**结构让用户有方向，AI 在用户正在做的事情旁边自然出现**。两者都要，不能只剩任何一个。

- **核心对象有固定容器**：日历是月/周网格，任务是卡片，知识是树/网格，记录是时间块。用户不看说明也知道东西在哪里。
- **核心操作不依赖 AI**：新建任务、移动日期、打卡、勾选完成、查看知识树，都必须能直接完成。
- **AI 输出必须结构化**：自然语言解析后落到 `Task` / `TimeBlock` / `Artifact` / `ErrorItem` 等对象，先展示可编辑草稿，用户确认后才写入。
- **AI 不做独立门户**：不设“AI”主导航项，不把空白聊天页当首页。AI 是任务卡、知识节点、题目、错题旁边的一个动作。
- **AI 不改变骨架**：能力插件只能读写既有对象，不能临时发明新的主流程或新的页面层级。

这条原则适用于所有界面，不只是日历。每个场景都要先定义“东西放在哪、主操作是什么”，再决定 AI 在哪个决策点出现：

| 场景 | 固定结构 | 不依赖 AI 的直接操作 | AI 自然出现的位置 |
|---|---|---|---|
| 今日 | 1 张主线大卡 + 辅助任务列表 + 状态条 + 完成进度 | 开始、完成、换一个、锁定、标记卡住、打卡 | 主线卡上的“为什么是它”、卡住时的“拆一步”、底部的“一句话记录” |
| 日历 | 月网格 + 右侧日详情 | 点选日期、双击新建、拖拽改期、勾选完成、右键编辑/删除 | 日详情底部“一句话记录”，解析成可编辑草稿 |
| 知识树 | 树/网格 + 节点详情固定分区（掌握度/证据/资源/错题/产物） | 展开、搜索、切换视图、自评、跳转资源 | 节点详情里的“问我”“下一步学什么”，不改变树结构 |
| 做题工作台 | 题面 + 作答区 + 计时 + 卡点标记 + 固定复盘段落 | 上一题/下一题、暂停、标记卡住、提交、收藏 | 卡住时的提示、提交后的诊断、复盘后的追问 |
| 错题本 | 列表 + 筛选条 + 详情页 | 筛选、编辑、标记已掌握、安排复习 | 详情页的“根因分析”“生成变式题” |
| 知识库 | 列表/卡片 + 类型筛选 + 详情 | 新建、编辑、关联节点、搜索 | 新建时的“从材料生成草稿”、详情里的“总结/批改” |
| 设置 | 分区表单 | 全部设置项 | 选项旁的一句影响说明，不替用户改 |

**AI 融入的五条规则：**

1. **出现在动作旁边**：用户正在看主线、做题、改错时，AI 动作就在那张卡片/那道题下面；用户不需要先打开一个聊天窗口再描述上下文。
2. **一次只给一个建议**：默认展示一条最相关的建议或一个按钮，不铺开功能清单；更多能力收进“更多”。
3. **建议可忽略**：AI 输出是可选层，不阻断主流程，不弹窗催促；不采用时界面保持原样。
4. **上下文自动带上**：AI 自动知道自己正在处理哪个任务、哪个节点、哪道题，不让用户重复粘贴。
5. **无 AI 也完整**：断网、未配置模型、用户关闭 AI 时，所有核心结构照常工作，只隐藏 AI 动作。

**复杂度预算（防止结构压垮交互欲望）：**

- **每屏一个主操作**：首屏只保留一个最明显的下一步，次级操作不超过两个；其余放进详情、右键菜单或设置。
- **主导航不超过 3 项 + 1 个齿轮**：今日 / 日历 / 知识树；设置永远在右上角。
- **默认视图要浅**：打开就能看懂，不要求先配置筛选器、视图模式或参数；高级选项渐进展开。
- **新增能力挂在既有对象上**：优先给任务、节点、题目、错题加动作，而不是新增一级页面；确需新页面时，必须合并或移除一个旧入口。
- **三次点击原则**：第一次使用的用户，不读说明也能在 3 次点击内完成该页面的核心动作（开始任务、创建任务、打开节点、提交答案）。

交互层的四条硬规则：

1. **首屏回答“现在做什么”**：每个主界面第一屏必须有一个明确的主操作或唯一主线，不做需要用户自己找入口的仪表盘。
2. **直接操作优先**：点击、拖拽、勾选、右键菜单是主路径；聊天只处理“说不清、要生成”的部分。
3. **AI 入口位置固定且贴近上下文**：今日的快速记录、节点详情的“问我”、做题页的追问，位置稳定，但不做成覆盖结构的浮动聊天框。
4. **空状态给下一步**：没有任务、没有记录、没有错题时，显示一个具体的创建动作，而不是空白画布或泛泛的鼓励。

## 4. 产品结构

### 4.1 三个主界面

1. **今日**（默认）
   - 今日主线（1 条，大卡片）
   - 辅助任务（2–4 条）
   - 今日状态（自动数据 + 30 秒打卡）
   - 快速记录入口
2. **日历**
   - 默认月视图：7 列 × 5–6 行网格，一格一天
   - 日视图：时间轴 + 任务 + 打卡
   - 手动任务的新建、拖动改期、完成勾选
   - 周复盘、习惯洞察作为日历的次级标签，不单独占主界面
3. **知识树**
   - 目标树 / 个人树切换
   - 树状图与网格图两种视图
   - 节点详情：掌握度、证据、资源、错题、产物

设置通过右上角齿轮进入，不占主导航。次级入口：知识库（Artifacts）、错题本、题库/做题工作台、搜索/问答。

### 4.2 核心闭环

```
自动采集 + 手动记录
        ↓
状态与画像（能力/行为/状态）
        ↓
今日主线（规则 + 可选 LLM 重排）
        ↓
执行（资源、计时、标记卡住、自测）
        ↓
证据（完成质量、正确率、错因、时长）
        ↓
复盘与洞察（每日 30 秒 + 每周报告）
        ↓
更新掌握度与画像 → 回到主线
```

---

## 5. 功能范围

### 5.1 第一版（MVP，支撑本次考研）

- 学习档案与目标树（四科 + 825 三模块）。
- 入学自评 + 差距视图。
- 今日主线（规则引擎），任务可拖动/锁定/替换/标记卡住。
- 任务执行：资源打开、计时、完成度、自测。
- 每日 30 秒打卡与周复盘。
- 动力支持：主线理由、换一个/今天不做、2 分钟启动步、低能量模式、无惩罚连续记录。
- 每周 n-of-1 微实验（P1 起，最多同时 1 个）。
- 学习机制增强：FSRS 复习调度、元认知校准、连续再学习、开放式学习者模型、例题渐隐、根因诊断、讲给 AI 听、最小可行日、模考尸检。
- 做题工作台：限时/不限时/模考、分步作答、卡点计时、题后复盘、追问、多角色内部协同。
- 过程画像：TTFS、卡住比例、提示依赖、限时/不限时差距、验证率、信心偏差，可直接驱动计划。
- 日常记录：一句话输入 → 时间块/待办 → 日历。
- 自动采集：前台窗口、浏览器历史、空闲检测、学习内容识别（窗口标题/URL/文件名规则）。
- 知识库：Artifact 的创建、审阅、编辑、关联节点。
- AI 能力（首批）：错题解析、答疑、视频/文章总结、作文批改、精选题。
- PDF 导入 + 本地全文检索（FTS5）；基于用户资料的问答。
- 联网检索：带来源分级与引用，结果本地缓存。
- 间隔复习卡（轻量，不复制 Anki 的复杂度）。
- 数据导出/备份/清除。

### 5.2 第二版（初试后或稳定后）

- 向量检索/语义索引（第一版先用 FTS5 + 关键词 + LLM 重排）。
- 更细粒度的错因分类统计与个性化专项。
- 复试科目模板（电力电子、电力系统分析等）。
- 同步模块与多设备。
- 手机端快速记录（PWA 或轻量 App）。

### 5.3 明确砍掉

- OCR 拍照录入。
- 复杂游戏化（金币、宠物、排行榜）。
- 强制番茄钟与全屏锁定。
- 自动替用户做题/写作文（只做批改与提示）。
- 社交与公开分享。

---

## 6. 数据模型

所有表统一字段：

```
id            TEXT PRIMARY KEY   -- UUID v7
created_at    INTEGER            -- Unix ms
updated_at    INTEGER
deleted_at    INTEGER NULL       -- 软删除，为同步预留
device_id     TEXT               -- 预留
```

例外：`ActivityEvent` 是只追加的原始事件流，不设 `updated_at/deleted_at`，清理时整段删除。

### 6.1 学习结构

```
StudyProfile
  id, name, exam_date, daily_capacity_min, timezone, active

Subject
  id, profile_id, name, code, exam_weight, color

Module
  id, subject_id, name, exam_weight, order_index

KnowledgeNode
  id, module_id, parent_id, title, kind(chapter|section|point),
  exam_weight, difficulty, target_mastery, order_index,
  syllabus_version, description

NodePrerequisite
  node_id, prerequisite_node_id, strength(required|recommended)

Resource
  id, node_id, type(pdf|video|mooc|book|problem_set|note|url),
  title, locator, page_range, duration_min, priority

UserNodeState
  node_id, self_rating(0-5), mastery(0-5), confidence,
  last_studied_at, next_review_at, review_count,
  streak, updated_by(self|evidence|mixed)
```

### 6.2 任务与证据

```
Task
  id, profile_id, title, type(watch|read|practice|review|memorize|mock|write|other),
  planned_min, actual_min, due_date, scheduled_date,
  status(todo|doing|done|skipped|blocked),
  priority_score, is_mainline, source(manual|plan|llm|journal),
  locked, notes

TaskNode
  task_id, node_id, weight

StudySession
  id, task_id, node_id, started_at, ended_at,
  focus_score, interruptions, note

Evidence
  id, node_id, task_id, kind(task_done|quiz|error|recall|self_explain),
  performance(0-1), expected(0-1), weight, meta_json

ErrorItem
  id, node_id, source_type(textbook|exam|mock|ai|other),
  question_text, my_answer, correct_answer, solution,
  error_type(concept|calculation|reading|method|time|careless),
  difficulty, review_state, next_review_at

ReviewCard
  id, node_id, front, back, source_artifact_id,
  ease, interval_days, reps, lapses, due_at
```

### 6.3 状态与记录

```
DailyLog
  id, date, sleep_hours, energy(1-5), mood(1-5),
  focus_self(1-5), note, checkin_at
  UNIQUE(date)

JournalEntry
  id, raw_text, occurred_at, mood_tag, privacy(local_only|ai_allowed),
  parsed_status(pending|confirmed|failed)

TimeBlock
  id, entry_id, start_at, end_at, category, activity,
  confidence, linked_task_id, linked_node_id, source(manual|ai_parsed)

HabitInsight
  id, period_start, period_end, kind, statement,
  evidence_json, confidence, status(shown|accepted_as_soft_constraint|dismissed)
```

### 6.4 采集

```
ActivityEvent              -- 只追加，不修改
  id, ts, app, window_title, url, file_path,
  category, is_idle, collector_version

ActivitySession            -- 心跳合并后的时长片段
  id, start_at, end_at, app, title, url,
  category, task_id, node_id, attribution(rule|user|llm),
  confidence
```

### 6.5 知识产物与 AI

```
Artifact
  id, type(error_analysis|qa|summary|essay_review|problem_set|note|technique_card),
  title, node_id, status(draft|accepted|archived),
  body_md, structured_json, source_refs_json,
  model, prompt_version, created_by(ai|user),
  accepted_at

ArtifactNode               -- 一个产物可关联多个知识点
  artifact_id, node_id, weight

SourceRef
  id, artifact_id, url, title, domain, tier,
  fetched_at, credibility_score, snippet

ChatThread / ChatMessage   -- 问答与导师对话
  id, node_id, role, content, citations_json, created_at
```

### 6.6 计划与配置

```
Plan
  id, date, version, generated_by(rule|llm|mixed),
  input_snapshot_json, explanation, status(active|superseded)

PlanTask
  plan_id, task_id, rank, reason_json

Setting
  key, value_json, updated_at

SyncOutbox                 -- 预留：只写不发
  id, entity, entity_id, op, payload_json, created_at, synced_at
```

---

### 6.7 动力相关表

见 12.9：`MotivationSignal`、`MotivationProfile`、`InterventionLog`、`Intention`、`MicroExperiment`。字段遵循统一规范。

### 6.8 做题、题目与角色

```
Question
  id, source_type(textbook|exam|mock|ai|user), source_ref, year, exam,
  subject_id, module_id, stem_md, options_json, answer_md, solution_md,
  difficulty_elo, expected_min, common_errors_json, solution_tags_json,
  knowledge_nodes_json, content_hash, image_path, created_at

QuestionNode
  question_id, node_id, weight

ConceptCard
  id, node_id, title, definition_md, formulas_md, conditions_md,
  common_errors_json, prerequisites_json, source_ref, version

Attempt
  id, profile_id, question_id, mode(untimed|timed|module_timed|mock|review),
  started_at, ended_at, active_sec, paused_sec, total_sec,
  status(solved|partial|skipped|gave_up), answer_text, self_grade,
  score, confidence_pre(0-1), confidence_post(0-1),
  perceived_difficulty(1-5), error_types_json, stuck_reasons_json, note

AttemptEvent
  id, attempt_id, ts,
  type(read_start|first_step|stuck_start|stuck_end|hint_request|hint_shown|
       answer_submit|review_start|leave|return|followup),
  meta_json

StepRecord
  id, attempt_id, step_no, content_md, duration_sec, is_correct, error_type

HintLog
  id, attempt_id, level(1-3), content, requested_at, resolved_at, resolved_by

RoleProfile
  id, role(examiner|grader|coach|domain_expert|diagnostician|planner|synthesizer),
  subject, model_profile, prompt_version, knowledge_scope_json, enabled

RoleAnalysis
  id, question_id, attempt_id, role, subject, model, prompt_version,
  output_json, confidence, cache_key, created_at

FollowUp
  id, attempt_id, question, answer_md, citations_json, roles_used_json, created_at

ProcessProfile
  id, profile_id, period_start, period_end, ttfs_median, stuck_ratio,
  hint_dependency, timed_untimed_gap, verification_rate,
  error_type_distribution_json, confidence_bias, updated_at
```

### 6.9 用户画像、行为与习惯数据

这一节是 3.4 的落地表结构。原则：**原始事实与派生化画像分开存，派生结果永远带来源和置信度，反思层原文单独隔离。** P0 只实现其中的知识层与访问策略；P1 起逐步补齐行为层与画像层。

```
UserProfileSnapshot
  id, profile_id, version, generated_at,
  source_window_start, source_window_end,
  summary_json, confidence(0-1), user_confirmed,
  superseded_by, created_at

UserTrait
  id, profile_id, trait_key, value_json,
  confidence(0-1), source(observation|self_report|inference),
  sensitivity(low|medium|high),
  evidence_count, first_seen_at, last_seen_at,
  user_confirmed, user_corrected_value_json, updated_at

BehaviorPattern
  id, profile_id,
  pattern_type(start_latency|session_length|switch_frequency|
               procrastination_window|time_of_day_focus|interruption_rate),
  pattern_key, value_json, period_start, period_end,
  sample_size, confidence(0-1), user_confirmed, updated_at

HabitPattern
  id, profile_id, habit_key, description,
  schedule_json, strength(0-1), evidence_count,
  first_seen_at, last_seen_at, user_confirmed, updated_at

KnowledgeProfileSnapshot
  id, profile_id, subject_id, period_start, period_end,
  mastery_mean, weak_nodes_json, strong_nodes_json,
  error_distribution_json, process_profile_id,
  sample_size, confidence(0-1), generated_at

DerivedInsight
  id, profile_id, domain(behavior|habit|knowledge|motivation),
  insight_key, text, evidence_refs_json, confidence(0-1),
  user_confirmed, user_note, valid_from, valid_until, created_at
```

写入与更新规则：

- **画像快照按周生成**，不因单日波动重写；同一 `profile_id + period` 只保留一个当前版本，旧版本 `superseded_by` 指向新版本。
- **特质/习惯/行为模式的最小样本**：行为模式至少 5 次事件且跨 3 天；知识推断至少 3 次做题或任务证据；否则 `confidence=0` 且 `insufficient_evidence`，不参与规划。
- **来源优先级**：用户手动纠正 > 用户自评 > 多次行为证据 > 单次模型推断。
- **敏感度**：`sensitivity=high` 的特质（健康、情绪、作息）默认不进入 AI，除非用户逐项授权。
- **删除**：删除原始事件后，所有引用它的 `DerivedInsight` 标记 `stale` 并重新计算；用户删除画像项时硬删除并写审计日志（不含原文）。

访问策略（与 3.4 表一致，代码中为纯函数）：

```
domain          planning      ai            display   export
knowledge       full          full          full      full
behavior        aggregate     aggregate     full      redacted
reflection      none          none          full      none
derived_profile confirmed     confirmed     full      full
```

`aggregate` 表示只能读统计量（时长、次数、分布），不能读单条原始事件；`confirmed` 表示只读 `user_confirmed=1` 且 `confidence>=0.6` 的画像项。

## 7. 模块架构

### 7.1 进程结构

```
Electron 渲染进程 (React + TS)
  ├─ 今日
  ├─ 知识树（React Flow / SVG 网格）
  ├─ 记录（日历/时间轴）
  ├─ 知识库 / 错题本
  ├─ 报告
  └─ 设置
        │ typed IPC
主进程
  ├─ AppShell（窗口、托盘、开机自启、全局快捷键）
  ├─ DbService（SQLite + migrations + Repository）
  ├─ CollectorService（窗口、浏览器、空闲）
  ├─ IngestService（PDF、视频字幕、FTS 索引）
  ├─ KnowledgeService（树、掌握度、差距、复习调度）
  ├─ PlanService（规则引擎、约束、LLM 排程）
  ├─ ProblemService（题库、作答、计时、卡点、过程画像）
  ├─ RoleOrchestrator（角色路由、缓存、预算、冲突消解）
  ├─ ResearchService（搜索适配器、抓取、可信度）
  ├─ AIService（模型适配、能力注册、结构化校验）
  └─ SyncOutbox（预留）
```

### 7.2 稳定内核与扩展点

稳定内核（不随功能变化）：

```
StudyProfile → Subject → Module → KnowledgeNode
KnowledgeNode ↔ {Resource, Task, Artifact, ErrorItem, Evidence, ReviewCard}
DailyLog, JournalEntry, TimeBlock, ActivityEvent
```

扩展点：

- `Capability`：AI 能力插件（输入/输出 Schema、上下文白名单、产物类型）。
- `Collector`：采集器接口（start/stop/health）。
- `TreeTemplate`：知识树模板导入/导出（JSON/YAML）。
- `ModelAdapter`：OpenAI 兼容接口，可切供应商。
- `SearchAdapter`：Tavily / Serper / Bing / 模型内置联网。
- `SyncAdapter`：未来同步实现。

**约束**：任何扩展只能读写稳定内核中的标准对象，不得新增核心表或改变主流程。

### 7.3 Repository 与同步预留

- 所有写操作经过 Repository，统一写 `SyncOutbox`。
- 第一版不实现任何网络同步，`SyncOutbox` 只积累。
- 未来同步只需实现 `SyncAdapter` 与冲突解决，不改业务代码。

---

## 8. 关键算法

### 8.1 任务优先级

```
priority =
    exam_weight            // 考纲/分值权重，来自目标树
  × weakness               // 1 - mastery/5
  × urgency                // 1 + (90 - days_left)/90，下限 1
  × forgetting             // exp(-days_since_review / stability)
  × error_pressure         // 1 + 0.3 × 近 14 天该节点错题率
  × state_fit              // 与当前精力/时段的匹配度，0.7–1.2
```

约束（硬性）：

- 每日总时长 ≤ `daily_capacity_min`。
- 前置节点未达标时，标记风险；用户可强制跳过。
- 科目配额：数学与英语每日至少 1 项；825 三模块按 70/40/40 权重轮转。
- 政治阶段默认：10 月基础（马原/史纲）+ 选择题；11 月强化 + 时政；12 月背诵冲刺。可在设置中改为自定义阶段。
- 每日 1 条主线，辅助任务 2–4 条。
- 精力 ≤ 2 时，不排新的高难任务；优先复习/基础题。
- 新知识点先“分块”学习，掌握度 ≥ 2 后再进入交错练习。

### 8.2 掌握度更新

```
expected = mastery / 5
delta = performance - expected
mastery_new = clamp(mastery + α × delta, 0, 5)
```

- `α` 按证据类型：真题 0.35、普通练习 0.25、自测 0.2、看课完成 0.1、自评修正 0.15。
- 高置信证据（真题、限时模考）权重更高。
- `confidence` 随证据数量上升；证据 < 2 时，界面明确标注“依据不足”。
- 自评只在无证据时作为起点；有证据后以证据为主，自评仅作对照。

### 8.3 间隔复习（FSRS）

- 采用 FSRS（Free Spaced Repetition Scheduler）的 DSR 模型（难度/稳定性/可提取性），开源实现，替代 SM-2。
- 冷启动用默认参数；积累 ≥ 100 次复习后按个人历史优化参数。
- 初始间隔 1 天，上限 30 天；考前 14 天按剩余天数压缩。
- 复习卡只从“错题、自测错题、AI 生成的关键结论”产生，**不强制导入整本教材**。
- 若调度库不可用，回退到简化 SM-2，并在设置中标注。

### 8.4 差距计算

```
gap = target_mastery - current_mastery
```

- `target_mastery` 由考纲权重与题型要求决定：70 分模块的核心章节目标 4–5；40 分模块核心章节 3–4。
- 四类状态：`未接触 / 薄弱 / 待巩固 / 已具备`。
- “已具备”要求：自评 ≥ 4 且有至少 2 条证据，或真题正确率 ≥ 80%。

### 8.5 状态分

```
state_score = 0.35×sleep_norm + 0.25×energy + 0.2×focus_self + 0.2×completion_rate
```

- 仅用于调整任务难度和提示，不作为评价用户的分数展示。
- 连续 3 天低于阈值时，建议降载，而不是施压。

### 8.6 来源可信度

```
credibility = clamp(tier_weight × domain_history × cross_confirmation × recency, 0, 1)
```

- 层级：官方大纲/研招网/教材 1.0；名校公开课/真题解析 0.85；教育机构 0.7；论坛/自媒体 0.5。
- 事实性结论要求 ≥ 2 个独立来源；不足时标注“单一来源”。
- 用户“有用/不靠谱”反馈调整 `domain_history`。
- AI 生成内容与检索内容分库、分色标注。

### 8.7 排程的可解释性

每条主线任务保存 `reason_json`，可展开为用户可读的理由：

> “电路暂态部分占 70 分模块的高频考点；你的掌握度 2.1；上次学习已 9 天；近两周错题率 40%。”

LLM 只做约束内重排，必须返回同一结构，并通过 Zod 校验；校验失败则回退规则计划。

---

### 8.10 过程画像

```text
ttfs              = first_step_ts - start_ts
stuck_ratio       = Σ stuck_sec / active_sec
hint_dependency   = 使用提示的题数 / 作答题数
timed_gap         = median(不限时正确率) - median(限时正确率)
verification_rate = 主动检查的题数 / 作答题数
confidence_bias   = mean(confidence_pre - actual_correct)
```

- 各项按用户自己的历史计算 z 分数；不做人与人比较。
- 数据不足时返回“未知”，不用默认值假装画像。
- 过程画像直接进入规划器（做题数据不受日记防火墙限制），但每项都可展开证据、可纠正。

### 8.11 角色路由与预算

```text
roles      = route(intent, subject, question)
budget     = base_budget × difficulty_factor
cache_key  = hash(question) + attempt_signature + prompt_version
if cache hit: reuse
if budget exceeded: 降级为 Coach-only 或规则提示
if DomainExpert veto: 最终答案不得发布
```

- 提示只调用 Coach；提交判分调用 Grader + Domain Expert；追问按意图组合。
- 学科专家对正确性有一票否决；综合器必须标注不确定处。
- 角色分析按题目缓存，避免同一题重复消耗 token。

### 8.12 根因诊断

```text
root_cause = argmin mastery(p)
             p ∈ prerequisites(node)
             且 p 的证据覆盖足够
```

- 当某题反复卡住，沿 DAG 回溯前置节点，找“掌握度最低且有证据”的节点。
- 若证据不足，输出“可能的前置缺口”并请求一次诊断题，而不是直接下结论。
- 根因诊断结果进入 `Evidence`，生成补漏任务。

## 9. AI 能力插件

### 9.1 能力契约

```ts
interface Capability {
  id: string;
  name: string;
  inputSchema: ZodSchema;
  outputSchema: ZodSchema;
  contextPolicy: {
    nodeIds?: boolean;
    recentErrors?: boolean;
    materials?: boolean;
    userState?: boolean;
    journal?: false;        // 默认禁止读取日记原文
  };
  promptTemplate: string;
  modelProfile: 'fast' | 'reasoning' | 'long_context';
  writes: ('artifact' | 'error_item' | 'review_card' | 'task')[];
}
```

> 做题工作台的角色由 `RoleOrchestrator` 单独管理，不复用 `Capability` 注册表；两者共享 `ModelAdapter`、结构化校验与引用机制。Capability 面向“生成一个可审阅产物”，Role 面向“在一次作答中提供多视角判断”。

### 9.2 首批能力

| 能力 | 输入 | 输出 | 写入 |
|---|---|---|---|
| 错题解析 | 题目文本/图片路径（仅已有电子图）、我的答案 | 错因、步骤、正确解法、同类题、复习卡 | ErrorItem + Artifact + ReviewCard |
| 答疑 | 问题 + 可选节点/资料 | 分步提示、最终解答、引用、练习 | Artifact + ChatThread |
| 视频/文章总结 | 链接/字幕/粘贴文本 | 结构化笔记、节点映射、自测题 | Artifact + ReviewCard |
| 作文批改 | 题目 + 作文文本 | 分项评分、逐句修改、句型、重写 | Artifact + Task |
| 精选题 | 节点 + 难度 + 错因 | 3–5 题 + 解析（标注 AI 生成） | Artifact + Task |

### 9.3 交互原则

- **提示阶梯**：先给方向性提示 → 再给关键步骤 → 最后完整解析。用户可随时“直接看解析”。
- **先问后答**：答疑时先要求用户给出自己的思路（可跳过）。
- **产物审阅**：所有 AI 输出进入 `draft`，采纳后才影响掌握度。
- **引用**：事实性内容必须带 `SourceRef`；无来源时明确标注“模型推断”。
- **禁读日记**：`contextPolicy.journal` 默认 `false`，能力不得读取 `JournalEntry` 原文。

---

## 10. 采集与隐私

### 10.1 采集内容

- 前台窗口：每 1 秒轮询应用名与标题，连续相同心跳合并为会话。
- 空闲检测：系统空闲 > 5 分钟暂停计时，恢复后继续。
- 浏览器历史：读取 Chrome/Edge 历史库的**临时副本**（避免锁库），只取 URL、标题、访问时间。
- 学习内容识别：按窗口标题、URL、文件名规则映射到科目/节点；无法确定时进入“待归类”，由用户一次性确认。
- 不做：截图、键盘记录、剪贴板读取、麦克风、摄像头。

### 10.2 隐私边界

- 全部数据存本地 SQLite；除用户主动触发的 AI/检索请求外不联网。
- 默认排除敏感应用（密码管理器、银行、隐私浏览）；支持应用/域名黑名单。
- 一键暂停采集；托盘图标显示采集状态。
- 支持按日期范围导出、删除；删除为硬删除 + 清理 FTS 索引。
- AI 请求前显示“将发送哪些内容”的摘要；日记默认不发送。
- 做题时 AI 请求会发送题干、你的步骤、计时摘要与错因；发送前可预览。可关闭角色分析，只保留本地计时与复盘。
- 联网检索只发送查询词，不发送本地笔记全文，除非用户明确勾选。
- 用户画像与行为数据按 3.4 / 6.9 的分层访问策略隔离：规划器只读聚合，AI 只读用户确认项，日记原文永不进入规划或 AI。
- 导出默认排除日记原文与高敏感特质；用户可逐项勾选，导出文件带 `exported_at` 与来源说明。

### 10.3 归属与置信度

- 会话到任务/节点的归属优先级：用户手动 > 规则 > LLM 建议。
- 低置信度归属在界面显示为“待确认”，不自动计入掌握度证据。
- 用户修正一次后，规则学习该映射。

---

## 11. 日常记录与决策防火墙

### 11.1 输入与解析

一句话输入，AI 解析为：

- 一个或多个 `TimeBlock`（时间、活动、分类、置信度）。
- 可选 `Task`（识别到“明天/下午/要做”等意图）。
- 可选 `DailyLog` 备注（情绪/状态）。

交互：显示可编辑芯片，用户确认；时间模糊时只问一个问题。

### 11.2 日历/时间轴

日历是产品的主结构之一，不是“AI 记录的副产品”。默认先给用户一个真正的日历：

**月视图（默认）**

- 7 列（周一至周日）× 5–6 行；每格显示日期、任务数、完成比例、打卡圆点、时间块密度条。
- 今天高亮；非本月日期淡化但可点击。
- 单击选中日期，右侧打开当日详情；双击空白处新建任务；任务卡可在日期格之间拖动改期。
- 右键菜单：新建、编辑、移动、删除；键盘方向键切换日期，`Enter` 打开详情。

**日视图**

- 06:00–24:00 时间轴；自动采集会话灰色底，手动时间块按分类着色。
- 待办在上、时间块在下；完成勾选直接写回 `Task`。
- 手动记录优先于自动记录，自动记录保留为底稿，可一键“以手动为准”。

**AI 的位置**

- 顶部只放一个“快速记录”按钮：用户输入一句话，AI 解析为可编辑的 `TimeBlock` / `Task` 芯片，确认后写入。
- AI 不自动创建、不自动改期、不自动删除；所有写操作都要经过可见的确认。
- 没有 AI 时，月视图、日视图、任务新建/拖动/完成、打卡全部可用。

### 11.3 决策防火墙

- 规划器输入白名单：`DailyLog`、`Task`、`Evidence`、`ActivitySession` 聚合、`UserNodeState`。
- **禁止**读取 `JournalEntry.raw_text`。
- `HabitInsight` 默认只展示；用户可将某条显式设为“软约束”。
- 单条记录不触发任何计划变更；只有聚合趋势 + 用户确认才可进入规划。
- 代码层通过 `contextPolicy` 与查询白名单双重限制。

### 11.4 周复盘

- 时间分配（学习/运动/社交/娱乐/休息/睡眠）。
- 学习节律（高效时段、中断频率）。
- 输入型/输出型学习比例。
- 睡眠规律与次日专注的相关性（仅展示相关性，不宣称因果）。
- 洞察需要 ≥ 2 周数据，标注样本量与置信度。

---

## 12. 动力系统

> 动力不是性格标签，而是「任务 × 情境 × 当前状态」的函数。本节的目标不是让用户“更自律”，而是让开始更容易、进步可见、选择有意义。

### 12.1 设计立场

- 不把拖延道德化。拖延往往是情绪调节、任务模糊或反馈太远的结果，不是品格缺陷。
- 不采用可变奖励、损失厌恶、排行榜、羞辱性连续打卡。
- 不追求“把用户留在软件里”，而追求“让用户顺利离开去学习”。
- 所有建议可解释、可关闭、可覆盖。

### 12.2 诊断模型：四因子 + 三需要

借用时间动机理论（TMT）的结构作为诊断启发式，**不作为精确计算**：

```
动机 ≈ (期待 × 价值) / (冲动 × 延迟)
        × 自主 × 胜任 × 联结
```

| 维度 | 用户内心的问句 | 低/高时的表现 | 对应干预 |
|---|---|---|---|
| 期待 E | “我能做成吗？” | 打开就退出、回避某科、频繁标记卡住 | 降阶、例题、成功证据、提示阶梯 |
| 价值 V | “这对我重要吗？” | 完成但机械、跳过“为什么”、不愿多学一点 | 关联真题/分值/个人目标、给选择权 |
| 冲动 I | “我现在更容易被什么带走？” | 中断多、娱乐切换、拖延启动 | 一键开始、专注模式、环境摩擦、if-then |
| 延迟 D | “回报离我多远？” | 只在 deadline 前动、前期拖后期崩 | 近端子目标、即时反馈、可见产出 |
| 自主 A | “这是我选的吗？” | 频繁换任务/跳过、不信任推荐 | 等价选项、解释理由、自己定周目标 |
| 胜任 C | “我在变强吗？” | 投入多但掌握度不涨、自我怀疑 | 掌握度可视化、小胜、难度适配 |
| 联结 R | “有人理解我吗？” | 孤立感、状态差时消失 | 支持性语言、可选的同伴/复盘对象 |

证据依据：自我决定理论元分析显示，胜任感是内在动机最强的预测因素（ρ≈.58），自主感次之，联结感作用较小但在线学习与坚持度上仍重要。因此产品优先级是 **胜任感 > 自主感 > 联结感**，而不是反过来做社交。

### 12.3 六种“当前阻力”画像

画像不是固定人格标签，而是**当前两周的主要阻力**；默认只显示行为描述，不显示类型名。置信度不足时不展示。

| 画像 | 典型信号 | 内部体验 | 针对性方法 | 禁止做法 |
|---|---|---|---|---|
| 意义缺失型（V 低） | 完成率高但自愿加练少；跳过“为什么”；对推荐无反馈 | “学了有什么用” | 把任务接到真题/分值/个人目标；展示该知识点在 825 中的位置；允许自选顺序 | 空泛鸡汤、强制打卡 |
| 信心不足型（E 低） | 打开后很快退出；自评低；回避某科；卡住标记多 | “我肯定做不出来” | 降到 60–80% 成功率；先例题后独立；展示过去同类成功；提示阶梯 | 一上来给难题、与他人比较 |
| 即时诱惑型（I 高 / D 长） | 中断频繁；娱乐切换多；deadline 前才启动 | “现在不想开始” | 一键开始；2 分钟启动步；专注模式；if-then；把大目标切到今日可见 | 依赖意志力、给长计划 |
| 情绪耗竭型（状态低） | 睡眠差、精力低、负面记录；中断后不回来 | “我已经落后了” | 低能量模式（复习/背诵/整理）；最小行动；自我关怀；回归仪式 | 补作业式惩罚、红色警告 |
| 自主抗拒型（A 低） | 频繁换任务/跳过；不信任推荐；计划完成率低 | “凭什么按它说的做” | 给 2–3 个等价选项；解释推荐理由；允许锁定；每周自定一个目标 | 强制唯一路径、黑箱排序 |
| 完美耗竭型（C 高但过度） | 任务超时；反复重做；无法结束 | “还不够好” | 时间盒；明确完成标准；允许“够好”；产出优先于完美 | 无限加码、用时长衡量质量 |

### 12.4 干预库（微干预，一次只用一个）

| 诊断 | 首选干预 | 备选 | 观察指标 |
|---|---|---|---|
| E 低 | 5 分钟启动步 + 例题 | 成功经验回放、难度降一档 | 开始率、5 分钟留存 |
| V 低 | “为什么是它”一句话 + 真题关联 | 自选顺序、真实工程情境 | 自愿加练率、相关性反馈 |
| I 高 | 一键开始 + 专注模式 | 可选网站/应用屏蔽、手机离开提示 | 中断次数、启动延迟 |
| D 长 | 近端子目标 + 即时反馈 | 可见产出（做完几题/几页） | 前期完成率、拖延天数 |
| A 低 | 等价选项 + 推荐理由 | 用户自定周目标、锁定任务 | 覆盖/跳过率、自主感评分 |
| C 低 | 掌握度可视化 + 小胜 | 难度适配、同伴作品（后期） | 掌握度增速、自评胜任 |
| 状态低 | 低能量模式 + 2 分钟规则 | 自我关怀话术、恢复计划 | 回归率、次日启动 |
| 完美型 | 时间盒 + 完成标准 | “够好”按钮、强制结束 | 超时率、任务关闭率 |

### 12.5 日常与每周动力循环

**早晨（≤1 分钟）**
- 只给 1 条主线 + 1 句理由 + 1 个“第一步”（小到不可能拒绝）。
- 提供“换一个 / 今天不做 / 我自己选”三个出口。

**执行中**
- 卡住 10 分钟 → 自动给一级提示，而不是直接答案。
- 检测到离开学习应用 → 不弹羞耻提醒，只提供“一键回到任务”。

**结束（30 秒）**
- “今天哪一步最容易开始？”
- “什么最阻碍你？”（选项化，写入 MotivationSignal）
- 完成后立刻显示“今天具体前进了什么”，而不是总时长。

**每周（5 分钟）**
- 更新阻力画像与置信度。
- 只做 **1 个 n-of-1 微实验**（见 12.7）。
- 让用户自己定下周一个目标（自主支持）。

### 12.6 语言风格规范（自主支持型）

- 给选择：“你可以先做 A，也可以先做 B。”
- 给理由：“因为这部分在 825 里占分高，而且你上次错在同一个点。”
- 承认感受：“今天精力低，做点轻的是合理的。”
- 归因于策略，不归因于人格：“这个方法不合适，换一个”，不说“你就是不自律”。
- 不用控制性词汇：必须、应该、你又、别人都。
- 不展示排名，不制造落后焦虑；倒计时低调显示。

### 12.7 n-of-1 个人微实验

每周只验证一个假设，避免“什么都改”：

```
假设：晚饭后先做 10 分钟电路，能降低启动延迟
干预：if 晚饭结束，then 打开今日主线做 10 分钟
指标：计划展示 → 实际开始的时间
周期：7 天
结论：keep / drop / inconclusive（样本不足）
```

- 基线来自前 1–2 周同类任务。
- 结论写入 `MicroExperiment`，有效则保留为默认策略，无效则停止。
- 同一时间最多 1 个实验；不叠加。
- 这是“科学性”落到个人层面的关键：不套用群体结论，用用户自己的数据验证。

### 12.8 度量：看“开始与回归”，不看总时长

| 指标 | 含义 | 目标方向 |
|---|---|---|
| 启动延迟 | 计划展示 → 点击开始 | 下降 |
| 5 分钟留存 | 开始后坚持 5 分钟的比例 | 上升 |
| 任务完成率 | 完成 / 计划 | 上升 |
| 中断后回归率 | 中断当天或次日是否回来 | 上升 |
| 自评胜任感 | 每周 1 题 | 上升 |
| 自主感 | 每周 1 题 | 上升 |
| 放弃原因分布 | 卡住/没时间/不想做/太难 | 用于诊断，不用于考核 |

明确不以“学习总时长”作为主指标，避免用时长替代效果。

### 12.9 数据模型

```
MotivationSignal
  id, date, kind(initiation_latency|abandon_reason|distraction|energy|
                self_efficacy|autonomy|value),
  value, source, meta_json

MotivationProfile
  id, period_start, period_end,
  primary_bottleneck, secondary_bottleneck, confidence,
  evidence_json, user_note

InterventionLog
  id, profile_id, diagnosis, intervention_id,
  shown_at, accepted, outcome_json

Intention
  id, cue, action, active, success_count, last_used_at

MicroExperiment
  id, hypothesis, intervention_id, metric,
  baseline_json, start_date, end_date,
  result, decision(keep|drop|inconclusive)
```

画像计算使用**用户自己的历史基线（z 分数）**，不做人与人比较；数据不足时返回“未知”，不强行贴标签。

### 12.10 伦理边界

- 透明：任何建议都能展开“为什么”。
- 可关闭：动力提示、画像、微实验均可关闭。
- 不制造焦虑：不每日推送“你落后了”；不做倒计时弹窗。
- 不利用损失厌恶：连续记录有宽限，不扣分、不清零。
- 不伪装社交：AI 明确标注为 AI，不模拟真人陪伴。
- 数据只用于支持用户，不用于推送、变现或诱导停留。
- 不做心理诊断：持续两周以上的显著低落、失眠或焦虑，提示寻求专业帮助，不给出医学结论。

### 12.11 功能映射

| 功能 | 心理机制 | 证据/理论 |
|---|---|---|
| 今日唯一主线 | 清晰目标、降低选择负荷 | 目标设置理论、心流 |
| “为什么是它” | 价值与相关性 | 期望-价值理论 |
| 换一个 / 今天不做 | 自主支持 | 自我决定理论 |
| 2 分钟启动步 | 降低启动阈值 | 行为模型、TMT |
| 难度自适应 | 胜任感与心流 | 最近发展区、心流 |
| 掌握度可视化 | 胜任感、自我效能 | Bandura 自我效能 |
| 专注模式 | 降低冲动与延迟折扣 | TMT |
| if-then 计划 | 执行意图 | Gollwitzer 等，效应小到中等 |
| 低能量模式 | 情绪调节、自我关怀 | 拖延的情绪调节观点 |
| 无惩罚连续记录 | 避免控制性动机 | 自我决定理论 |
| 提示阶梯 | 支架式教学、胜任感 | 认知负荷、辅导系统研究 |
| 周复盘 + 微实验 | 元认知与个人化验证 | 自我调节学习、n-of-1 |
| 做题工作台 | 过程证据、即时反馈、考试条件匹配 | 测试效应、认知负荷、迁移 |
| 卡点计时与复盘 | 元认知监控、自我调节 | 自我调节学习 |
| 多角色校验 | 反馈质量、减少错误 | 智能辅导系统研究 |
| 模考尸检 | 考试条件匹配、错误分类 | 测试效应、迁移 |

## 13. 做题工作台与人机协同

### 13.1 为什么需要独立界面

做题发生在纸上、PDF 里、题库里，与应用是物理隔离的。传统软件只记录“做完了/没做完”，丢掉了最有价值的过程：

- 卡在哪一步、卡了多久
- 第一次动笔前想了多久
- 用了提示没有、用到第几级
- 是概念不会、计算错、审题错，还是方法想不到
- 限时和不限时差多少
- 做完有没有验证

工作台的目标：**让做题过程成为一等数据，并直接进入学习画像与计划决策**。这与日记的“只理解、不决策”相反：做题数据是证据，允许直接驱动决策，但必须对用户可见、可纠正。

### 13.2 工作台形态

**全屏专注模式（Desk Mode）**，从任务、题库、PDF 进入，不占一级导航。

```
┌──────────────────────────────────────────────────────────────┐
│ 825 · 电路 第 3 题    [限时 12:00]   ⏸ 暂停   ⤢ 全屏   ✕ 退出 │
├───────────────────────┬──────────────────────┬───────────────┤
│ 题目 / PDF 资料        │ 作答区               │ 工具           │
│                       │  □ 步骤 1            │ 计时           │
│  （可框选、缩放）      │  □ 步骤 2            │ 草稿纸         │
│                       │  + 添加步骤          │ 公式面板       │
│                       │                      │ 标记 / 卡住    │
├───────────────────────┴──────────────────────┴───────────────┤
│ [卡住了] [提示] [标记待复盘] [跳过]              [提交]        │
└──────────────────────────────────────────────────────────────┘
```

- 左侧资料区可折叠；中间作答区最宽；右侧工具区可隐藏。
- 顶部只保留：题号、模式、计时、暂停、全屏、退出。
- 底部只保留 5 个动作，避免选择过载。
- 所有面板可键盘操作。

**纸张模式**（在纸上做题时）：
- 大计时器 + 4 个大按钮：开始、卡住、继续、完成。
- 不要求 OCR；完成后 30 秒补录：答案、自评、错因、卡点步骤。
- 可附一张照片作为证据，但不解析。
- 迷你 HUD（置顶小窗）可常驻在 PDF/视频旁边，只显示计时和“卡住/提示/下一题”。

### 13.3 计时与模式

| 模式 | 用途 | 规则 |
|---|---|---|
| 不限时 | 学习、诊断、首次接触 | 默认；记录 active time，不制造时间压力 |
| 单题限时 | 训练速度与决策 | 到时提示，可继续；记录超时 |
| 模块限时 | 825 单模块（电路/电磁场/电机） | 按分值建议时间 |
| 全真模考 | 180 分钟整卷 | 到时强制交卷；交卷后尸检 |
| 复习模式 | 错题/复习卡 | 短时、可跳过、不记超时 |

计时粒度由事件推断，用户也可一键标记：

```
reading → first_step → solving → stuck → hint → solving → submit → review
```

关键指标：

- **TTFS**（首次动笔时间）：读题到第一次写/输入
- **stuck_ratio**：卡住时长 / 有效作答时长
- **hint_dependency**：使用提示的题数 / 总题数
- **timed_gap**：限时与不限时的正确率差
- **verification_rate**：主动检查的题数 / 总题数
- **confidence_bias**：平均信心 - 实际正确率

### 13.4 卡点记录与分析

**卡住的判定**（三者结合，避免误判）：

1. 用户显式点击“卡住了”
2. 连续 90 秒无输入、无滚动、无步骤变化（阈值可配置，可关闭）
3. 反复回看同一区域（可选，按滚动/选区事件推断）

> 思考本来就需要安静，自动判定只作为提示，不打断；以用户显式标记为最高优先级。

**记录内容**：

- 卡住开始/结束时间、持续时长
- 当时进行到第几步
- 是否求助、提示层级、提示后是否解决
- 最终如何解决（自己想通/看提示/看解析/放弃）
- 题后 20 秒微问卷：做前信心、实际难度、错因、卡点原因

**错因分类**：

```
概念不清 / 计算错误 / 审题错误 / 方法不会 /
时间不够 / 验证缺失 / 状态影响 / 其他
```

**题后复盘**不是打分，而是三句话：

> 这题卡在：把受控源当成独立源处理
> 下次先做：先判断电路类型，再列方程
> 关联知识点：受控源、节点电压法

### 13.5 多角色 AI（内部）

UI 默认只显示一个助手。内部按“职能 × 学科”路由，不向用户暴露角色人格。

| 职能角色 | 职责 | 输出 | 模型档位 |
|---|---|---|---|
| 命题人 Examiner | 考点、陷阱、预期解法、难度 | 题目分析 | fast |
| 阅卷人 Grader | 分步给分、扣分点、部分分 | 评分与依据 | fast |
| 教练 Coach | 提示阶梯、苏格拉底追问 | 一级/二级/三级提示 | fast |
| 学科专家 Domain Expert | 正确性、替代解法、边界条件；**有否决权** | 校验结论 | reasoning |
| 诊断师 Diagnostician | 错因、根因、前置缺口 | 诊断报告 | reasoning |
| 规划师 Planner | 本次尝试如何改变计划 | 计划增量 | fast |
| 综合器 Synthesizer | 合并、消解冲突、引用、面向用户输出 | 最终回答 | reasoning |

**学科变体**：数学、英语、政治、电路、电磁场、电机。每个角色在每个学科有独立的知识范围、prompt 版本与输出 Schema。例如：

- `examiner.825.circuit`：考什么、常见陷阱
- `grader.english.writing`：分项评分、逐句修改
- `domain_expert.electromagnetic`：公式适用条件、边界条件
- `diagnostician.math`：计算 vs 概念 vs 审题

**路由原则**：

```
求助提示   → Coach（必要时 Domain Expert 校验）
提交判分   → Grader + Domain Expert
追问       → Domain Expert + Coach + Diagnostician
计划调整   → Diagnostician + Planner
```

**冲突处理**：学科专家正确性 > 阅卷人评分 > 教练建议；综合器必须标注不确定处，不能强行统一。

**成本控制**：

- 按题目 hash 缓存角色分析；同一题不重复调用。
- 只运行必要角色；简单题跳过诊断师。
- 提示用 fast 模型；学科校验用 reasoning 模型。
- 每次尝试设置 token 预算；超预算降级为规则提示。
- 角色分析结果落库，形成可复用的题目知识库。

### 13.6 追问

提交后常驻输入框，提供建议问题：

- “我卡在哪一步？”
- “这题到底考什么？”
- “还有别的方法吗？”
- “为什么这一步成立？”
- “给我一道变式 / 更难的”
- “这题和哪些题像？”
- “如果考场上前 5 分钟没思路，我该怎么决策？”

追问自动带上完整上下文：题目、我的步骤、计时、卡点、提示记录、错因、关联知识点。回答必须引用题目/教材/来源；无法确定时明确说明。追问线程挂在 `Attempt` 上，进入知识库。

### 13.7 题库与题目元数据

- 来源：真题、教材习题、AI 生成（必须标注）、用户导入。
- 元数据：科目/模块/知识点、难度（Elo）、预期时长、常见错误、解法标签、变式链接、来源可信度。
- 去重：题目文本 hash + 相似度。
- AI 生成题单独统计，不混入真题正确率。
- PDF 题目可框选保存为“题目卡”（只存图 + 手动标题/标签，不做 OCR）。
- `ConceptCard`：每个知识点维护定义、公式、适用条件、常见错误、前置知识，供角色检索。
- 首版内置 825 三模块与数一/英一的核心概念卡骨架；可由教材/大纲导入扩充。
- 手写内容不做识别。印刷体题目若 PDF 无文本层，可手动粘贴题干；或在用户明确确认后把题目图片发给支持多模态的模型识别，此为可选能力，不属于手写 OCR。

### 13.8 消除物理隔离的具体设计

| 隔离场景 | 设计 |
|---|---|
| 在纸上做题 | 纸张模式：大计时 + 4 个按钮；完成后 30 秒补录；可附图 |
| 在看 PDF | 迷你 HUD 置顶；框选题目 → 一键开始；记录页码/题号 |
| 在看网课 | “做题提醒”不弹窗，只在任务卡显示；可一键进入工作台 |
| 不想切应用 | 全局快捷键：卡住、提示、下一题、暂停 |
| 中途离开 | 自动记录离开时长；回来给“继续/复盘”两个选项，不指责 |
| 忘了记录 | 每晚“做题回放”：时间轴 + 卡点 + 一句总结，可补录 |
| 手机在旁边 | v2：局域网二维码，手机当“卡住/提示”遥控器 |
| 思路一闪而过 | v2：语音速记，自动转成文字挂到当前题 |

### 13.9 界面风格：成熟、安静、低刺激

- 背景：暖纸色（浅色）/ 深墨色（深色），不用纯白纯黑。
- 题目正文：衬线字体（思源宋体/Noto Serif SC），18–20px，行高 1.8。
- UI：无衬线（Inter/思源黑体），14–16px。
- 单一强调色（深青或靛蓝）；警告用琥珀色，不用刺眼红。
- 计时器使用等宽数字；默认低对比度，需要时再突出。
- 动效 ≤ 150ms，只用于状态转换。
- 一屏只做一件事；可一键隐藏所有侧栏。
- 作答区：分步卡片、Markdown/LaTeX 预览、草稿纸、公式面板。
- 键盘快捷键：`Ctrl+Enter` 提交、`Ctrl+H` 提示、`Ctrl+S` 卡住、`Tab` 下一步骤。
- 不做积分、排行榜、动画奖励、倒计时恐吓。
- 无障碍：字号缩放、对比度 ≥ 4.5:1、全键盘操作。

### 13.10 数据模型

见 6.8：`Question`、`QuestionNode`、`Attempt`、`AttemptEvent`、`StepRecord`、`HintLog`、`RoleAnalysis`、`RoleProfile`、`ProcessProfile`、`FollowUp`、`ConceptCard`。

### 13.11 决策联动

`ProcessProfile` 直接进入规划器（做题数据不受“日记防火墙”限制，但用户可见、可纠正）：

| 过程信号 | 计划调整 |
|---|---|
| 限时正确率明显低于不限时 | 增加限时训练、模考频率 |
| 提示依赖高 | 逐步撤除提示，先独立尝试 |
| 计算错误占比高 | 插入计算专项与检查清单 |
| 审题耗时长 | 审题训练、关键词标注练习 |
| 验证率低 | 提交前强制 30 秒检查 |
| 信心偏差大 | 校准练习：先预测再作答 |
| 某前置节点反复导致卡住 | 根因诊断 → 补前置 |

证据权重：全真模考 > 限时练习 > 不限时练习 > 看解析。所有尝试都写入 `Evidence`，但只有实际作答（非纯看解析）才更新掌握度。

## 14. 界面与信息架构

### 14.1 导航

一级导航仅 3 项：`今日` / `知识树` / `记录`。
知识库、错题本、报告、设置收在二级入口或命令面板。
做题工作台是任务级的全屏模式，从今日任务、题库或 PDF 进入，不占一级导航。

### 14.2 今日页

```
┌────────────────────────────────────────────┐
│ 距初试 62 天        状态：正常    [开始学习] │
├────────────────────────────────────────────┤
│ 今日主线                                    │
│  电路 · 一阶电路暂态 ｜ 预计 90 分钟         │
│  为什么是它 ▾                               │
│  [开始]  [换一个]  [今天不做]                │
├────────────────────────────────────────────┤
│ 辅助任务                                    │
│  □ 英语阅读 2 篇（40 分钟）                  │
│  □ 电机学 变压器 复习卡（15 分钟）           │
├────────────────────────────────────────────┤
│ 快速记录：今天做了什么…                      │
└────────────────────────────────────────────┘
```

### 14.3 知识树

- 树状图：节点颜色 = 掌握度，大小 = 分值权重，外环 = 最近学习时间。
- 网格图：行 = 模块，列 = 章节，格子颜色 = 掌握度；适合快速扫薄弱区。
- 当前推荐路径高亮，未来 3 个节点显示“下一步”。
- 节点详情抽屉：掌握度、证据时间线、资源、错题、产物。

### 14.4 日历页

- **顶部**：月份切换（上一月 / 当前月 / 下一月）、“今天”按钮、月/周/日视图切换。
- **主体**：月视图为 7 列网格；每格是当天任务的容器，显示日期、任务数、完成比例、打卡点、时间块密度。
- **右侧面板**：选中日期的任务列表、打卡摘要、快速新建任务；面板可折叠，窄屏时变为底部抽屉。
- **直接操作**：单击选日、双击新建、拖动任务改期、勾选完成、右键编辑/删除；全部操作有即时反馈与撤销。
- **AI 入口**：只保留一个“快速记录”按钮，解析结果以可编辑芯片出现；没有 AI 也能完成所有日历操作。
- **底部/侧栏**：本周洞察与学习画像作为可折叠的次级标签，默认只显示行为描述，不显示类型标签。

### 14.5 视觉与交互

- 中性底色 + 每科一个主色；掌握度用单色渐变，不用红绿交通灯。
- 字号层级不超过 4 级；一屏不超过 3 个视觉焦点。
- 键盘优先：`Ctrl+K` 命令面板，`Ctrl+Shift+Space` 快速记录。
- 空状态给出下一步操作，不出现空白仪表盘。
- 动效仅用于状态转换，时长 ≤ 200ms。
- 无障碍：全部核心操作可键盘完成；正文对比度 ≥ 4.5:1；支持 100%–150% 字号缩放；颜色不作为唯一状态编码（掌握度同时显示数值）。

---

## 15. 错误处理

| 场景 | 策略 |
|---|---|
| 采集器崩溃 | 主进程监督重启；事件缓冲，恢复后补写 |
| 浏览器数据库被锁 | 复制到临时目录再读；失败则跳过本轮并提示 |
| AI 超时/限流 | 指数退避重试 2 次；失败回退规则计划或本地模板 |
| AI 返回非法 JSON | Zod 校验失败 → 修复重试 1 次 → 回退 |
| 断网 | 除 AI/检索外全部可用；队列中的请求标记待重试 |
| PDF 解析失败 | 标记资源不可索引，保留原文件，提示手动粘贴 |
| 视频无字幕/取不到字幕 | 提示粘贴字幕或文本；不下载视频、不做音频转写（第一版） |
| 数据库迁移失败 | 迁移前自动备份；失败回滚并保留备份 |
| 日期边界 | 以凌晨 4:00 为自然日切换，避免熬夜记录跨日 |
| 系统时钟变化 | 事件使用单调时钟 + 墙钟双记录，异常时提示 |
| 磁盘空间不足 | 提前预警；停止缓存抓取，保留核心数据 |

---

## 16. 测试策略

- **单元测试**：优先级公式、掌握度更新、间隔调度、差距计算、心跳合并、来源可信度、日记解析。
- **集成测试**：Repository、IPC、PDF 摄取、FTS 检索、计划生成与回退。
- **端到端测试**（Playwright）： onboarding → 生成主线 → 完成任务 → 掌握度变化 → 次日计划变化。
- **契约测试**：每个 Capability 的输入/输出 Schema；LLM 返回用固定夹具做回归。
- **隐私测试**：黑名单应用不产生事件；日记原文不出现在任何 AI 请求 payload 中。
- **动力测试**：数据不足时画像返回“未知”；不出现羞辱性/控制性文案（禁用词 lint）；微实验结论不因单日波动翻转；关闭动力模块后相关提示完全消失。
- **文案测试**：自主支持语言检查——推荐语必须包含理由；失败反馈必须归因于策略而非人格。
- **性能基线**：今日页首屏 < 1s；规则计划 < 200ms；采集器 CPU < 2%；常驻内存 < 200MB。
- **数据完整性**：软删除、导出/导入往返一致；迁移前后行数与校验和一致。
- **工作台测试**：计时漂移、卡点判定、离开/回归、模式切换、提交幂等。
- **角色测试**：路由正确、预算降级、缓存命中、学科专家否决、评分依据可追溯。
- **过程画像测试**：数据不足返回“未知”；限时/不限时差距计算正确；用户纠正后重算。

---

## 17. 分期与验收标准

> 备考优先：开发时间必须受限，P0 完成即开始日常使用，后续迭代不阻塞学习。
>
> 拆分原则：每个阶段都应能独立成为一份实现计划与可运行版本；阶段之间通过稳定内核衔接，不要求一次做完。

### P0 可用闭环（2–3 天）

- onboarding：考试日期、每日容量、四科自评。
- 目标树种子 + 树状图。
- 规则版今日主线 + 任务完成 + 每日打卡。
- 本地 SQLite、备份/导出。
- 验收：能在 10 分钟内完成设置并生成一份可执行计划；完成任务后掌握度与次日计划发生变化；今日页必须给出 1 条理由和 3 个出口（开始 / 换一个 / 今天不做）。

### P1 知识与记录（3–4 天）

- 快速记录 → 时间块/待办 → 日历。
- PDF 导入 + FTS 检索。
- 错题解析、答疑、产物审阅。
- 间隔复习卡（FSRS）。
- 做题工作台基础版：限时/不限时、分步作答、计时、卡点按钮、题后 20 秒复盘、追问。
- 元认知校准：做前预测、做后对比。
- 连续再学习：每日 5–10 分钟回顾。
- 最小可行日。
- 验收：一句话记录 ≤ 10 秒完成确认；AI 产物必须经采纳才影响掌握度；日记原文不进入规划输入；低能量模式可一键切换；周复盘给出 1 条阻力描述与 1 个待确认的微实验；开始作答 ≤ 2 次点击；卡点记录 ≤ 1 次点击；追问带完整上下文。

### P2 自动采集（3–4 天）

- 窗口采集、空闲检测、浏览器历史、会话归属。
- 记录页合并展示自动与手动数据。
- 过程画像与计划联动。
- 多角色内部协同（Coach / Grader / Domain Expert / Diagnostician）+ 题目分析缓存。
- 纸张模式与迷你 HUD；PDF 框选开始做题。
- 开放式学习者模型（可查看/纠正证据）。
- 根因诊断。
- 例题渐隐、讲给 AI 听。
- 验收：黑名单应用零记录；归属可一键修正；采集器异常不影响主程序；角色调用有预算与缓存；学科专家可否决错误答案；过程画像每项可展开证据；纸张模式补录 ≤ 30 秒。

### P3 智能与联网（3–4 天）

- LLM 计划重排（约束内）+ 可解释理由。
- 联网检索 + 来源分级 + 引用缓存。
- 作文批改、视频/文章总结、精选题。
- 全真模考模式 + 尸检（模块耗时、错因、分数区间）。
- FSRS 个人化参数；Elo 自适应练习。
- 多角色学科变体（电路 / 电磁场 / 电机 / 数学 / 英语 / 政治）。
- 考前 5 分钟（可选：表达性写作 / 呼吸 / 检查清单）——仅作为可选工具，不宣称疗效。
- 验收：LLM 失败自动回退；每条事实性结论有来源或“模型推断”标注；单次重排 < 15 秒；模考 180 分钟计时误差 < 1 秒；尸检产出 3 条以内可执行建议；Elo 选题命中 60–80% 成功率区间；所有 AI 评分可查看依据并可覆盖。

### P4 打磨与报告（2–3 天）

- 周复盘、习惯洞察、性能优化、打包安装、自动更新（可选）。
- 做题回放与过程报告；旧事件聚合与数据保留策略。

---

## 18. 风险与开放问题

| 风险 | 应对 |
|---|---|
| 开发本身挤占备考时间 | P0 严格限时；先用手写任务也能跑；功能按周增量 |
| LLM 幻觉污染知识库 | 产物草稿制、强制引用、用户采纳、来源分级 |
| 采集引发隐私不适 | 本地存储、黑名单、暂停开关、请求前预览 |
| PDF 版权 | 仅本地解析，不上传、不再分发 |
| 联网抓取合规 | 优先官方 API；遵守 robots；只缓存摘要与链接 |
| 任务过载导致弃用 | 每日上限、低摩擦打卡、连续中断不惩罚 |
| 目标树与最新大纲不一致 | 模板版本化；设置页显示大纲版本与来源；支持手动修订 |
| 自评偏差 | 证据优先；显示置信度；定期校准 |
| 自动归属错误 | 低置信度不写入证据；用户修正后学习规则 |
| 动力画像误判/标签化 | 只在置信度足够时以行为描述呈现；用户可纠正；不展示类型名 |
| 动力设计变成操控或依赖 | 伦理边界、可关闭、不追求停留时长；不做可变奖励 |
| 游戏化反噬 | 不做积分、排行榜、损失厌恶；连续记录有宽限 |
| 冷启动缺乏数据 | 规则兜底，明确显示“还不够了解你”，不假装精准 |
| 过度心理化 | 不做心理诊断；持续两周以上的显著低落、失眠或焦虑，提示寻求专业帮助 |
| 多角色成本与延迟 | 题目级缓存、按意图路由、token 预算、超预算降级 |
| AI 判分错误 | 学科专家否决、用户可覆盖、展示评分依据 |
| 计时焦虑 | 学习默认不限时、计时可隐藏、只有模考强制 |
| 过程记录打断做题 | 一键操作、事后补录、可整体关闭 |
| 事件数据膨胀 | 旧事件按日聚合、保留原始数据 N 天、可配置 |

### 待用户确认的默认决策

以下先给出默认值，用户可在 onboarding 或设置中覆盖：

1. **模型**：默认接入 OpenAI 兼容接口，供应商与 base URL 可配置；不在代码中硬编码任何厂商。
2. **搜索**：默认使用可配置的搜索适配器；未配置时，联网能力降级为“仅模型内置知识 + 手动粘贴链接”。
3. **每日容量**：默认 480 分钟（8 小时），按实际作息调整。
4. **四科初始进度**：onboarding 用 5 分钟章节自评采集，允许“暂不评估”，之后由证据修正。
5. **政治**：第一版纳入目标树；若尚未开始，计划器前期只排低权重任务。

---

## 19. 参考来源

- 华中科技大学 2026 年硕士研究生招生专业目录与 825《电气科学基础》考试大纲（研招网/学院公告及新东方、高顿转载）。
- Dunlosky, J. et al. (2013). Improving Students' Learning With Effective Learning Techniques. *Psychological Science in the Public Interest*.
- Donoghue, G. M., & Hattie, J. A. C. (2021). A meta-analysis of ten learning techniques. *Frontiers in Education*.
- VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. *Educational Psychologist*.
- Ma, W. et al. (2014). Intelligent tutoring systems and learning outcomes: A meta-analysis. *Journal of Educational Psychology*.
- Kulik, J. A., & Fletcher, J. D. (2016). Effectiveness of intelligent tutoring systems: A meta-analytic review. *Review of Educational Research*.
- ActivityWatch 架构文档（local-first、watcher、heartbeat、bucket）。
- Clew、NeuraLearn、LearnGraph 等开源学习图谱项目的公开说明。
- Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior.
- Bureau, J. S., Howard, J. L., Chong, J. X. Y., & Guay, F. (2022). Pathways to student motivation: A meta-analysis of antecedents of autonomous and controlled motivations. *Review of Educational Research*.
- Wang, Y. et al. (2024). A systematic review and meta-analysis of self-determination-theory-based interventions in education. *Learning and Motivation*.
- Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review. *Psychological Bulletin*.
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis. *Advances in Experimental Social Psychology*.
- Sheeran, P., Listrom, O., & Gollwitzer, P. M. (2024). The scope and components of implementation intentions: A meta-analysis. *European Review of Social Psychology*.
- Keller, J. M. (2010). *Motivational Design for Learning and Performance: The ARCS Model Approach*.
- Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation.
- Bandura, A. (1997). *Self-Efficacy: The Exercise of Control*.
- Sirois, F., & Pychyl, T. (2013). Procrastination and the priority of short-term mood regulation.
- Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*.
- Gamification meta-analysis (2023). *Educational Technology Research and Development*.
- Ye, J., Su, J., & Cao, Y. (2022/2023). FSRS: A stochastic shortest path algorithm / optimizing spaced repetition schedule.
- Pelánek, R. (2016). Applications of the Elo rating system in adaptive educational systems. *Computers & Education*.
- Sweller, J. (1988/2011). Cognitive load theory and worked-example effects.
- Rawson, K. A., & Dunlosky, J. (2011/2012). Successive relearning and long-term retention.
- Robles Mucho, et al. (2026). Open learner models and pedagogical strategies in higher education: A meta-synthesis. *Frontiers in Education*.
- Kestin, G. et al. (2025). AI tutoring and learning gains.
- Ramirez, G., & Beilock, S. L. (2011). Writing about testing worries boosts exam performance. *Science*.
