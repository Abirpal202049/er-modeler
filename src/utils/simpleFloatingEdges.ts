import type { Node } from '@xyflow/react';
import { Position } from '@xyflow/react';

// Get the center position of a node
function getNodeCenter(node: Node) {
  return {
    x: node.position.x + (node.measured?.width ?? 0) / 2,
    y: node.position.y + (node.measured?.height ?? 0) / 2,
  };
}

// Determine handle positions based on node centers
function getParams(nodeA: Node, nodeB: Node) {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let position: Position;

  // Determine position based on which difference is greater
  if (horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right;
  } else {
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position] as const;
}

// Get handle coordinates by position
function getHandleCoordsByPosition(node: Node, handlePosition: Position): [number, number] {
  const width = node.measured?.width ?? 0;
  const height = node.measured?.height ?? 0;

  let x = node.position.x;
  let y = node.position.y;

  // Calculate handle position based on the specified position
  switch (handlePosition) {
    case Position.Top:
      x += width / 2;
      break;
    case Position.Right:
      x += width;
      y += height / 2;
      break;
    case Position.Bottom:
      x += width / 2;
      y += height;
      break;
    case Position.Left:
      y += height / 2;
      break;
  }

  return [x, y];
}

export function getEdgeParams(source: Node, target: Node) {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}
