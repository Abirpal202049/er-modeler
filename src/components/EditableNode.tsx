import { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTheme } from '../contexts/ThemeContext';

export interface EditableNodeData {
  label: string;
  onLabelChange?: (nodeId: string, newLabel: string) => void;
}

export default function EditableNode({ data, id }: NodeProps) {
  const { colors } = useTheme();
  const nodeData = data as unknown as EditableNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState<string>(nodeData.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (nodeData.onLabelChange) {
      nodeData.onLabelChange(id, label);
    }
  }, [id, label, nodeData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (nodeData.onLabelChange) {
        nodeData.onLabelChange(id, label);
      }
    } else if (e.key === 'Escape') {
      setLabel(nodeData.label || '');
      setIsEditing(false);
    }
  }, [id, label, nodeData]);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="relative group"
    >
      {/* Connection Handles - Clean and minimal */}
      <Handle 
        type="target" 
        position={Position.Top}
        className="w-3! h-3! border-2! rounded-full! transition-all duration-300 hover:scale-150! opacity-0 group-hover:opacity-100"
        style={{ 
          backgroundColor: colors.nodeBorder,
          borderColor: colors.background,
          top: '-6px',
        }}
      />
      
      {/* Node Container - Clean and professional */}
      <div
        className="min-w-40 max-w-[280px] rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border cursor-pointer"
        style={{
          backgroundColor: colors.nodeBg,
          borderColor: colors.nodeBorder,
        }}
      >
        {/* Simple content area - no header clutter */}
        <div className="px-4 py-3">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Node name"
              className="nodrag w-full bg-transparent border-none outline-none text-center font-medium text-sm"
              style={{ color: colors.nodeText }}
            />
          ) : (
            <div 
              className="font-medium text-sm select-none text-center whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ color: colors.nodeText }}
            >
              {label}
            </div>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        className="w-3! h-3! border-2! rounded-full! transition-all duration-300 hover:scale-150! opacity-0 group-hover:opacity-100"
        style={{ 
          backgroundColor: colors.nodeBorder,
          borderColor: colors.background,
          bottom: '-6px',
        }}
      />
    </div>
  );
}
