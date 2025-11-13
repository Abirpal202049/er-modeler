import { useCallback } from 'react';
import type { ConnectionLineComponentProps } from '@xyflow/react';
import { getSmoothStepPath } from '@xyflow/react';
import { getNodeCenter } from '../utils/floatingEdges';

function FloatingConnectionLine({
  toX,
  toY,
  fromPosition,
  fromNode,
}: ConnectionLineComponentProps) {
  const targetNode = useCallback(() => {
    // Create a mock target node at the cursor position
    return {
      id: 'connection-target',
      position: { x: toX, y: toY },
      measured: { width: 1, height: 1 },
    };
  }, [toX, toY]);

  if (!fromNode) {
    return null;
  }

  const fromNodeCenter = getNodeCenter(fromNode);
  const target = targetNode();

  const [edgePath] = getSmoothStepPath({
    sourceX: fromNodeCenter.x,
    sourceY: fromNodeCenter.y,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: fromPosition,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="#b1b1b7"
        strokeWidth={1.5}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke="#b1b1b7"
        strokeWidth={1.5}
      />
    </g>
  );
}

export default FloatingConnectionLine;
