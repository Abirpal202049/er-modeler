import { useCallback } from 'react';
import type { EdgeProps } from '@xyflow/react';
import {
  useStore,
  getBezierPath,
  BaseEdge,
  getSmoothStepPath,
  getStraightPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { getEdgeParams } from '../utils/floatingEdges';

function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  markerStart,
  style,
  data,
  label,
  labelStyle,
  labelShowBg,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}: EdgeProps) {
  const sourceNode = useStore(useCallback((store) => store.nodeLookup.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeLookup.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  // Determine which path function to use based on edge type
  // Default to smoothstep if no type specified
  const edgeType = data?.type || 'smoothstep';

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  switch (edgeType) {
    case 'bezier':
      [edgePath, labelX, labelY] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetX: tx,
        targetY: ty,
        targetPosition: targetPos,
      });
      break;

    case 'straight':
    case 'default':
      [edgePath, labelX, labelY] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
      });
      break;

    case 'step':
    case 'smoothstep':
    default:
      [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetX: tx,
        targetY: ty,
        targetPosition: targetPos,
        borderRadius: typeof data?.borderRadius === 'number' ? data.borderRadius : 8,
      });
      break;
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              ...labelStyle,
            }}
            className="nodrag nopan"
          >
            {labelShowBg !== false && (
              <div
                style={{
                  position: 'absolute',
                  inset: `-${labelBgPadding?.[0] ?? 2}px -${labelBgPadding?.[1] ?? 4}px`,
                  borderRadius: labelBgBorderRadius ?? 2,
                  zIndex: -1,
                  ...labelBgStyle,
                }}
              />
            )}
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default FloatingEdge;
