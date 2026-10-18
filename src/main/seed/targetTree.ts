import type Database from 'better-sqlite3';

export interface SeedChapter {
  title: string;
  examWeight: number;
  targetMastery: number;
}

export interface SeedModule {
  name: string;
  examWeight: number;
  chapters: SeedChapter[];
}

export interface SeedSubject {
  code: string;
  name: string;
  examWeight: number;
  color: string;
  modules: SeedModule[];
}

export const TARGET_TREE: SeedSubject[] = [
  {
    code: 'math',
    name: '数学一',
    examWeight: 150,
    color: '#3B6EA5',
    modules: [
      {
        name: '高等数学',
        examWeight: 82,
        chapters: [
          { title: '函数、极限与连续', examWeight: 12, targetMastery: 4 },
          { title: '一元函数微分学', examWeight: 14, targetMastery: 4 },
          { title: '一元函数积分学', examWeight: 14, targetMastery: 4 },
          { title: '多元函数微分学', examWeight: 10, targetMastery: 4 },
          { title: '多元函数积分学', examWeight: 12, targetMastery: 4 },
          { title: '无穷级数', examWeight: 10, targetMastery: 4 },
          { title: '常微分方程', examWeight: 10, targetMastery: 3 }
        ]
      },
      {
        name: '线性代数',
        examWeight: 34,
        chapters: [
          { title: '行列式', examWeight: 5, targetMastery: 4 },
          { title: '矩阵', examWeight: 6, targetMastery: 4 },
          { title: '向量', examWeight: 5, targetMastery: 3 },
          { title: '线性方程组', examWeight: 6, targetMastery: 4 },
          { title: '特征值与特征向量', examWeight: 6, targetMastery: 4 },
          { title: '二次型', examWeight: 6, targetMastery: 3 }
        ]
      },
      {
        name: '概率论与数理统计',
        examWeight: 34,
        chapters: [
          { title: '随机事件与概率', examWeight: 5, targetMastery: 3 },
          { title: '一维随机变量', examWeight: 6, targetMastery: 4 },
          { title: '多维随机变量', examWeight: 6, targetMastery: 4 },
          { title: '数字特征', examWeight: 6, targetMastery: 4 },
          { title: '大数定律与中心极限定理', examWeight: 5, targetMastery: 3 },
          { title: '数理统计', examWeight: 6, targetMastery: 3 }
        ]
      }
    ]
  },
  {
    code: 'english',
    name: '英语一',
    examWeight: 100,
    color: '#8A6D3B',
    modules: [
      {
        name: '阅读理解',
        examWeight: 40,
        chapters: [
          { title: '传统阅读', examWeight: 30, targetMastery: 4 },
          { title: '新题型', examWeight: 10, targetMastery: 3 }
        ]
      },
      {
        name: '写作',
        examWeight: 30,
        chapters: [
          { title: '小作文', examWeight: 10, targetMastery: 4 },
          { title: '大作文', examWeight: 20, targetMastery: 4 }
        ]
      },
      {
        name: '翻译',
        examWeight: 15,
        chapters: [{ title: '长难句与翻译', examWeight: 15, targetMastery: 3 }]
      },
      {
        name: '完形填空',
        examWeight: 10,
        chapters: [{ title: '完形填空', examWeight: 10, targetMastery: 3 }]
      },
      {
        name: '词汇与长难句',
        examWeight: 5,
        chapters: [{ title: '核心词汇', examWeight: 5, targetMastery: 4 }]
      }
    ]
  },
  {
    code: 'politics',
    name: '政治',
    examWeight: 100,
    color: '#9A4F4F',
    modules: [
      { name: '马克思主义基本原理', examWeight: 24, chapters: [{ title: '马原', examWeight: 24, targetMastery: 3 }] },
      { name: '毛泽东思想和中国特色社会主义理论体系', examWeight: 30, chapters: [{ title: '毛中特', examWeight: 30, targetMastery: 3 }] },
      { name: '中国近现代史纲要', examWeight: 14, chapters: [{ title: '史纲', examWeight: 14, targetMastery: 3 }] },
      { name: '思想道德与法治', examWeight: 16, chapters: [{ title: '思修法基', examWeight: 16, targetMastery: 3 }] },
      { name: '形势与政策', examWeight: 16, chapters: [{ title: '时政', examWeight: 16, targetMastery: 3 }] }
    ]
  },
  {
    code: '825',
    name: '825 电气科学基础',
    examWeight: 150,
    color: '#3F7A6B',
    modules: [
      {
        name: '电路理论（70 分）',
        examWeight: 70,
        chapters: [
          { title: '电路基本概念与分析方法', examWeight: 15, targetMastery: 4 },
          { title: '电路定理', examWeight: 10, targetMastery: 4 },
          { title: '动态电路暂态分析', examWeight: 12, targetMastery: 4 },
          { title: '正弦稳态与三相电路', examWeight: 12, targetMastery: 4 },
          { title: '二端口网络', examWeight: 7, targetMastery: 3 },
          { title: '分布参数电路', examWeight: 6, targetMastery: 3 },
          { title: '非线性电路与计算机辅助分析', examWeight: 8, targetMastery: 3 }
        ]
      },
      {
        name: '电磁场（40 分）',
        examWeight: 40,
        chapters: [
          { title: '矢量分析', examWeight: 5, targetMastery: 4 },
          { title: '静电场', examWeight: 8, targetMastery: 4 },
          { title: '恒定电场', examWeight: 5, targetMastery: 3 },
          { title: '恒定磁场', examWeight: 7, targetMastery: 4 },
          { title: '边值问题', examWeight: 8, targetMastery: 3 },
          { title: '时变电磁场', examWeight: 7, targetMastery: 3 }
        ]
      },
      {
        name: '电机学（40 分）',
        examWeight: 40,
        chapters: [
          { title: '变压器', examWeight: 12, targetMastery: 4 },
          { title: '直流电机', examWeight: 12, targetMastery: 4 },
          { title: '交流电机', examWeight: 16, targetMastery: 4 }
        ]
      }
    ]
  }
];

export function seedTargetTree(db: Database.Database, profileId: string): void {
  const existing = db
    .prepare('SELECT COUNT(*) AS c FROM subject WHERE profile_id = ?')
    .get(profileId) as { c: number };
  if (existing.c > 0) return;

  const now = Date.now();
  const insertSubject = db.prepare(
    `INSERT INTO subject
      (id, profile_id, name, code, exam_weight, color, order_index,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  );
  const insertModule = db.prepare(
    `INSERT INTO module
      (id, subject_id, name, exam_weight, order_index,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  );
  const insertNode = db.prepare(
    `INSERT INTO knowledge_node
      (id, module_id, parent_id, title, kind, exam_weight, difficulty,
       target_mastery, order_index, syllabus_version, description,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, NULL, ?, 'chapter', ?, 3, ?, ?, '2026', NULL, ?, ?, NULL, ?)`
  );
  const insertState = db.prepare(
    `INSERT INTO user_node_state
      (profile_id, node_id, self_rating, mastery, confidence,
       last_studied_at, next_review_at, review_count, updated_by, updated_at)
     VALUES (?, ?, 0, 0, 0, NULL, NULL, 0, 'self', ?)`
  );

  const tx = db.transaction(() => {
    TARGET_TREE.forEach((subject, subjectIndex) => {
      const subjectId = `sub_${subjectIndex}`;
      insertSubject.run(
        subjectId,
        profileId,
        subject.name,
        subject.code,
        subject.examWeight,
        subject.color,
        subjectIndex,
        now,
        now,
        'seed'
      );

      subject.modules.forEach((module, moduleIndex) => {
        const moduleId = `mod_${subjectIndex}_${moduleIndex}`;
        insertModule.run(
          moduleId,
          subjectId,
          module.name,
          module.examWeight,
          moduleIndex,
          now,
          now,
          'seed'
        );

        module.chapters.forEach((chapter, chapterIndex) => {
          const nodeId = `node_${subjectIndex}_${moduleIndex}_${chapterIndex}`;
          insertNode.run(
            nodeId,
            moduleId,
            chapter.title,
            chapter.examWeight,
            chapter.targetMastery,
            chapterIndex,
            now,
            now,
            'seed'
          );
          insertState.run(profileId, nodeId, now);
        });
      });
    });
  });

  tx();
}

export function countSeeded(
  db: Database.Database,
  profileId: string
): { subjects: number; modules: number; nodes: number } {
  const subjects = db
    .prepare('SELECT COUNT(*) AS c FROM subject WHERE profile_id = ?')
    .get(profileId) as { c: number };
  const modules = db
    .prepare(
      `SELECT COUNT(*) AS c FROM module m
       JOIN subject s ON s.id = m.subject_id
       WHERE s.profile_id = ?`
    )
    .get(profileId) as { c: number };
  const nodes = db
    .prepare(
      `SELECT COUNT(*) AS c FROM knowledge_node n
       JOIN module m ON m.id = n.module_id
       JOIN subject s ON s.id = m.subject_id
       WHERE s.profile_id = ?`
    )
    .get(profileId) as { c: number };
  return { subjects: subjects.c, modules: modules.c, nodes: nodes.c };
}
