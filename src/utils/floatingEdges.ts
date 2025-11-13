import type { Node } from '@xyflow/react';
import { Position } from '@xyflow/react';

// Calculate the center point of a node
export function getNodeCenter(node: Node) {
  return {
    x: node.position.x + (node.measured?.width ?? 0) / 2,
    y: node.position.y + (node.measured?.height ?? 0) / 2,
  };
}

// Calculate the intersection point between two nodes
export function getNodeIntersection(intersectionNode: Node, targetNode: Node) {
  const {
    measured: { width: intersectionNodeWidth = 0, height: intersectionNodeHeight = 0 } = {},
  } = intersectionNode;
  const intersectionNodePosition = intersectionNode.position;

  const targetPosition = targetNode.position;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + (targetNode.measured?.width ?? 0) / 2;
  const y1 = targetPosition.y + (targetNode.measured?.height ?? 0) / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// Determine which position (top, right, bottom, left) the edge should use based on the intersection point
export function getEdgePosition(node: Node, intersectionPoint: { x: number; y: number }) {
  const n = { ...node.position, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  const width = node.measured?.width ?? 0;
  const height = node.measured?.height ?? 0;

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= ny + height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// Get all edge parameters needed for rendering
export function getEdgeParams(source: Node, target: Node) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
