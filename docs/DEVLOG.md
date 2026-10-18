# 开发日志

> 用途：记录每次工作的状态、决策与下一步。上下文丢失时，先读本文件，再读设计文档与当前计划。
>
> 维护规则：每次工作结束追加一条，写清「做了什么 / 验证了什么 / 决定了什么 / 下次从哪开始」。不要删旧记录。

---

## 2026-10-18 · 项目启动与 P0 计划完成

### 当前状态

- **产品名（暂定）：ToKnow**。两层含义：to know knowledge（对知识的了解）与 to know yourself（对自己的了解）；应用本身也在持续了解用户。产品内的“主线”仍指每日唯一主线机制。
- 设计文档已完成并评审通过：`docs/superpowers/specs/2026-10-18-personal-study-system-design.md`
- P0 实现计划已写完：`docs/superpowers/plans/2026-10-18-mainline-p0.md`（13 个任务）
- 已建立开发日志约定：每个 Task 提交前在 `docs/DEVLOG.md` 追加记录；新会话先读本文件。
- **代码尚未开始写**。第一步是升级 Node.js，然后按计划执行 Task 1。
- 本机环境：Windows 11，Node 已从 v20.16.0 升级到 **v24.20.0**，npm 11.19.0，git 2.45.2。
- P0 执行已开始：分支 `p0`，基线提交 `20bb599`（仅 docs）；按 `superpowers:subagent-driven-development` 逐任务推进。

### 项目目标（一句话）

为 2027 华中科技大学电气工程硕士考研做一个本地优先、强导向、能长期扩展的个人学习系统。P0 只交付「每天一条主线 + 完成记录 + 打卡 + 目标树 + 结构化日历 + 备份」的最小闭环。

### 已核实的考试事实

- 初试科目：101 政治、201 英语一、301 数学一、**825 电气科学基础**。
- 825 结构：电路理论 70 分 + 电磁场 40 分 + 电机学 40 分，150 分，180 分钟，以分析计算题为主。
- 主要参考书：颜秋容《电路理论·基础篇/高级篇》、叶齐政《电磁场》、辜承林《电机学》、熊永前学习指导。
- 初试时间按 2026-12-19 预估（以准考证为准）；系统里考试日期是用户可改的配置，不写死在代码里。

### 关键决策

| 决策 | 结论 | 原因 |
|---|---|---|
| 平台 | Windows 桌面应用，Electron + React + TypeScript | 需要前台窗口采集与本地数据库，Web 做不到 |
| 数据 | 本地 SQLite（better-sqlite3），P0 不联网 | 隐私优先；后续通过 `sync_outbox` 预留同步 |
| P0 范围 | onboarding、目标树、规则版今日主线、任务完成、打卡、知识树、备份 | 2–3 天必须能每天用起来 |
| 明确不做 | AI、采集、做题工作台、错题、复习卡 | 放到 P1–P3，避免 P0 失焦 |
| 自然日边界 | 凌晨 04:00 | 符合熬夜学习习惯，避免午夜切换日期 |
| 规划方式 | 规则公式，不是黑盒 | 可解释、可测试；P2 再让 AI 参与 |
| 任务完成 | 只产生「弱证据」，不等于已掌握 | 防止点一下完成就把掌握度刷满 |
| 日记边界 | 日记原文永不进入规划器/AI；只展示给用户 | 决策防火墙，见设计文档第 11 节 |
| 用户数据分层 | 知识层 / 行为层 / 反思层 / 画像层四层分离 | 既要“懂用户”，又不能混成黑箱；见设计文档 3.4、6.9 |
| 画像写入规则 | 派生画像必须带来源、置信度、样本量、时间窗；单事件不成结论 | 低于最小样本量标记 `insufficient_evidence`，只展示不断言 |
| 画像隔离 | 规划器只读聚合，AI 只读用户确认项，反思原文永不外流 | 访问策略是纯函数 + Repository 边界，不靠自觉 |
| 交互结构 | 结构优先，AI 自然融入；每屏一个主操作，主导航 3 项 + 齿轮 | 避免 AI 站大头导致结构松散，也避免用户必须主动去找 AI |
| 复杂度预算 | 三次点击完成核心动作；新增能力优先挂到既有对象，不新开一级页面 | 结构太复杂会直接降低交互欲望 |
| 隐私红线 | 不采集截图、键盘、剪贴板、麦克风、摄像头 | 只采集前台窗口/时长/浏览器历史/学习内容识别 |

### 代码结构（计划中的）

```text
src/shared/     纯函数与类型（date, mastery, planner, types, ipc）
src/main/       Electron 主进程：db / repositories / seed / services / ipc
src/preload/    类型化 contextBridge
src/renderer/   React 界面：今日 / 日历 / 知识树 / 设置 / onboarding
tests/          Vitest 单元与集成测试
```

### P0 任务清单（按顺序）

1. 脚手架与工具链（含 Node 升级）
2. 共享类型与 04:00 日期边界
3. SQLite schema 与迁移
4. 四科目标树种子（4 科 / 16 模块 / 47 章节）
5. Onboarding 校验与服务
6. 规划纯函数（urgency / forgetting / priority / selectDailyPlan）
7. 掌握度更新纯函数
8. 计划服务、任务完成、知识树读取
9. 每日打卡与本地备份
10. 类型化 IPC 与主进程装配
11. 渲染层主界面（今日 / 知识树 / 设置）
12. 日历服务、月历界面与手动任务（新建 / 拖拽改期 / 完成）
13. 集成测试、README、最终验收

### 下次开始的位置

1. Task 1（脚手架）已完成并评审通过，提交 `6220c29`。
2. 打开 `docs/superpowers/plans/2026-10-18-mainline-p0.md`，从 **Task 2：共享类型与日期边界** 开始。
3. 每个 Task 结束跑 `npm test` 与 `npm run typecheck`，然后提交。
4. 完成后回到本文件追加一条记录。

### 交接时必须知道的三件事

- 设计文档是唯一需求来源；计划是实现顺序。两者冲突时以设计文档为准，并回来改计划。
- P0 的所有业务逻辑都在 `src/shared` 纯函数与 `src/main/services` 里，界面不碰数据库。
- 不要把「任务完成」当成强证据；真正的掌握度证据来自 P1 之后的做题记录。

### 后续阶段（不在 P0）

- **P1**：使用记录采集（前台窗口、浏览器历史、学习内容识别）、证据入库、每日时间线；开始写 `BehaviorPattern` / `HabitPattern`，所有派生结论带样本量与置信度。
- **P2**：AI 能力插件与多角色编排（出题、批改、讲解、诊断）、知识产物、追问；AI 只读知识层与用户确认的画像项。
- **P3**：做题工作台（限时/不限时/模考）、过程画像、错题与 FSRS 复习卡；知识画像快照按周生成。
- **P4**：动力系统落地（阻力画像、干预库、n-of-1 微实验）、日历式日记与习惯洞察；反思层原文始终本地隔离。

### 用户数据分层（核心理论，P0 已落策略）

- **知识层**：目标树、节点状态、证据、做题表现。规划器与 AI 可完整读取。
- **行为层**：前台窗口、时长、浏览记录、任务启动/切换。规划器与 AI 只读聚合，界面完整，导出脱敏。
- **反思层**：日记原文、一句话记录、自由文本。规划器/AI/默认导出均禁止，只给用户自己看。
- **画像层**：特质、习惯、行为模式、知识画像快照。派生数据必须带来源、置信度、样本量、时间窗；规划器/AI 只读 `user_confirmed=1` 且置信度足够的项。

P0 在 `src/shared/privacy.ts` 落地访问矩阵并在 `tests/privacy.test.ts` 验证；P1 起补 `UserTrait`、`BehaviorPattern`、`HabitPattern`、`UserProfileSnapshot`、`KnowledgeProfileSnapshot`、`DerivedInsight` 等表。

---

## 日志模板

```markdown
## YYYY-MM-DD · 一句话主题

### 做了什么
- 

### 验证
- `npm test`：X passed
- `npm run typecheck`：
- 手动验收：

### 决策 / 变化
- 

### 下次从这里开始
- 
```

---

## 2026-10-18 · Task 1：脚手架与工具链

### 做了什么
- 建立 Electron + React + TypeScript + Vitest 脚手架：`package.json`、`electron.vite.config.ts`、`tsconfig.json`、`tsconfig.node.json`、`vitest.config.ts`、`.gitignore`。
- 写入最小 Electron 入口（主进程 / preload / renderer），窗口可加载开发服务器或打包后的 `index.html`。
- 添加临时测试 `tests/date.test.ts`，验证 Vitest 可运行（Task 2 会替换为真实的日期边界测试）。
- 产品品牌按协调者决定改为 **ToKnow**：包名 `toknow`、窗口与页面标题 `ToKnow`、占位文案 `ToKnow · P0`；「主线」作为每日主线的功能概念不变。

### 验证
- `npm test`：1 passed（1 file）
- `npm run typecheck`：通过，无错误
- `npm run build`：主进程、preload、renderer 均构建成功
- 手动验收：`npm run dev` 成功启动 Vite 与 Electron（Electron 二进制首次缺失，手动执行 `node node_modules/electron/install.js` 后恢复）；本环境无法目视确认窗口内容

### 决策 / 变化
- `better-sqlite3` 安装时通过 `electron-rebuild` 成功重编译，无阻塞。
- Electron 包的 postinstall 未下载二进制（`path.txt`/`dist` 缺失），已手动补装；后续若重装依赖需留意。
- Task 1 提交只包含脚手架与 DEVLOG；计划文件的环境准备改动不属于该提交。

### 下次从这里开始
- Task 2：共享类型与 04:00 日期边界，替换 `tests/date.test.ts` 占位测试。

---

## 2026-10-18 · 结构优先与日历设计补全

### 做了什么
- 设计文档新增 3.5「结构优先，AI 自然融入」：核心对象有固定容器，核心操作不依赖 AI；AI 不设独立门户，只在任务卡、知识节点、题目、错题等决策点旁出现。
- 明确复杂度预算：每屏一个主操作、主导航 3 项 + 齿轮、默认视图要浅、三次点击完成核心动作、新增能力优先挂到既有对象。
- 将日历从“AI 快速记录”改为真正的月历：7 列 × 5–6 行网格、日详情、双击新建、拖拽改期、勾选完成、打卡圆点；AI 只保留日详情底部的“一句话记录”。
- P0 计划从 12 个任务扩为 13 个：新增 Task 12（日历服务 + 月历页 + 手动任务），原集成验收顺延为 Task 13。
- 修正 Task 1 日志中“DEVLOG 与计划文件一并提交”的不准确表述。

### 验证
- 计划自检：任务编号 1–13 连续；类型、服务、IPC、UI 的文件路径与接口一致。
- 尚未运行代码测试（本次只改设计与计划）。

### 决策 / 变化
- 结构不是目的，方向感才是：用户打开任一主界面，第一屏就能知道下一步做什么。
- AI 的“自然”= 上下文自动带上 + 动作就在手边 + 一次一个建议 + 可忽略；不是把聊天框做得更显眼。
- 结构上限：主界面只有今日 / 日历 / 知识树；设置收进齿轮；做题、错题、知识库作为次级入口，不占主导航。

### 下次从这里开始
- 从 Task 2 开始逐任务实现；Task 12 之前不要提前写日历代码，避免与 Task 11 的 Layout/App 改动冲突。

---

## 2026-10-18 · Task 2：共享类型与 04:00 日期边界

### 做了什么
- 新建 `src/shared/date.ts`：`getStudyDate(now, boundaryHour = 4)` 与 `daysBetween(fromDate, toDate)`。
- 新建 `src/shared/types.ts`：P0 全部领域类型，并加入日历相关类型（`CalendarDay`、`CalendarMonthView`、`CalendarDayView`、`CreateTaskInput`、`MoveTaskInput`）。
- 用 5 个真实日期边界用例替换 Task 1 的占位测试。

### 验证
- `npm test -- tests/date.test.ts`：5 passed（1 file）
- `npm run typecheck`：通过，无错误
- 提交 `2269102`，仅含 3 个任务文件

### 决策 / 变化
- 学习日边界固定为 04:00；`daysBetween` 对反向日期返回 0。
- 已知 minor（暂不处理）：日期函数使用本机时区（与 `Profile.timezone` 尚未打通）；非法日期会返回 `NaN` 而不是抛错。

### 下次从这里开始
- Task 3：SQLite 连接、Schema、迁移、行映射与 `src/shared/privacy.ts` 访问策略。

---

## 2026-10-18 · Task 3：SQLite Schema、迁移、行映射与数据访问策略

### 做了什么
- 新建 `src/main/db/migrate.ts`：12 张 P0 表（`study_profile`、`subject`、`module`、`knowledge_node`、`node_prerequisite`、`user_node_state`、`task`、`task_node`、`evidence`、`daily_log`、`setting`、`sync_outbox`）、5 个索引，以及基于 `PRAGMA user_version` 的幂等迁移（事务包裹）。
- 新建 `src/main/db/connection.ts`：`createDb`（打开即迁移、WAL、外键约束）与 `getDb` / `setDb` / `closeDb` 单例接口。
- 新建 `src/main/db/rows.ts`：`ProfileRow` / `SubjectRow` / `ModuleRow` / `NodeRow` / `StateRow` / `TaskRow` / `DailyLogRow` 及对应 `mapX` 映射函数。
- 新建 `src/shared/privacy.ts`：`DataDomain`、`DataPurpose`、`AccessLevel` 与纯函数 `accessLevel` / `canRead`，落地四层数据的访问矩阵（反思层不外流，行为层只给聚合，画像层只给确认项）。
- 新增测试 `tests/db.test.ts`（3）、`tests/privacy.test.ts`（4）与 `tests/helpers/db.ts`；全程按 TDD：先写测试确认 RED，再实现转 GREEN。

### 验证
- `npm test -- tests/db.test.ts tests/privacy.test.ts`：7 passed（2 files）
- `npm run typecheck`：通过，无错误
- `npm test`：12 passed（3 files，含 Task 2 的 5 个日期用例），无回归
- 修复轮 1：`daily_log` 补上 `deleted_at` / `device_id` 审计列（同步重放与删除对账所需），新增 `gives every syncable entity its audit columns` 测试；修复后目标测试 8 passed（db 4 + privacy 4），全量 `npm test` 13 passed

### 决策 / 变化
- `createDb` 自动执行迁移，测试用 `:memory:` 无需手动初始化。
- 未改动 `src/shared/types.ts` 与 `src/shared/date.ts`；未提前创建 repositories / services / seed / IPC / renderer 代码。

### 下次从这里开始
- Task 4：四科目标树种子（4 科 / 16 模块 / 47 章节），基于本任务的连接、迁移与行映射。

---

## 2026-10-18 · Task 4：目标树种子

### 做了什么
- 新建 `src/main/seed/targetTree.ts`：`SeedSubject` / `SeedModule` / `SeedChapter` 类型、`TARGET_TREE` 常量、`seedTargetTree(db, profileId)` 与 `countSeeded(db, profileId)`。
- 种子数据为 4 科 / 16 模块 / 47 章节：数学一（3 模块 / 19 章）、英语一（5 / 7）、政治（5 / 5）、825 电气科学基础（3 / 16；电路 7 章、电磁场 6 章、电机 3 章）。
- 种子事务写入 4 张表：`subject` → `module` → `knowledge_node`（`kind = 'chapter'`）→ `user_node_state`（初始全 0，`updated_by = 'self'`）。
- 幂等策略：若该 profile 已有任意 subject 记录，则直接返回。
- 新增 `tests/seed.test.ts`（3 个用例：数量、幂等、每个节点都有初始状态）。

### 验证
- `npm test -- tests/seed.test.ts`：RED（找不到 `../src/main/seed/targetTree`）→ GREEN，3 passed（1 file）
- `npm test`：16 passed（4 files），无回归
- `npm run typecheck`：通过，无错误

### 决策 / 变化
- 节点 ID 采用确定性格式 `node_<subjectIndex>_<moduleIndex>_<chapterIndex>`，便于后续任务稳定引用。
- 种子只创建章节级节点（47 个），不预建 `section` / `point` 层级，避免凭空发明内容。
- 未创建 repositories / services / IPC / renderer 等后续任务文件。

### 下次从这里开始
- Task 5：Onboarding 校验与服务，读取本任务的目标树并为用户建立初始状态。

---

## 2026-10-18 · Task 5：Onboarding 校验与服务

### 做了什么
- 新建 `src/main/repositories/profileRepo.ts`：`insertProfile(db, profile, deviceId = 'local')` 写入 `study_profile`；`getActiveProfile(db)` 读取 `active = 1 AND deleted_at IS NULL` 的最近一条 profile，并用 `mapProfile` 映射为领域类型。
- 新建 `src/main/services/onboardingService.ts`：
  - `validateOnboarding(input, today = getStudyDate(new Date()))` 校验姓名非空、考试日期格式与未过期、每日容量 60–900 分钟、自评 0–5。
  - `submitOnboarding(db, input)` 先校验（失败抛 `INVALID_ONBOARDING:<errors>`），再在单个事务内插入 profile、调用 `seedTargetTree` 建四科目标树、按学科 code 把自评同时写入 `user_node_state.self_rating` 与 `mastery`（`confidence = 0.5`、`updated_by = 'self'`）。
- 新增 `tests/onboarding.test.ts`：校验有效/无效输入，以及创建 profile、种子树、应用数学自评的集成用例。

### 验证
- `npm test -- tests/onboarding.test.ts`：RED（找不到 `profileRepo` / `onboardingService`）→ GREEN，3 passed（1 file）
- `npm test`：19 passed（5 files），无回归
- `npm run typecheck`：通过，无错误
- 提交仅包含 `src/main/repositories/profileRepo.ts`、`src/main/services/onboardingService.ts`、`tests/onboarding.test.ts` 与本 DEVLOG 条目。

### 决策 / 变化
- 按任务简报逐字实现，无接口偏离；`insertProfile` 的 `deviceId` 默认 `local`，暂不接入设备标识。
- 自评同时作为初始 `mastery`，符合 P0「用户自评即初始掌握度」的简化；后续由证据更新函数修正。
- 事务内嵌套 `seedTargetTree` 自带的事务，better-sqlite3 以 savepoint 处理，测试已验证可行。
- 校验未新增未知学科 code 的检查（简报未要求），保持与接口一致。

### 下次从这里开始
- Task 6：规划纯函数（urgency / forgetting / priority / selectDailyPlan）。

---

## 2026-10-18 · Task 5 修复轮 1

### 做了什么
- `submitOnboarding` 新增可选参数 `today = getStudyDate(new Date())`，并将其传入 `validateOnboarding(input, today)`；函数其余逻辑不变。
- `tests/onboarding.test.ts` 的集成用例改为 `submitOnboarding(db, validInput, '2026-10-18')`，让校验与固定的 `examDate: '2026-12-19'` 共享同一基准日，不再依赖真实时钟，避免 2026-12-20 起永久触发 `exam_date_past`。

### 验证
- `npm test -- tests/onboarding.test.ts`：3 passed（1 file）
- `npm test`：19 passed（5 files），无回归
- `npm run typecheck`：通过，无错误
- 提交仅包含 `src/main/services/onboardingService.ts`、`tests/onboarding.test.ts` 与本 DEVLOG 条目。

### 决策 / 变化
- 默认值仍取真实学习日，生产调用方无需改动；测试显式注入日期以获得确定性。
- 未新增依赖、未改 schema，未触碰其他任务文件。

---

## 2026-10-18 · Task 6：规划纯函数

### 做了什么
- 新建 `src/shared/planner.ts`：纯规划模块，不读数据库、文件系统或时钟，时间一律由 `nowMs` / 日期字符串传入。
  - `urgency(daysLeft)`：距离考试 90 天以上为 1，越接近考试越大，考试当天为 2。
  - `forgetting(lastStudiedAt, nowMs)`：从未学习返回 1，按距上次学习天数线性上升，14 天封顶为 2。
  - `priority(node, daysLeft, nowMs)`：`考试权重 × (弱点 + 目标差距) × 紧迫度 × 遗忘度`，弱点与目标差距均按 5 分制归一化。
  - `selectDailyPlan(input)`：先过滤已掌握节点（`mastery >= targetMastery`），按优先级降序排序，取前 `maxTasks`（默认 3）个，首个为主线、其余为辅助；`plannedMin` 按剩余任务均分每日容量，限制在 10–60 分钟；无可学节点返回 `null`。
- 新增 `tests/planner.test.ts`（7 个用例，纯函数，无数据库、无真实时钟）。

### 验证
- `npm test -- tests/planner.test.ts`：RED（`Cannot find module '../src/shared/planner'`）→ GREEN，7 passed（1 file）
- `npm test`：26 passed（6 files），无回归
- `npm run typecheck`：通过，无错误
- 提交仅包含 `src/shared/planner.ts`、`tests/planner.test.ts` 与本 DEVLOG 条目。

### 决策 / 变化
- 按任务简报逐字实现接口与公式，无偏离。
- 规划逻辑保持纯净：不依赖 `getStudyDate`，`today` 与 `nowMs` 由调用方注入，便于测试与后续服务层复用。
- `daysBetween` 已对负值取 0，考试日期已过时 `urgency` 取上限 2。

### 下次从这里开始
- 后续任务：把 `selectDailyPlan` 接入服务层，落库为 `Task`（主线 / 辅助）并暴露 IPC。

---

## 2026-10-18 · Task 7：掌握度更新

### 做了什么
- 新建 `src/shared/mastery.ts`：纯函数 `updateMastery(current, performance, expected, weight)`，按 `current + weight × (performance - expected)` 更新，限制在 0–5，并四舍五入到两位小数。
- 新建 `tests/mastery.test.ts`：3 个用例，覆盖向表现值移动且不越界、两位小数舍入、表现等于预期时保持稳定。
- 任务完成只作为弱证据：单次更新幅度由 `weight` 控制，不会一步跳到目标掌握度。

### 验证
- `npm test -- tests/mastery.test.ts`：RED（`Cannot find module '../src/shared/mastery'`）→ GREEN，3 passed（1 file）
- `npm test`：29 passed（7 files），无回归
- `npm run typecheck`：通过，无错误

### 决策 / 变化
- 按任务简报逐字实现，无接口或公式偏离。
- 模块保持纯净：不读数据库、文件系统或时钟，所有输入由调用方传入。
- 未改动其他任务文件，未新增依赖。

### 下次从这里开始
- 后续任务：在任务完成服务中调用 `updateMastery`，把完成记录写入 `evidence` 并更新 `user_node_state`。

---

## 2026-10-18 · Task 7 修复轮 1

### 做了什么
- 按设计文档 8.2 重写 `src/shared/mastery.ts`，替换首版公式：
  - 接口由 `updateMastery(current, performance, expected, weight)` 改为 `updateMastery(current, performance, alpha)`。
  - 预期表现不再固定为 3，而是 `expected = current / 5`；`next = clamp(current + alpha × (performance - expected), 0, 5)`，保留两位小数。
  - `performance` 明确为归一化到 0–1 的表现分（调用方负责把 0–5 的自评除以 5），已写入 JSDoc。
  - 新增 `EvidenceKind` 与 `EVIDENCE_ALPHA`：真题 0.35 / 普通练习 0.25 / 自测 0.2 / 看课完成 0.1 / 自评修正 0.15。任务完成使用固定弱权重，弱证据成为代码机制而非调用方约定。
- 按修订后的简报替换 `tests/mastery.test.ts` 为 5 个用例：`EVIDENCE_ALPHA` 权重表、表现等于预期时稳定、单次任务完成只小幅移动、0–5 边界、两位小数舍入。

### 验证
- `npm test -- tests/mastery.test.ts`：RED（`EVIDENCE_ALPHA` 未定义，旧签名返回 `NaN`）→ GREEN，5 passed（1 file）
- `npm test`：32 passed（7 files），无回归
- `npm run typecheck`：通过，无错误

### 决策 / 变化
- 与设计文档 8.2 对齐：掌握度的“预期”应随当前水平变化，而不是所有节点都假设预期为 3。
- `alpha` 仍作为参数传入，但唯一合法来源是 `EVIDENCE_ALPHA`；服务层必须按证据类型取值。
- 未改动其他任务文件，未新增依赖。

### 下次从这里开始
- 后续任务：任务完成服务使用 `EVIDENCE_ALPHA.task_completion` 调用 `updateMastery`，自评使用 `EVIDENCE_ALPHA.self_rating`，并同步写入 `evidence`。

---

## 2026-10-18 · Task 6 修复轮 1

### 做了什么
- `selectDailyPlan` 的任务数上限改为 `Math.min(3, Math.max(1, input.maxTasks ?? 3))`，并加注释说明「1 条主线 + 最多 2 条辅助」是硬契约，`maxTasks` 只能在此区间内收窄。此前只保证了下界，传入 `maxTasks: 5` 会产出 1 主线 + 4 辅助。
- `tests/planner.test.ts` 新增用例 `never returns more than one mainline and two supporting tasks`：传入 `maxTasks: 5` 并断言 `supporting.length <= 2`。

### 验证
- `npm test -- tests/planner.test.ts`：RED（`expected 4 to be less than or equal to 2`）→ GREEN，8 passed（1 file）
- `npm test`：30 passed（7 files），无回归
- `npm run typecheck`：通过，无错误
- 提交仅包含 `src/shared/planner.ts`、`tests/planner.test.ts` 与本 DEVLOG 条目。

### 决策 / 变化
- 按修订后的简报逐字实现，无其他改动；未新增依赖。

---

## 2026-10-18 · Task 8：计划服务、任务完成与知识树读取

### 做了什么
- `src/shared/types.ts` 追加 `TodayView`、`CompleteTaskResult`、`BackupResult`。
- 新建 `src/main/repositories/taskRepo.ts`：任务插入、任务-节点关联、按日查询、按 ID 查询、标记完成、读取关联节点；所有查询带 `deleted_at IS NULL`。
- 新建 `src/main/repositories/treeRepo.ts`：规划器节点读取（`mastery` 缺失补 0）、证据写入 `applyEvidence`（更新 `user_node_state` 并落 `evidence`）、科目 / 模块 / 节点 / 状态读取。
- 新建 `src/main/repositories/dailyLogRepo.ts`：本任务只实现只读 `getDailyLog`，`upsertDailyLog` 留给 Task 9。
- 新建 `src/main/services/planService.ts`：`generateDailyPlan` 调用纯函数 `selectDailyPlan` 落库为 1 主线 + 2 配套任务，同日幂等；`completeTask` 在事务内标记完成、写 `task_completion` 弱证据并更新掌握度，重复完成不重复写证据。
- 新建 `src/main/services/todayService.ts`：展示聚合层，读取计划、任务完成计数、剩余天数与打卡；不参与规划。
- 新建 `src/main/services/treeService.ts`：把科目 / 模块 / 节点组装为嵌套 `TreeSubject[]`，节点按 `orderIndex` 排序。
- 新增 `tests/planService.test.ts`（6 个用例）。

### 验证
- `npm test -- tests/planService.test.ts`：RED（`Cannot find module '../src/main/services/planService'`）→ GREEN，6 passed（1 file）
- `npm test`：38 passed（8 files），无回归
- `npm run typecheck`：通过，无错误

### 决策 / 变化
- 证据分制边界统一：`applyEvidence` 接收界面使用的 0–5 分 `performance`，除以 5 归一化一次后，`evidence.performance` 与 `evidence.expected` 都以 0–1 存储、可直接相减；`updateMastery` 消费同一个归一化值。（最初实现按 0–5 原样写库，与 `expected = current / 5` 混用两种量纲，Task 8 修复轮 1 已修正。）
- `targetMastery` 仍只作达标阈值，`applyEvidence` 不把掌握度夹到目标值，保留超额掌握信息。
- 隐私边界保持：`planService.ts` 不导入 `dailyLogRepo`，不读取日记 / 反思文本；`todayService.ts` 是唯一读取 `daily_log` 的服务。
- 未新增依赖、未改 schema、未提前实现 Task 9 的打卡写入。

### 下次从这里开始
- Task 9：每日打卡与本地备份，在 `dailyLogRepo` 补 `upsertDailyLog`，并实现备份服务。

---

## 2026-10-18 · Task 8 修复轮 1

### 做了什么
- `src/main/repositories/treeRepo.ts` 的 `applyEvidence` 统一证据分制：调用方仍传入 0–5 的 `performance`，但内部只做一次 `normalized = performance / 5`，同时用于 `updateMastery` 与 `evidence.performance`。`evidence.expected` 本就是 `current / 5`，现在 `performance` 与 `expected` 都是 0–1，可直接比较，避免 P1 回放证据时出现约 5 倍的偏差。插入处补充列含义注释。
- `listPlannerNodes`、`listModules`、`listNodes` 补齐父级软删除过滤：除节点自身 `n.deleted_at IS NULL` 外，还要求 `m.deleted_at IS NULL` 与 `s.deleted_at IS NULL`。软删除的科目或模块不再向规划器提供节点。
- `tests/planService.test.ts` 的完成证据断言改为 `performance ≈ 0.8`（4 / 5），并单独断言 `kind`。

### 验证
- `npm test -- tests/planService.test.ts`：6 passed（1 file）
- `npm test`：38 passed（8 files），无回归
- `npm run typecheck`：通过，无错误

### 决策 / 变化
- 证据表作为耐久审计与校准来源，内部一致性优先于「原样存原始分」；原始 0–5 语义由调用方契约承担，已在 JSDoc 与插入注释中写明。
- 软删除过滤与现有 repository 风格保持一致；未新增依赖、未改 schema。

---

## 2026-10-18 · Task 9：每日打卡与本地备份

### 做了什么
- `src/main/repositories/dailyLogRepo.ts`：保留 Task 8 的 `getDailyLog`，新增 `upsertDailyLog(db, profileId, input, nowMs)`，按 `(profile_id, date)` 唯一键 upsert，校验睡眠 0–24、精力/心情/专注自评 1–5（失败抛 `INVALID_DAILY_LOG`），写入 `device_id = 'local'`，更新时不改 `id` / `created_at` / `device_id`。另新增 `listDailyLogsBetween(db, profileId, from, to)`（含端点、按日期升序、过滤软删除），供 Task 12 日历使用。
- `src/main/services/backupService.ts`：`exportBackup(db, destDir, now?)` 用 better-sqlite3 在线备份写出完整 SQLite 文件，并写 JSON 导出（profile、subjects、nodes、states、tasks、dailyLogs）。
- **隐私边界**：JSON 导出中的 `dailyLogs` 保留数值字段，`note` 一律置 `null`，反思层原文只存在于 SQLite 文件副本；`daily_log` 读取同时按 `profile_id` 与 `deleted_at IS NULL` 过滤。
- 新增 `tests/dailyLog.test.ts`（2 个用例）与 `tests/backup.test.ts`（1 个用例），按简报逐字实现。

### 验证
- `npm test -- tests/dailyLog.test.ts tests/backup.test.ts`：RED（`upsertDailyLog` 不存在、`backupService` 模块缺失）→ GREEN，3 passed（2 files）
- `npm test`：41 passed（10 files），无回归（Task 8 后基线 38 passed / 8 files）
- `npm run typecheck`：通过，无错误

### 决策 / 变化
- 与简报的偏离：JSON 导出读取 profile 改用既有 `getActiveProfile`（自动过滤 `deleted_at` 与非激活行），`daily_log` 查询增加 `profile_id` 与 `deleted_at IS NULL` 过滤，以遵守「所有读都过滤软删除」的全局约束；简报原 SQL 为全表 `SELECT * FROM daily_log`。
- `daily_log.note` 不进入默认导出；只有用户主动保管的 `.db` 副本含原文，符合反思层「只给用户自己看」的定位。
- 未新增依赖、未改 schema、未改共享类型（`BackupResult`、`DailyLogInput` 等已存在）。

### 下次从这里开始
- Task 10：类型化 IPC 与主进程装配，把打卡、备份与既有服务暴露给渲染层。

---

## 2026-10-18 · Task 9 修复轮 1

### 做了什么
- `upsertDailyLog` 的 `ON CONFLICT ... DO UPDATE` 末尾增加 `deleted_at = NULL`：此前若同 `(profile_id, date)` 行已被软删除，`getDailyLog` 看不到它，upsert 写入新值却不清除删除标记，最后通过非空断言返回运行时的 `null`，调用方首次取属性就会崩溃。现在 upsert 会真正“复活”该行。
- `validate` 新增日期格式校验 `isCalendarDate`：要求严格 `YYYY-MM-DD` 且为真实日历日；`''`、`'2026-1-5'`、`'2026-02-31'` 等一律抛 `INVALID_DAILY_LOG`，避免脏日期进入文本区间查询。
- `tests/dailyLog.test.ts` 新增 2 个用例（软删除行复活、畸形日期拒绝）。
- `tests/backup.test.ts` 新增「never exports journal notes, but the database copy keeps them」：写入 `note: '今天很焦虑'` 后导出，断言 JSON 中 `dailyLogs[0].note === null`、整个 JSON 字符串不含原文，再打开备份的 `.db` 断言原文仍在，把隐私红线钉在测试里。

### 验证
- `npm test -- tests/dailyLog.test.ts tests/backup.test.ts`：RED（软删除行返回 `null`、畸形日期不抛错）→ GREEN，6 passed（2 files）
- `npm test`：44 passed（10 files），无回归
- `npm run typecheck`：通过，无错误

### 决策 / 变化
- 软删除采用“upsert 即复活”语义：用户重新打卡同一日期时，不应因历史删除标记而丢失新记录。
- 日期校验放在 repository 边界，所有写入路径共享；仍不接受 `Date` 对象或带时间的字符串。
- 备份测试同时验证两件事：默认 JSON 导出脱敏、SQLite 副本保留反思层原文，后者仅在用户主动保管的本地文件中存在。

### 下次从这里开始
- Task 10：类型化 IPC 与主进程装配，把打卡、备份与既有服务暴露给渲染层。

---

## 2026-10-18 · Task 10：类型化 IPC 与主进程装配

### 做了什么
- 新增 `src/shared/ipc.ts`：单一 `IPC` 通道常量对象（bootstrap / onboarding / today / completeTask / checkIn / tree / exportBackup / settings），`AppApi` 定义渲染层 `window.api` 的全部方法签名，另有 `Bootstrap` 与 `AppSettings` 两个返回形状；所有参数与返回值均来自 `src/shared/types.ts` 的领域类型。
- 新增 `src/main/ipc.ts`：`createHandlers({ db, dbPath, backupDir, version })` 把 onboarding、今日视图、任务完成、打卡、知识树、备份、设置装配到同一处理器对象；读路径统一经 `getActiveProfile` 取当前 profile，缺失时抛 `NO_PROFILE`。`registerIpc(ipcMain, handlers)` 逐一注册 8 个 `IPC` 通道，入参显式标注 `OnboardingInput` / `CompleteTaskInput` / `DailyLogInput`，处理器只返回领域类型，不暴露数据库行。
- 替换 `src/preload/index.ts`：以 `AppApi` 类型约束的单一对象封装全部 `ipcRenderer.invoke`，通过 `contextBridge.exposeInMainWorld('api', api)` 暴露；桥内无 `any`，渲染层无需直接接触 `ipcRenderer`。
- 新增 `src/renderer/src/env.d.ts`：为 `Window` 声明 `api: AppApi`，让渲染层获得端到端类型。
- 扩展 `src/main/index.ts`：在 `app.whenReady()` 中按 `userData` 创建 `toknow.db` 与 `backups/` 目录，`createDb` + `setDb` 后调用 `registerIpc` 完成装配；窗口背景色改为 `#F7F3EA`，并在 `before-quit` 关闭数据库连接。保留原有窗口创建、开发 URL / 生产文件加载与 macOS activate 行为。

### 验证
- `npm test -- tests/ipc.test.ts`：RED（`Cannot find module '../src/main/ipc'`）→ GREEN，1 passed
- `npm test`：45 passed（11 files），无回归（Task 9 后基线 44 passed / 10 files）
- `npm run typecheck`：通过，无错误
- 测试覆盖完整链路：空库 bootstrap → onboarding → 今日计划（3 条任务）→ 完成主线 → 打卡 → 今日视图回读 → 知识树 4 个科目 → 设置中的 `dbPath`；全程直接调用处理器对象，不依赖 Electron 运行时。

### 决策 / 变化
- 与简报一致，未偏离既有接口：`getTodayView` 使用其 4 参数签名（含 `nowMs`），`exportBackup` 使用 `(db, destDir, now?)`，`upsertDailyLog` 使用 `(db, profileId, input, nowMs)`。
- IPC 错误沿用既有领域错误码（`NO_PROFILE`、`TASK_NOT_FOUND`、`INVALID_ONBOARDING:*`、`INVALID_DAILY_LOG`），由 Electron 的 `ipcMain.handle` 序列化为错误消息字符串传给渲染层，不传堆栈；渲染层可按前缀归一化。
- 未新增依赖、未改 schema、未改领域类型；主进程启动路径与 Electron 构建配置保持原样。

### 下次从这里开始
- Task 11：渲染层接入 `window.api`，用类型化 IPC 完成今日页/树页的数据加载与状态刷新。

---

## 2026-10-18 · Task 10 修复轮 1

### 做了什么
- `src/main/index.ts` 的 `app.whenReady().then(...)` 回调改为 `try/catch`：数据库路径解析、`createDb`（含 `migrate`）、`setDb`、`registerIpc` 或窗口创建任一步抛错时，调用 `dialog.showErrorBox('ToKnow 启动失败', String(error))` 并 `app.quit()`，避免无窗口、无提示的挂起进程。`dialog` 从 `electron` 导入。
- 新增单实例锁：在 `whenReady` 之前调用 `app.requestSingleInstanceLock()`；未获得锁时 `app.quit()` 并跳过其余初始化，避免第二次启动并发打开同一 WAL 数据库、并行跑迁移。获得锁时注册 `second-instance`，将已有窗口从最小化恢复并聚焦。
- `createWindow()` 返回 `BrowserWindow`，供 `second-instance` 聚焦使用；窗口配置与加载逻辑不变。
- `window-all-closed` 与 `before-quit` 移入获锁分支，未获锁的进程不再注册这些生命周期副作用。

### 验证
- `npm run typecheck`：通过，无错误
- `npm test`：45 passed（11 files），无回归
- 启动失败与单实例属于 Electron 运行时行为，按简报不新增运行时测试；两条路径均只依赖 Electron 官方 API，无新增依赖。

### 决策 / 变化
- 单实例锁在模块顶层获取，早于 `whenReady`，符合 Electron 推荐顺序；`second-instance` 只处理“恢复 + 聚焦”，不在第二实例中重复创建数据库连接。
- 启动错误用 `String(error)` 展示，保留错误消息但不会让进程静默退出；`before-quit` 仍会关闭已创建的连接（未创建时 `closeDb()` 对 null 安全）。
- 未改 IPC 契约、渲染层或共享类型。

---

## 2026-10-18 · Task 11：渲染层界面

### 做了什么
- 新增 `src/renderer/src/api.ts`，以单一 `api` 导出 `window.api`，页面不直接散落全局访问。
- 替换 `src/renderer/src/main.tsx`：React 19 `createRoot` + `HashRouter`（适配 Electron `file://` 加载），并引入全局 `styles.css`。
- 替换 `src/renderer/src/App.tsx`：启动时调用 `bootstrap()`；无 profile 时只渲染 onboarding，onboarding 成功后把返回的 `Profile` 写回 boot 状态并进入主界面；主界面路由固定为 `/`（今日）、`/tree`（知识树）、`/settings`（设置），未知路径重定向回今日。
- 新增 `components/Layout.tsx`：顶栏显示品牌、学习日期与固定导航「今日 / 知识树 / ⚙」，不新增任何顶级入口。
- 新增 `components/MasteryBar.tsx` 与 `components/TreeNode.tsx`：掌握度条按 0–5 映射为填充宽度，树节点递归渲染标题、权重与掌握度。
- 新增 `pages/OnboardingPage.tsx`：称呼、考试日期、每日可用时间、四科 0–5 自评；把 `INVALID_ONBOARDING:<code,...>` 归一化为中文提示，保存中禁用按钮并显示「正在建立目标树…」。
- 新增 `pages/TodayPage.tsx`：首屏先呈现唯一主线卡（主线标签、计划分钟、实际分钟与完成质量输入、「标记完成」），其下是配套任务与今日打卡（睡眠 / 精力 / 心情 / 专注 / 一句话记录）；完成任务或打卡后重新调用 `getToday()`，计数与卡片状态随之刷新。
- 新增 `pages/TreePage.tsx`：四科整体掌握度使用其全部节点均值；模块显示分值，节点递归展示层级掌握度；无数据或读取失败都有明确文案。
- 新增 `pages/SettingsPage.tsx`：展示数据库路径、备份目录与版本，并调用 `exportBackup()`，成功时给出导出的 `.json` 路径。
- 新增 `styles.css`：暖纸色背景、单一墨绿 accent、衬线标题；无渐变装饰、无红绿黄状态色、无组件库；窄屏下打卡网格降为两列，常规窗口在 100–150% 缩放下仍保持单列可读。

### 验证
- `npm run typecheck`：通过，无错误
- `npm run build`：通过（main / preload / renderer 三段产物均生成，renderer 31 modules）
- `npm test`：45 passed（11 files），无回归
- 手动验收（`npm run dev`）未在本轮执行：当前环境无 DOM 测试与 GUI 自动化，需人工按简报 Step 12 走一遍 onboarding → 今日 → 完成 → 打卡 → 知识树 → 导出备份。

### 决策 / 变化
- 严格按简报实现，未新增依赖，未改主进程、preload 或共享类型。
- 与产品约束的偏差：主线性卡片旁的「换一个 / 锁定 / 标记卡住」在简报 Step 8 中未出现，且 `AppApi` 只暴露 `completeTask`，没有换任务 / 锁定 / 卡住的 IPC。为不引入无行为的占位按钮，本轮只交付「完成」；这三项需在后续任务中先扩展共享接口与主进程服务后再接入。已在任务报告中标注。
- 今日页与打卡按钮的提交失败沿用简报代码，仅 `finally` 复位 busy，未额外捕获错误；正常路径下 IPC 错误会表现为未处理的 Promise rejection，人工验收时应关注异常场景。
- onboarding 始终有默认考试日期 `2026-12-19`，与 P0 预估初试日期一致；真实日期仍以用户输入为准，不写死在主进程。

### 下次从这里开始
- Task 12：日历页（月视图 / 日视图），复用既有 `CalendarMonthView` / `CalendarDayView` 类型与主进程日历服务；完成后人工跑一遍全流程并检查备份文件。

---

## 2026-10-18 · Task 11 修复轮 1

### 做了什么
- **今日页写操作不再静默失败**：`TaskCard` 为 `completeTask` 增加 `catch` 与卡片内错误文案「完成失败：<原因>」，提交时清空旧错误；今日打卡的 `checkIn` 增加 `checkinBusy` 与 `checkinError`，失败显示「打卡失败：<原因>」，请求期间按钮禁用并显示「保存中…」。
- **睡眠输入在发送前校验**：`parseSleep` 将空字符串转为 `null`，非有限数或超出 0–24 的值直接返回 `undefined`，页面提示「打卡失败：睡眠小时需在 0–24 之间」并停止请求；实际分钟与完成质量输入也在 `onChange` 中夹取到允许区间。
- **错误原因不吞掉**：新增 `reasonOf`，剥掉 Electron `remote method` 外壳后保留领域错误码（如 `INVALID_DAILY_LOG`），校验失败不会被替换成泛化提示。
- **知识树补齐加载与空状态**：`TreePage` 增加 `loaded` 标志，读取中显示「正在读取知识树…」；`tree.length === 0` 时显示「暂无知识树数据，请重新完成引导。」，不再出现只有页头的空白页。
- **今日空态只在真的为空时出现**：主线为 `null` 但仍有配套任务时不再显示「今天的计划已清空」，该文案只保留给主线与配套都为空的场景。
- **设置读取失败可见**：`SettingsPage` 增加 `loadFailed`，`getSettings()` 拒绝时数据库、备份目录与版本三行都显示「读取失败」，而不是永久停留在「读取中…」或 `-`。
- **对比度修正**：导航激活态与「主线」标签的文字色由 `var(--accent)` 改为 `var(--ink)`，在 `--accent-soft` 背景上达到 AA；新增 `.form-error` 样式承接上述错误文案。
- 明确保留复审的 deferred 项：完成任意任务后 `load()` 会用已保存的 `dailyLog` 覆盖打卡表单，未保存的编辑仍会丢失；本轮未动。

### 验证
- `npm run typecheck`：通过，无错误
- `npm run build`：通过（main / preload / renderer 三段产物均生成，renderer 31 modules）
- `npm test`：45 passed（11 files），无回归（与修复前基线一致，未新增/修改测试）
- 写操作失败、空态与对比度仍属渲染层行为，当前无 DOM 测试与 GUI 自动化；需 `npm run dev` 人工复核：输入 25 小时睡眠应看到打卡错误、断网/异常 IPC 下完成失败应显示原因、空树与设置读取失败应有可见文案。

### 决策 / 变化
- 睡眠采用“发送前校验”而非静默夹取：用户输入 25 小时时明确告知合法区间，避免把错误值悄悄改成 24 后仍显示用户原来的数字。
- 完成失败与打卡失败使用各自的 section 级状态，互不遮蔽；`reasonOf` 保留原始领域码，便于人工排查。
- 仅改渲染层与开发日志，未触碰主进程、preload、共享类型或测试；无新增依赖。

### 下次从这里开始
- 最终复审：确认 deferred 的表单覆盖问题是否进入后续任务；人工跑 `npm run dev` 复核错误态、空态与主线性卡片的 150% 缩放显示。

---

## 2026-10-18 · Task 12：日历服务、月历界面与手动任务

### 做了什么
- **仓库层**：`taskRepo.ts` 新增 `listTasksForMonth`（按日期区间读取、过滤软删除，按日期 / 主线 / 优先级排序）与 `updateTaskDate`（改期并更新 `updated_at`）。`dailyLogRepo.ts` 在 Task 9 已有 `listDailyLogsBetween`，本任务直接复用，未重复实现。
- **服务层**：新增 `calendarService.ts`，提供 `monthBounds`、`getMonthView`、`getDayView`、`createManualTask`、`rescheduleTask`。月视图按天聚合 `taskCount` / `doneCount` / `plannedMin` / `hasCheckIn`，并返回整月任务；手动任务固定 `source = 'manual'`、`isMainline = false`、`status = 'todo'`；校验非法标题、分钟、日期与跨 profile 的任务改期。
- **IPC**：`shared/ipc.ts` 新增四个通道 `calendar:month`、`calendar:day`、`task:create`、`task:move` 及对应 `AppApi` 方法；`main/ipc.ts` 在既有 `createHandlers` 对象与 `registerIpc` 末尾接入；`preload/index.ts` 暴露同名方法。`env.d.ts` 因 `AppApi` 自动扩展无需改动。
- **渲染层**：新增 `pages/CalendarPage.tsx`：真实 7 列月历网格（周一开头、月初空格偏移）、今天 / 选中态、任务计数与打卡圆点、负荷条；右侧日详情展示任务、打卡状态、新建表单；双击日期把焦点移到新任务输入框；任务可拖到任意日期改期；勾选框完成并按计划分钟记录弱证据。`App.tsx` 增加 `/calendar` 路由；`Layout.tsx` 在「今日」与「知识树」之间加入「日历」，并在日历路由下使用 `content-wide`。
- **样式**：`styles.css` 追加月历网格、日详情、任务卡与窄屏单列布局（`max-width: 900px`），沿用暖纸色与单一墨绿 accent。
- **错误与忙碌态**：日历的创建 / 完成 / 改期均包裹 try/catch，失败时显示「添加失败 / 完成失败 / 改期失败：<领域错误码>」；创建按钮在途显示「添加中…」并禁用，勾选框在途禁用，拖拽在改期请求在途时禁用。改期失败不会乐观移动任务，因此任务停在原日期并同时显示失败原因，不会静默回弹。另用请求序号保证快速切月 / 切日时旧响应不会覆盖新视图。

### 验证
- `npm test -- tests/calendar.test.ts`：RED（找不到 `calendarService`）→ GREEN，4 passed（1 file；简报写 3 passed，实际测试文件含 4 个 it）
- `npm test`：49 passed（12 files），无回归（Task 11 后基线 45 passed / 11 files）
- `npm run typecheck`：通过，无错误
- `npm run build`：通过（main / preload / renderer 三段产物均生成，renderer 33 modules）
- 手动验收未在本轮执行：渲染层无 DOM 测试与 GUI 自动化，需人工 `npm run dev` 按简报 Step 9 复核网格偏移、双击聚焦、拖拽改期、勾选计数与今日页同步。

### 决策 / 变化
- `listDailyLogsBetween` 已在 Task 9 提前实现并带端点过滤，本任务复用而不重写；`dailyLogRepo.ts` 本任务无改动。
- 简报的 `CalendarPage` 示例没有忙碌态和错误文案，本轮按 Task 11 的约定补齐；同时把「读取失败」与「操作失败」分开，避免刷新错误遮蔽操作错误。
- 双击新建沿用简报行为：只把焦点移到输入框，不弹窗；提交仍使用右侧当前选中日期。
- 已完成任务仍可拖拽改期（与简报一致），未额外限制；若后续认为历史完成记录不应移动，可在服务层加状态校验。
- 未新增依赖、未改 schema、未改领域类型；`planService.ts` 仍未导入 `dailyLogRepo`，日历服务是独立读取路径。

### 下次从这里开始
- Task 13：集成测试、README 与最终验收。人工跑 `npm run dev` 时重点看：月初空格与周一对齐、150% 缩放下的 7 列可读性、拖拽期间失败提示、以及完成日历任务后今日页完成数是否同步。

---

## 2026-10-18 · P0 完成

### 做了什么
- 完成 P0 全部 13 个任务：脚手架、SQLite、目标树、onboarding、规则规划、任务完成、打卡、知识树、备份、IPC、今日/日历/知识树三个主界面。
- 新增端到端测试 `tests/integration.test.ts`：直接驱动 `createHandlers({ db, dbPath, backupDir, version })`，从空库 onboarding 一路验证今日计划、完成任务、打卡回读、知识树掌握度、手动任务新建/改期、月历计数与备份导出，并断言 JSON 中 `dailyLog.note` 为 `null`。不导入 Electron，不启动窗口。
- 新增 `README.md`：范围、环境、开发、测试、数据位置与文档入口。
- 复核 P0 计划勾选项：代码与自动化验证覆盖的步骤已勾选；依赖人工运行 Electron 的步骤保持未勾选，并在计划头部列为待人工验收。

### 验证
- `npm test`：50 passed（13 files）
- `npm run typecheck`：无错误
- `npm run build`：成功（main / preload / renderer 三段产物均生成）
- 手动验收：未在本轮执行。`npm run dev` 的窗口内检查（首次引导、主线视觉层级、150% 缩放、日历双击/拖拽、设置页导出、关闭重开数据仍在）仍需人工按计划 Task 13 Step 4 清单复核。

### 决策 / 变化
- 集成测试按简报逐字实现，并保留 Task 9 的备份脱敏断言：JSON 不含日记原文，`.db` 副本仍保留。
- 未新增依赖、未改 schema、未改业务代码；`planService.ts` 仍未导入 `dailyLogRepo`，代码中无网络请求与密钥。
- 计划文件只改勾选状态并追加一行待人工验收说明，未改写原有步骤与代码块。

### 下次从这里开始
- P1：使用记录采集与时间线；先单独写 P1 设计/计划，不要直接改 P0 schema。
- 在开始 P1 前，人工完成 P0 的 `npm run dev` 验收清单。
