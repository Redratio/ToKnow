import { useEffect, useState } from 'react';
import type { TreeSubject } from '../../../shared/types';
import { api } from '../api';
import MasteryBar from '../components/MasteryBar';
import TreeNode from '../components/TreeNode';

export default function TreePage() {
  const [tree, setTree] = useState<TreeSubject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTree()
      .then(setTree)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoaded(true));
  }, []);

  if (error) return <div className="center-note">读取知识树失败：{error}</div>;
  if (!loaded) return <div className="center-note">正在读取知识树…</div>;

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>目标树</h1>
          <p className="muted">颜色越深，掌握度越高。P0 由自评与任务完成更新。</p>
        </div>
      </div>

      {tree.length === 0 && (
        <div className="empty">暂无知识树数据，请重新完成引导。</div>
      )}

      {tree.map((subject) => (
        <section key={subject.id} className="subject-block">
          <div className="subject-head">
            <h2 style={{ color: subject.color }}>{subject.name}</h2>
            <MasteryBar
              mastery={
                subject.modules.flatMap((m) => m.nodes).length === 0
                  ? 0
                  : subject.modules
                      .flatMap((m) => m.nodes)
                      .reduce((sum, n) => sum + n.state.mastery, 0) /
                    subject.modules.flatMap((m) => m.nodes).length
              }
            />
          </div>
          {subject.modules.map((module) => (
            <div key={module.id} className="module-block">
              <h3>
                {module.name}
                <span className="muted"> · {module.examWeight} 分</span>
              </h3>
              <ul className="tree-root">
                {module.nodes.map((node) => (
                  <TreeNode key={node.id} node={node} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </section>
  );
}
