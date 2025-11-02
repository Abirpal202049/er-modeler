import { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react';
import { useTheme } from '../contexts/ThemeContext';

export interface ImageNodeData {
  imageUrl?: string;
  label?: string;
  onLabelChange?: (nodeId: string, newLabel: string) => void;
  _hasImage?: boolean;
}

export default function ImageNode({ data, id, selected }: NodeProps) {
  const { colors } = useTheme();
  const nodeData = data as unknown as ImageNodeData;
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState<string>(nodeData.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleLabelDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="relative group">
      {/* Node Resizer - visible when selected */}
      <NodeResizer
        minWidth={100}
        minHeight={100}
        isVisible={selected}
        lineClassName="border-2"
        handleClassName="w-3 h-3 rounded-full"
        color={colors.nodeBorder}
      />

      {/* Connection Handles */}
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
      
      {/* Image Container */}
      <div
        className="w-full h-full rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-xl border overflow-hidden flex flex-col"
        style={{
          backgroundColor: colors.nodeBg,
          borderColor: colors.nodeBorder,
        }}
      >
        {!nodeData.imageUrl ? (
          <div 
            className="flex-1 flex flex-col items-center justify-center text-sm min-h-48 gap-2"
            style={{ color: colors.nodeText }}
          >
            <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="opacity-75">Image not persisted</span>
            <span className="text-xs opacity-50">(Re-import to display)</span>
          </div>
        ) : imageError ? (
          <div 
            className="flex-1 flex items-center justify-center text-sm min-h-48"
            style={{ color: colors.nodeText }}
          >
            Failed to load image
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex items-center justify-center p-2">
            <img
              src={nodeData.imageUrl}
              alt={nodeData.label || 'Imported image'}
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          </div>
        )}
        
        {/* Editable label */}
        <div 
          className="px-3 py-2 text-center text-sm font-medium border-t cursor-pointer"
          style={{ 
            color: colors.nodeText,
            borderColor: colors.nodeBorder,
          }}
          onDoubleClick={handleLabelDoubleClick}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="File name"
              className="nodrag w-full bg-transparent border-none outline-none text-center font-medium text-sm"
              style={{ color: colors.nodeText }}
            />
          ) : (
            <div className="select-none whitespace-nowrap overflow-hidden text-ellipsis">
              {label || 'Unnamed'}
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
