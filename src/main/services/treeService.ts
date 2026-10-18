import type Database from 'better-sqlite3';
import type {
  KnowledgeNode,
  TreeModule,
  TreeNode,
  TreeSubject
} from '../../shared/types';
import { mapNode, mapState } from '../db/rows';
import {
  listModules,
  listNodes,
  listStates,
  listSubjects
} from '../repositories/treeRepo';

export function getTree(
  db: Database.Database,
  profileId: string
): TreeSubject[] {
  const subjects = listSubjects(db, profileId);
  const modules = listModules(db, profileId);
  const nodeRows = listNodes(db, profileId);
  const states = new Map(
    listStates(db, profileId).map((row) => [row.node_id, mapState(row)])
  );

  const nodeMap = new Map<string, TreeNode>();
  for (const row of nodeRows) {
    const node: KnowledgeNode = mapNode(row);
    const state = states.get(node.id) ?? {
      nodeId: node.id,
      selfRating: 0,
      mastery: 0,
      confidence: 0,
      lastStudiedAt: null,
      nextReviewAt: null,
      reviewCount: 0,
      updatedBy: 'self' as const,
      updatedAt: 0
    };
    nodeMap.set(node.id, { ...node, state, children: [] });
  }

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    }
  }

  const moduleMap = new Map<string, TreeModule>();
  for (const module of modules) {
    moduleMap.set(module.id, { ...module, nodes: [] });
  }
  for (const node of nodeMap.values()) {
    if (!node.parentId) moduleMap.get(node.moduleId)?.nodes.push(node);
  }

  const subjectMap = new Map<string, TreeSubject>();
  for (const subject of subjects) {
    subjectMap.set(subject.id, { ...subject, modules: [] });
  }
  for (const module of moduleMap.values()) {
    subjectMap.get(module.subjectId)?.modules.push(module);
  }

  const sortNodes = (nodes: TreeNode[]): void => {
    nodes.sort((a, b) => a.orderIndex - b.orderIndex);
    nodes.forEach((n) => sortNodes(n.children));
  };
  for (const subject of subjectMap.values()) {
    subject.modules.sort((a, b) => a.orderIndex - b.orderIndex);
    subject.modules.forEach((m) => sortNodes(m.nodes));
  }

  return [...subjectMap.values()];
}
