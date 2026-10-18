import type { TreeNode as TreeNodeType } from '../../../shared/types';
import MasteryBar from './MasteryBar';

export default function TreeNode({ node }: { node: TreeNodeType }) {
  return (
    <li className="tree-node">
      <div className="tree-node-row">
        <span className="tree-node-title">{node.title}</span>
        <span className="tree-node-weight">权重 {node.examWeight}</span>
        <MasteryBar mastery={node.state.mastery} />
      </div>
      {node.children.length > 0 && (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
