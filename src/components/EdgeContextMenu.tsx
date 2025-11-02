interface EdgeContextMenuProps {
  id: string;
  top: number;
  left: number;
  edge: {
    type?: string;
    animated?: boolean;
  };
  onClose: () => void;
  onChangeType: (edgeId: string, type: string) => void;
  onToggleAnimation: (edgeId: string) => void;
}

export default function EdgeContextMenu({ 
  id, 
  top, 
  left, 
  edge,
  onClose, 
  onChangeType,
  onToggleAnimation,
}: EdgeContextMenuProps) {
  const edgeTypes = [
    { value: 'default', label: 'Straight' },
    { value: 'smoothstep', label: 'Smooth Step' },
    { value: 'step', label: 'Step' },
    { value: 'bezier', label: 'Bezier' },
  ];

  const handleTypeChange = (type: string) => {
    onChangeType(id, type);
    onClose();
  };

  const handleToggleAnimation = () => {
    onToggleAnimation(id);
  };

  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        className="fixed z-50 min-w-[180px] rounded shadow-2xl overflow-hidden"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          backgroundColor: '#2a2a2a',
          border: '1px solid #3a3a3a',
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
      </div>
    </>
  );
}
