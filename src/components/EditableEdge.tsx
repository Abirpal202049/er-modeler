import type { EdgeProps } from '@xyflow/react';
import {
  getBezierPath,
  BaseEdge,
  getSmoothStepPath,
  getStraightPath,
  getSimpleBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import EditableEdgeLabel from './EditableEdgeLabel';

/**
 * Wrapper component for normal (non-floating) edges that adds editable label support
 */
function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
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
  // Determine which path function to use based on edge data type
  const edgeType = data?.type || 'smoothstep';

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  switch (edgeType) {
    case 'bezier':
      [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
      break;

    case 'straight':
    case 'default':
      [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
      break;

    case 'step':
      [edgePath, labelX, labelY] = getSimpleBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
      break;

    case 'smoothstep':
    default:
      [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: typeof data?.borderRadius === 'number' ? data.borderRadius : 8,
      });
      break;
  }

  const isEditing = data?.isEditing || false;
  const onLabelChange = data?.onLabelChange;
  const onStartEditing = data?.onStartEditing;
  const onStopEditing = data?.onStopEditing;

  // Show label component if there's a label or currently editing
  const showLabel = (label || isEditing) && onLabelChange && onStartEditing && onStopEditing;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
      />
      {showLabel && (
        <EdgeLabelRenderer>
          <EditableEdgeLabel
            label={typeof label === 'string' ? label : undefined}
            labelX={labelX}
            labelY={labelY}
            labelStyle={labelStyle}
            labelShowBg={labelShowBg}
            labelBgStyle={labelBgStyle}
            labelBgPadding={labelBgPadding}
            labelBgBorderRadius={labelBgBorderRadius}
            onLabelChange={(newLabel) => onLabelChange(id, newLabel)}
            onStartEditing={() => onStartEditing(id)}
            onStopEditing={onStopEditing}
            isEditing={isEditing}
          />
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default EditableEdge;
