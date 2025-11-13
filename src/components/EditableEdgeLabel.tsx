import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface EditableEdgeLabelProps {
  label: string | undefined;
  labelX: number;
  labelY: number;
  labelStyle?: React.CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: React.CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  onLabelChange: (newLabel: string) => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  isEditing: boolean;
}

function EditableEdgeLabel({
  label,
  labelX,
  labelY,
  labelStyle,
  labelShowBg = true,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
  onLabelChange,
  onStartEditing,
  onStopEditing,
  isEditing,
}: EditableEdgeLabelProps) {
  const { colors } = useTheme();
  const [tempLabel, setTempLabel] = useState(label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    // Validate: reject empty strings or whitespace-only strings
    const trimmedLabel = tempLabel.trim();
    if (trimmedLabel) {
      onLabelChange(trimmedLabel);
    } else {
      // If empty or whitespace, remove the label
      onLabelChange('');
    }
    onStopEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTempLabel(label || '');
      onStopEditing();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEditing();
  };

  // Only render if there's a label or if currently editing
  if (!label && !isEditing) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        pointerEvents: 'all',
        ...labelStyle,
      }}
      className="nodrag nopan"
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={tempLabel}
          onChange={(e) => setTempLabel(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          size={Math.max(tempLabel.length || 1, 1)}
          style={{
            border: 'none',
            outline: 'none',
            background: colors.background,
            fontSize: '12px',
            padding: '4px 8px',
            textAlign: 'center',
            color: colors.foreground,
          }}
        />
      ) : (
        <div
          style={{
            fontSize: '12px',
            padding: '4px 8px',
            cursor: 'text',
            textAlign: 'center',
            background: colors.background,
            color: colors.foreground,
            width: 'fit-content',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export default EditableEdgeLabel;
