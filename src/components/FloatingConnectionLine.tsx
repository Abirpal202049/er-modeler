import type { ConnectionLineComponentProps } from '@xyflow/react';
import { getSmoothStepPath } from '@xyflow/react';
import { getNodeCenter } from '../utils/floatingEdges';

function FloatingConnectionLine({
  toX,
  toY,
  fromPosition,
  fromNode,
}: ConnectionLineComponentProps) {
  if (!fromNode) {
    return null;
  }

  const fromNodeCenter = getNodeCenter(fromNode);

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
