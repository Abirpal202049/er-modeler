import { useTheme } from '../contexts/ThemeContext';

interface UndoRedoButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function UndoRedoButtons({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: UndoRedoButtonsProps) {
  const { colors } = useTheme();

  const buttonStyle = (enabled: boolean): React.CSSProperties => ({
    position: 'relative',
    padding: '8px 12px',
    background: colors.nodeBg,
    color: enabled ? colors.foreground : colors.secondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.5,
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 10,
      }}
    >
      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={buttonStyle(canUndo)}
        title="Undo (Ctrl+Z)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
        </svg>
        Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        style={buttonStyle(canRedo)}
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
        </svg>
        Redo
      </button>
    </div>
  );
}
