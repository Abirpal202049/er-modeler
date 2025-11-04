interface EdgeContextMenuProps {
  id: string;
  top: number;
  left: number;
  edge: {
    type?: string;
    animated?: boolean;
    style?: {
      stroke?: string;
      [key: string]: any;
    };
  };
  onClose: () => void;
  onChangeType: (edgeId: string, type: string) => void;
  onToggleAnimation: (edgeId: string) => void;
  onChangeColor: (edgeId: string, color: string) => void;
  onDelete: (edgeId: string) => void;
}

export default function EdgeContextMenu({ 
  id, 
  top, 
  left, 
  edge,
  onClose, 
  onChangeType,
  onToggleAnimation,
  onChangeColor,
  onDelete,
}: EdgeContextMenuProps) {
  const edgeTypes = [
    { value: 'default', label: 'Straight' },
    { value: 'smoothstep', label: 'Smooth Step' },
    { value: 'step', label: 'Step' },
    { value: 'bezier', label: 'Bezier' },
  ];

  const edgeColors = [
    { value: '#94a3b8', label: 'Gray' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Red' },
  ];

  const handleTypeChange = (type: string) => {
    onChangeType(id, type);
    onClose();
  };

  const handleToggleAnimation = () => {
    onToggleAnimation(id);
  };

  const handleChangeColor = (color: string) => {
    onChangeColor(id, color);
  };

  const handleDelete = () => {
    onDelete(id);
    onClose();
  };

  return (
    <>
      {/* Context Menu */}
      <div
        className="fixed z-50 min-w-[180px] rounded shadow-2xl overflow-hidden"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          backgroundColor: '#2a2a2a',
          border: '1px solid #3a3a3a',
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div 
          className="px-2.5 py-1.5 text-xs font-medium"
          style={{ 
            backgroundColor: '#3a3a3a',
            color: '#e0e0e0',
          }}
        >
          Edge Context Menu
        </div>
        
        {/* Edge Type Options */}
        <div className="py-0.5" style={{ backgroundColor: '#2a2a2a' }}>
          {edgeTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className="w-full px-3 py-1.5 text-left text-xs transition-all duration-100 flex items-center justify-between"
              style={{
                color: '#e0e0e0',
                backgroundColor: edge.type === type.value ? '#4a7ba7' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (edge.type !== type.value) {
                  e.currentTarget.style.backgroundColor = '#3a3a3a';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = edge.type === type.value ? '#4a7ba7' : 'transparent';
              }}
            >
              <span className="text-xs">{type.label}</span>
              {edge.type === type.value && (
                <span className="text-xs ml-1.5" style={{ color: '#ffffff' }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: '#1a1a1a' }} />

        {/* Animation Toggle */}
        <div className="py-0.5" style={{ backgroundColor: '#2a2a2a' }}>
          <button
            onClick={handleToggleAnimation}
            className="w-full px-3 py-1.5 text-left text-xs transition-all duration-100 flex items-center justify-between"
            style={{
              color: '#e0e0e0',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span>Animation</span>
            <span 
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ 
                backgroundColor: edge.animated ? '#4a7ba7' : '#3a3a3a',
                color: edge.animated ? '#ffffff' : '#999999',
              }}
            >
              {edge.animated ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: '#1a1a1a' }} />

        {/* Color Options */}
        <div className="py-1.5 px-3" style={{ backgroundColor: '#2a2a2a' }}>
          <div className="text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
            Edge Color
          </div>
          <div className="flex gap-2 justify-center">
            {edgeColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleChangeColor(color.value)}
                className="w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110"
                style={{
                  backgroundColor: color.value,
                  borderColor: edge.style?.stroke === color.value ? '#ffffff' : '#3a3a3a',
                  boxShadow: edge.style?.stroke === color.value ? `0 0 0 2px ${color.value}` : 'none',
                }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ backgroundColor: '#1a1a1a' }} />

        {/* Delete Option */}
        <div className="py-0.5" style={{ backgroundColor: '#2a2a2a' }}>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-1.5 text-left text-xs transition-all duration-100 flex items-center justify-between"
            style={{
              color: '#ff6b6b',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span>Delete Edge</span>
            <span 
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ 
                backgroundColor: '#3a3a3a',
                color: '#999999',
              }}
            >
              Delete
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
