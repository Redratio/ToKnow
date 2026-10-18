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
